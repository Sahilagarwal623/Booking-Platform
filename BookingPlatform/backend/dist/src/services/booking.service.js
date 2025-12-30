"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const database_1 = require("../config/database");
const middleware_1 = require("../middleware");
const prisma_1 = require("../../generated/prisma");
/**
 * Booking Service
 * Handles booking creation, confirmation, and cancellation with proper locking
 */
class BookingService {
    /**
     * Create a pending booking after seats are held
     * Uses optimistic locking with version field
     */
    static createBooking(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, eventId, seatIds } = input;
            return yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                // Step 1: Verify seats are held by this user
                const seats = yield tx.seat.findMany({
                    where: {
                        id: { in: seatIds },
                        eventId,
                        heldBy: userId,
                        status: prisma_1.SeatStatus.HELD,
                        heldUntil: { gt: new Date() },
                    },
                    include: {
                        section: true,
                    },
                });
                if (seats.length !== seatIds.length) {
                    throw new middleware_1.ApiError(400, 'Some seats are no longer held by you. Please select seats again.');
                }
                // Step 2: Calculate pricing
                const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
                const taxAmount = totalAmount * 0.18; // 18% GST
                const finalAmount = totalAmount + taxAmount;
                // Step 3: Set booking expiry (same as seat hold or slightly before)
                const firstSeatExpiry = (_a = seats[0]) === null || _a === void 0 ? void 0 : _a.heldUntil;
                if (!firstSeatExpiry) {
                    throw new middleware_1.ApiError(400, 'Seat hold expiry not found');
                }
                const minExpiry = seats.reduce((min, seat) => (seat.heldUntil && seat.heldUntil < min ? seat.heldUntil : min), firstSeatExpiry);
                // Step 4: Create booking
                const booking = yield tx.booking.create({
                    data: {
                        userId,
                        eventId,
                        status: prisma_1.BookingStatus.PENDING,
                        totalAmount,
                        taxAmount,
                        finalAmount,
                        expiresAt: minExpiry,
                        items: {
                            create: seats.map((seat) => ({
                                seatId: seat.id,
                                price: seat.price,
                            })),
                        },
                    },
                    include: {
                        items: {
                            include: {
                                seat: {
                                    include: {
                                        section: true,
                                    },
                                },
                            },
                        },
                        event: {
                            select: {
                                id: true,
                                title: true,
                                eventDate: true,
                                venue: {
                                    select: {
                                        name: true,
                                        address: true,
                                    },
                                },
                            },
                        },
                    },
                });
                return booking;
            }), {
                timeout: 15000,
            });
        });
    }
    /**
     * Confirm booking after successful payment
     * Uses optimistic locking to prevent double confirmation
     */
    static confirmBooking(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingId, paymentId, paymentMethod } = input;
            return yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Step 1: Get booking with version for optimistic locking
                const booking = yield tx.booking.findUnique({
                    where: { id: bookingId },
                    include: {
                        items: true,
                    },
                });
                if (!booking) {
                    throw new middleware_1.ApiError(404, 'Booking not found');
                }
                if (booking.status !== prisma_1.BookingStatus.PENDING) {
                    throw new middleware_1.ApiError(400, `Booking is already ${booking.status.toLowerCase()}`);
                }
                if (booking.expiresAt && booking.expiresAt < new Date()) {
                    throw new middleware_1.ApiError(400, 'Booking has expired. Please start over.');
                }
                // Step 2: Update booking with optimistic lock check
                const updatedBooking = yield tx.booking.updateMany({
                    where: {
                        id: bookingId,
                        version: booking.version, // Optimistic lock check
                        status: prisma_1.BookingStatus.PENDING,
                    },
                    data: {
                        status: prisma_1.BookingStatus.CONFIRMED,
                        paymentId,
                        paymentMethod,
                        confirmedAt: new Date(),
                        expiresAt: null,
                        version: { increment: 1 },
                    },
                });
                if (updatedBooking.count === 0) {
                    throw new middleware_1.ApiError(409, 'Booking was modified by another transaction. Please try again.');
                }
                // Step 3: Update seat status to BOOKED
                const seatIds = booking.items.map((item) => item.seatId);
                yield tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: {
                        status: prisma_1.SeatStatus.BOOKED,
                        heldBy: null,
                        heldUntil: null,
                    },
                });
                // Step 4: Create payment record
                yield tx.payment.create({
                    data: {
                        bookingId,
                        gatewayPaymentId: paymentId,
                        amount: booking.finalAmount,
                        status: 'COMPLETED',
                        method: paymentMethod,
                    },
                });
                // Return updated booking
                return yield tx.booking.findUnique({
                    where: { id: bookingId },
                    include: {
                        items: {
                            include: {
                                seat: {
                                    include: {
                                        section: true,
                                    },
                                },
                            },
                        },
                        event: {
                            include: {
                                venue: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });
            }), {
                isolationLevel: prisma_1.Prisma.TransactionIsolationLevel.Serializable,
                timeout: 15000,
            });
        });
    }
    /**
     * Cancel a booking
     */
    static cancelBooking(bookingId, userId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Get booking
                const booking = yield tx.booking.findFirst({
                    where: {
                        id: bookingId,
                        userId,
                    },
                    include: {
                        items: true,
                        event: true,
                    },
                });
                if (!booking) {
                    throw new middleware_1.ApiError(404, 'Booking not found');
                }
                if (booking.status === prisma_1.BookingStatus.CANCELLED) {
                    throw new middleware_1.ApiError(400, 'Booking is already cancelled');
                }
                // Check if event hasn't started yet
                if (booking.event.eventDate < new Date()) {
                    throw new middleware_1.ApiError(400, 'Cannot cancel booking for past events');
                }
                // Update booking status
                yield tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: prisma_1.BookingStatus.CANCELLED,
                        cancelledAt: new Date(),
                        cancellationReason: reason,
                        version: { increment: 1 },
                    },
                });
                // Release seats
                const seatIds = booking.items.map((item) => item.seatId);
                yield tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: {
                        status: prisma_1.SeatStatus.AVAILABLE,
                        heldBy: null,
                        heldUntil: null,
                    },
                });
                // Update event available seats
                yield tx.event.update({
                    where: { id: booking.eventId },
                    data: {
                        availableSeats: { increment: seatIds.length },
                    },
                });
                return { success: true, message: 'Booking cancelled successfully' };
            }));
        });
    }
    /**
     * Get booking by ID
     */
    static getBooking(bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = { id: bookingId };
            if (userId) {
                where.userId = userId;
            }
            const booking = yield database_1.prisma.booking.findFirst({
                where,
                include: {
                    items: {
                        include: {
                            seat: {
                                include: {
                                    section: true,
                                },
                            },
                        },
                    },
                    event: {
                        include: {
                            venue: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    payment: true,
                },
            });
            if (!booking) {
                throw new middleware_1.ApiError(404, 'Booking not found');
            }
            return booking;
        });
    }
    /**
     * Get user's bookings with pagination
     */
    static getUserBookings(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10, status) {
            const skip = (page - 1) * limit;
            const where = { userId };
            if (status) {
                where.status = status;
            }
            const [bookings, total] = yield Promise.all([
                database_1.prisma.booking.findMany({
                    where,
                    include: {
                        event: {
                            include: {
                                venue: {
                                    select: {
                                        name: true,
                                        city: true,
                                    },
                                },
                            },
                        },
                        items: {
                            include: {
                                seat: {
                                    select: {
                                        rowNumber: true,
                                        seatNumber: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                database_1.prisma.booking.count({ where }),
            ]);
            return {
                bookings,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        });
    }
    /**
     * Expire pending bookings that have passed their expiry time
     */
    static expirePendingBookings() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Find expired pending bookings
                const expiredBookings = yield tx.booking.findMany({
                    where: {
                        status: prisma_1.BookingStatus.PENDING,
                        expiresAt: { lt: new Date() },
                    },
                    include: {
                        items: true,
                    },
                });
                if (expiredBookings.length === 0) {
                    return 0;
                }
                // Update status to EXPIRED
                yield tx.booking.updateMany({
                    where: {
                        id: { in: expiredBookings.map((b) => b.id) },
                    },
                    data: {
                        status: prisma_1.BookingStatus.EXPIRED,
                    },
                });
                return expiredBookings.length;
            }));
            return { expired: result };
        });
    }
}
exports.BookingService = BookingService;
