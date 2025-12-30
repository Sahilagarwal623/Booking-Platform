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
const prisma_1 = require("../../generated/prisma");
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
                // Step 1: Check if user already has seats on hold for this event
                const existingHolds = yield tx.seat.count({
                    where: {
                        eventId,
                        heldBy: userId,
                        status: prisma_1.SeatStatus.HELD,
                        heldUntil: { gt: new Date() },
                    },
                });
                if (existingHolds + seatIds.length > config_1.config.seatHold.maxSeatsPerUser) {
                    throw new middleware_1.ApiError(400, `You can only hold ${config_1.config.seatHold.maxSeatsPerUser} seats at a time. You already have ${existingHolds} seats on hold.`);
                }
                // Step 2: Lock and verify seats are available
                // Using raw query for SELECT ... FOR UPDATE NOWAIT
                const lockedSeats = yield tx.$queryRaw `
          SELECT id FROM "Seat"
          WHERE id = ANY(${seatIds}::uuid[])
          AND "eventId" = ${eventId}::uuid
          AND status = 'AVAILABLE'
          FOR UPDATE NOWAIT
        `;
                // Verify all requested seats are available
                if (lockedSeats.length !== seatIds.length) {
                    const availableIds = lockedSeats.map((s) => s.id);
                    const unavailableIds = seatIds.filter((id) => !availableIds.includes(id));
                    throw new middleware_1.ApiError(409, `Some seats are no longer available: ${unavailableIds.join(', ')}`);
                }
                // Step 3: Update seats to HELD status
                yield tx.seat.updateMany({
                    where: { id: { in: seatIds } },
                    data: {
                        status: prisma_1.SeatStatus.HELD,
                        heldBy: userId,
                        heldUntil: expiresAt,
                    },
                });
                // Step 4: Update available seats count on event
                yield tx.event.update({
                    where: { id: eventId },
                    data: {
                        availableSeats: { decrement: seatIds.length },
                    },
                });
                return { seatIds };
            }), {
                isolationLevel: prisma_1.Prisma.TransactionIsolationLevel.Serializable,
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
                        status: prisma_1.SeatStatus.HELD,
                    },
                    data: {
                        status: prisma_1.SeatStatus.AVAILABLE,
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
            const result = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Find all expired holds
                const expiredSeats = yield tx.seat.findMany({
                    where: {
                        status: prisma_1.SeatStatus.HELD,
                        heldUntil: { lt: new Date() },
                    },
                    select: { id: true, eventId: true },
                });
                if (expiredSeats.length === 0) {
                    return 0;
                }
                // Group by event for count updates
                const eventCounts = new Map();
                expiredSeats.forEach((seat) => {
                    eventCounts.set(seat.eventId, (eventCounts.get(seat.eventId) || 0) + 1);
                });
                // Release the seats
                yield tx.seat.updateMany({
                    where: {
                        id: { in: expiredSeats.map((s) => s.id) },
                    },
                    data: {
                        status: prisma_1.SeatStatus.AVAILABLE,
                        heldBy: null,
                        heldUntil: null,
                    },
                });
                // Update event available counts
                for (const [eventId, count] of eventCounts) {
                    yield tx.event.update({
                        where: { id: eventId },
                        data: {
                            availableSeats: { increment: count },
                        },
                    });
                }
                return expiredSeats.length;
            }));
            return { released: result };
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
                    status: prisma_1.SeatStatus.HELD,
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
                status: prisma_1.SeatStatus.HELD,
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
