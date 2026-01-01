import { prisma } from '../config/database';
import { config } from '../config';
import { ApiError } from '../middleware';
import { SeatLockService } from './seatLock.service';
import { BookingStatus, SeatStatus, Prisma } from '../../generated/prisma';

interface CreateBookingInput {
    userId: string;
    eventId: string;
    seatIds: string[];
}

interface ConfirmBookingInput {
    bookingId: string;
    paymentId: string;
    paymentMethod: string;
}

/**
 * Booking Service
 * Handles booking creation, confirmation, and cancellation with proper locking
 */
export class BookingService {
    /**
     * Create a pending booking after seats are held
     * Uses optimistic locking with version field
     */
    static async createBooking(input: CreateBookingInput) {
        const { userId, eventId, seatIds } = input;

        return await prisma.$transaction(
            async (tx) => {
                // Step 1: Verify seats are held by this user
                const seats = await tx.seat.findMany({
                    where: {
                        id: { in: seatIds },
                        eventId,
                        heldBy: userId,
                        status: SeatStatus.HELD,
                        heldUntil: { gt: new Date() },
                    },
                    include: {
                        section: true,
                    },
                });

                if (seats.length !== seatIds.length) {
                    throw new ApiError(
                        400,
                        'Some seats are no longer held by you. Please select seats again.'
                    );
                }

                // Step 2: Calculate pricing
                const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);
                const taxAmount = totalAmount * 0.18; // 18% GST
                const finalAmount = totalAmount + taxAmount;

                // Step 3: Set booking expiry (same as seat hold or slightly before)
                const firstSeatExpiry = seats[0]?.heldUntil;
                if (!firstSeatExpiry) {
                    throw new ApiError(400, 'Seat hold expiry not found');
                }
                const minExpiry = seats.reduce(
                    (min, seat) => (seat.heldUntil && seat.heldUntil < min ? seat.heldUntil : min),
                    firstSeatExpiry
                );

                // Step 4: Create booking
                const booking = await tx.booking.create({
                    data: {
                        userId,
                        eventId,
                        status: BookingStatus.PENDING,
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
            },
            {
                timeout: 15000,
            }
        );
    }

    /**
     * Confirm booking after successful payment
     * Uses optimistic locking to prevent double confirmation
     */
    static async confirmBooking(input: ConfirmBookingInput) {
        const { bookingId, paymentId, paymentMethod } = input;

        return await prisma.$transaction(
            async (tx) => {
                // Step 1: Get booking with version for optimistic locking
                const booking = await tx.booking.findUnique({
                    where: { id: bookingId },
                    include: {
                        items: true,
                    },
                });

                if (!booking) {
                    throw new ApiError(404, 'Booking not found');
                }

                if (booking.status !== BookingStatus.PENDING) {
                    throw new ApiError(400, `Booking is already ${booking.status.toLowerCase()}`);
                }

                if (booking.expiresAt && booking.expiresAt < new Date()) {
                    throw new ApiError(400, 'Booking has expired. Please start over.');
                }

                // Step 2: Update booking with optimistic lock check
                const updatedBooking = await tx.booking.updateMany({
                    where: {
                        id: bookingId,
                        version: booking.version, // Optimistic lock check
                        status: BookingStatus.PENDING,
                    },
                    data: {
                        status: BookingStatus.CONFIRMED,
                        paymentId,
                        paymentMethod,
                        confirmedAt: new Date(),
                        expiresAt: null,
                        version: { increment: 1 },
                    },
                });

                if (updatedBooking.count === 0) {
                    throw new ApiError(
                        409,
                        'Booking was modified by another transaction. Please try again.'
                    );
                }

                // Step 3: Update seat status to BOOKED
                const seatIds = booking.items.map((item) => item.seatId);
                await tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: {
                        status: SeatStatus.BOOKED,
                        heldBy: null,
                        heldUntil: null,
                    },
                });

                // Step 4: Create payment record
                await tx.payment.create({
                    data: {
                        bookingId,
                        gatewayPaymentId: paymentId,
                        amount: booking.finalAmount,
                        status: 'COMPLETED',
                        method: paymentMethod,
                    },
                });

                // Return updated booking
                return await tx.booking.findUnique({
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
            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
                timeout: 15000,
            }
        );
    }

    /**
     * Cancel a booking
     */
    static async cancelBooking(
        bookingId: string,
        userId: string,
        reason?: string
    ) {
        return await prisma.$transaction(async (tx) => {
            // Get booking
            const booking = await tx.booking.findFirst({
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
                throw new ApiError(404, 'Booking not found');
            }

            if (booking.status === BookingStatus.CANCELLED) {
                throw new ApiError(400, 'Booking is already cancelled');
            }

            // Check if event hasn't started yet
            if (booking.event.eventDate < new Date()) {
                throw new ApiError(400, 'Cannot cancel booking for past events');
            }

            // Update booking status
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancelledAt: new Date(),
                    cancellationReason: reason,
                    version: { increment: 1 },
                },
            });

            // Get seat IDs before deleting items
            const seatIds = booking.items.map((item) => item.seatId);

            // Delete booking items to free up the seatId unique constraint
            await tx.bookingItem.deleteMany({
                where: { bookingId },
            });

            // Release seats
            await tx.seat.updateMany({
                where: { id: { in: seatIds } },
                data: {
                    status: SeatStatus.AVAILABLE,
                    heldBy: null,
                    heldUntil: null,
                },
            });

            // Update event available seats
            await tx.event.update({
                where: { id: booking.eventId },
                data: {
                    availableSeats: { increment: seatIds.length },
                },
            });

            return { success: true, message: 'Booking cancelled successfully' };
        });
    }

    /**
     * Get booking by ID
     */
    static async getBooking(bookingId: string, userId?: string) {
        const where: any = { id: bookingId };
        if (userId) {
            where.userId = userId;
        }

        const booking = await prisma.booking.findFirst({
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
            throw new ApiError(404, 'Booking not found');
        }

        return booking;
    }

    /**
     * Get user's bookings with pagination
     */
    static async getUserBookings(
        userId: string,
        page: number = 1,
        limit: number = 10,
        status?: BookingStatus
    ) {
        const skip = (page - 1) * limit;
        const where: any = { userId };

        if (status) {
            where.status = status;
        }

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
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
            prisma.booking.count({ where }),
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
    }

    /**
     * Expire pending bookings that have passed their expiry time
     */
    static async expirePendingBookings(): Promise<{ expired: number }> {
        const result = await prisma.$transaction(async (tx) => {
            // Find expired pending bookings
            const expiredBookings = await tx.booking.findMany({
                where: {
                    status: BookingStatus.PENDING,
                    expiresAt: { lt: new Date() },
                },
                include: {
                    items: true,
                },
            });

            if (expiredBookings.length === 0) {
                return 0;
            }

            const bookingIds = expiredBookings.map((b) => b.id);

            // Step 1: Delete booking items first (to free up the seatId unique constraint)
            await tx.bookingItem.deleteMany({
                where: {
                    bookingId: { in: bookingIds },
                },
            });

            // Step 2: Update booking status to EXPIRED
            await tx.booking.updateMany({
                where: {
                    id: { in: bookingIds },
                },
                data: {
                    status: BookingStatus.EXPIRED,
                },
            });

            return expiredBookings.length;
        });

        return { expired: result };
    }
}
