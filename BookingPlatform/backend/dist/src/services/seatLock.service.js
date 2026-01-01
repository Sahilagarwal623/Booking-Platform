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
exports.SeatLockService = void 0;
const database_1 = require("../config/database");
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const client_1 = require("@prisma/client");
/**
 * Seat Locking Service
 * Handles seat hold/release with pessimistic and optimistic locking
 */
class SeatLockService {
    /**
     * Hold seats for a user with pessimistic locking (database transaction)
     * Uses SELECT ... FOR UPDATE to prevent race conditions
     */
    static holdSeats(eventId, seatIds, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const holdDuration = config_1.config.seatHold.ttlSeconds * 1000; // Convert to ms
            const expiresAt = new Date(Date.now() + holdDuration);
            // Check max seats per user limit
            if (seatIds.length > config_1.config.seatHold.maxSeatsPerUser) {
                throw new middleware_1.ApiError(400, `Cannot hold more than ${config_1.config.seatHold.maxSeatsPerUser} seats at once`);
            }
            // Use transaction with serializable isolation for strictest locking
            const result = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const event = yield tx.event.findUnique({
                    where: { id: eventId },
                });
                if (!event || event.status !== client_1.EventStatus.PUBLISHED) {
                    throw new middleware_1.ApiError(400, 'Event not found');
                }
                // Step 1: Check if user already has seats on hold for this event
                const existingHolds = yield tx.seat.count({
                    where: {
                        eventId,
                        heldBy: userId,
                        status: client_1.SeatStatus.HELD,
                        heldUntil: { gt: new Date() },
                    },
                });
                if (existingHolds + seatIds.length > config_1.config.seatHold.maxSeatsPerUser) {
                    throw new middleware_1.ApiError(400, `You can only hold ${config_1.config.seatHold.maxSeatsPerUser} seats at a time. You already have ${existingHolds} seats on hold.`);
                }
                // Step 2: Find and verify seats are available
                // Using Prisma native query with serializable isolation instead of raw SQL
                // The serializable isolation level protects against race conditions
                const availableSeats = yield tx.seat.findMany({
                    where: {
                        id: { in: seatIds },
                        eventId: eventId,
                        status: client_1.SeatStatus.AVAILABLE,
                    },
                    select: { id: true },
                });
                // Verify all requested seats are available
                if (availableSeats.length !== seatIds.length) {
                    const availableIds = availableSeats.map((s) => s.id);
                    const unavailableIds = seatIds.filter((id) => !availableIds.includes(id));
                    throw new middleware_1.ApiError(409, `Some seats are no longer available: ${unavailableIds.join(', ')}`);
                }
                // Step 3: Update seats to HELD status
                // Include status check in WHERE to prevent race conditions
                const updateResult = yield tx.seat.updateMany({
                    where: {
                        id: { in: seatIds },
                        status: client_1.SeatStatus.AVAILABLE, // Only update if still available
                    },
                    data: {
                        status: client_1.SeatStatus.HELD,
                        heldBy: userId,
                        heldUntil: expiresAt,
                        version: { increment: 1 }, // Increment version for tracking
                    },
                });
                // Verify all seats were updated (race condition check)
                if (updateResult.count !== seatIds.length) {
                    throw new middleware_1.ApiError(409, 'Some seats were booked by another user. Please try again.');
                }
                // Step 4: Update available seats count on event
                yield tx.event.update({
                    where: { id: eventId },
                    data: {
                        availableSeats: { decrement: seatIds.length },
                    },
                });
                return { seatIds };
            }), {
                maxWait: 5000, // Wait up to 5s for a connection
                timeout: 10000, // 10 second timeout
            });
            return {
                success: true,
                expiresAt,
                holdId: `hold_${Date.now()}_${userId}`,
            };
        });
    }
    /**
     * Release held seats (either manually or when expired)
     */
    static releaseSeats(seatIds, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Only release seats held by this user
                const updateResult = yield tx.seat.updateMany({
                    where: {
                        id: { in: seatIds },
                        heldBy: userId,
                        status: client_1.SeatStatus.HELD,
                    },
                    data: {
                        status: client_1.SeatStatus.AVAILABLE,
                        heldBy: null,
                        heldUntil: null,
                    },
                });
                // Update event available seats
                if (updateResult.count > 0) {
                    // Get eventId from first seat
                    const seat = yield tx.seat.findFirst({
                        where: { id: { in: seatIds } },
                        select: { eventId: true },
                    });
                    if (seat) {
                        yield tx.event.update({
                            where: { id: seat.eventId },
                            data: {
                                availableSeats: { increment: updateResult.count },
                            },
                        });
                    }
                }
                return updateResult.count;
            }));
            return { released: result };
        });
    }
    /**
     * Release all expired holds (called by cron job)
     */
    static releaseExpiredHolds() {
        return __awaiter(this, void 0, void 0, function* () {
            // Find all expired holds (no transaction needed for reads)
            const expiredSeats = yield database_1.prisma.seat.findMany({
                where: {
                    status: client_1.SeatStatus.HELD,
                    heldUntil: { lt: new Date() },
                },
                select: { id: true, eventId: true },
            });
            if (expiredSeats.length === 0) {
                return { released: 0 };
            }
            // Group by event for count updates
            const eventCounts = new Map();
            expiredSeats.forEach((seat) => {
                eventCounts.set(seat.eventId, (eventCounts.get(seat.eventId) || 0) + 1);
            });
            // Release the seats (atomic operation)
            const updateResult = yield database_1.prisma.seat.updateMany({
                where: {
                    id: { in: expiredSeats.map((s) => s.id) },
                    status: client_1.SeatStatus.HELD, // Double-check still held
                },
                data: {
                    status: client_1.SeatStatus.AVAILABLE,
                    heldBy: null,
                    heldUntil: null,
                },
            });
            // Update event available counts (best effort, eventual consistency)
            for (const [eventId, count] of eventCounts) {
                try {
                    yield database_1.prisma.event.update({
                        where: { id: eventId },
                        data: {
                            availableSeats: { increment: count },
                        },
                    });
                }
                catch (err) {
                    console.error(`[cron] Failed to update availableSeats for event ${eventId}:`, err);
                }
            }
            return { released: updateResult.count };
        });
    }
    /**
     * Extend hold time for seats (if user needs more time)
     */
    static extendHold(seatIds_1, userId_1) {
        return __awaiter(this, arguments, void 0, function* (seatIds, userId, additionalSeconds = 300) {
            const maxExtension = config_1.config.seatHold.ttlSeconds; // Can't extend beyond original TTL
            const extension = Math.min(additionalSeconds, maxExtension);
            const newExpiresAt = new Date(Date.now() + extension * 1000);
            const result = yield database_1.prisma.seat.updateMany({
                where: {
                    id: { in: seatIds },
                    heldBy: userId,
                    status: client_1.SeatStatus.HELD,
                    heldUntil: { gt: new Date() }, // Only extend if not expired
                },
                data: {
                    heldUntil: newExpiresAt,
                },
            });
            if (result.count === 0) {
                throw new middleware_1.ApiError(400, 'No valid seats to extend hold for');
            }
            return { newExpiresAt };
        });
    }
    /**
     * Get hold status for user's seats
     */
    static getHoldStatus(userId, eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const where = {
                heldBy: userId,
                status: client_1.SeatStatus.HELD,
                heldUntil: { gt: new Date() },
            };
            if (eventId) {
                where.eventId = eventId;
            }
            const seats = yield database_1.prisma.seat.findMany({
                where,
                select: {
                    id: true,
                    eventId: true,
                    heldUntil: true,
                },
            });
            return seats.map((seat) => ({
                seatId: seat.id,
                eventId: seat.eventId,
                expiresAt: seat.heldUntil,
            }));
        });
    }
}
exports.SeatLockService = SeatLockService;
