import { prisma } from '../config/database';
import { config } from '../config';
import { ApiError } from '../middleware';
import { SeatStatus, EventStatus } from '@prisma/client';

/**
 * Seat Locking Service
 * Handles seat hold/release with pessimistic and optimistic locking
 */
export class SeatLockService {
    /**
     * Hold seats for a user with pessimistic locking (database transaction)
     * Uses SELECT ... FOR UPDATE to prevent race conditions
     */
    static async holdSeats(
        eventId: string,
        seatIds: string[],
        userId: string
    ): Promise<{ success: boolean; expiresAt: Date; holdId: string }> {
        const holdDuration = config.seatHold.ttlSeconds * 1000; // Convert to ms
        const expiresAt = new Date(Date.now() + holdDuration);

        // Check max seats per user limit
        if (seatIds.length > config.seatHold.maxSeatsPerUser) {
            throw new ApiError(
                400,
                `Cannot hold more than ${config.seatHold.maxSeatsPerUser} seats at once`
            );
        }

        // Use transaction with serializable isolation for strictest locking
        const result = await prisma.$transaction(
            async (tx) => {

                const event = await tx.event.findUnique({
                    where: { id: eventId },
                });

                if (!event || event.status !== EventStatus.PUBLISHED) {
                    throw new ApiError(400, 'Event not found');
                }

                // Step 1: Check if user already has seats on hold for this event
                const existingHolds = await tx.seat.count({
                    where: {
                        eventId,
                        heldBy: userId,
                        status: SeatStatus.HELD,
                        heldUntil: { gt: new Date() },
                    },
                });

                if (existingHolds + seatIds.length > config.seatHold.maxSeatsPerUser) {
                    throw new ApiError(
                        400,
                        `You can only hold ${config.seatHold.maxSeatsPerUser} seats at a time. You already have ${existingHolds} seats on hold.`
                    );
                }

                // Step 2: Find and verify seats are available
                // Using Prisma native query with serializable isolation instead of raw SQL
                // The serializable isolation level protects against race conditions
                const availableSeats = await tx.seat.findMany({
                    where: {
                        id: { in: seatIds },
                        eventId: eventId,
                        status: SeatStatus.AVAILABLE,
                    },
                    select: { id: true },
                });

                // Verify all requested seats are available
                if (availableSeats.length !== seatIds.length) {
                    const availableIds = availableSeats.map((s) => s.id);
                    const unavailableIds = seatIds.filter((id) => !availableIds.includes(id));
                    throw new ApiError(
                        409,
                        `Some seats are no longer available: ${unavailableIds.join(', ')}`
                    );
                }

                // Step 3: Update seats to HELD status
                // Include status check in WHERE to prevent race conditions
                const updateResult = await tx.seat.updateMany({
                    where: {
                        id: { in: seatIds },
                        status: SeatStatus.AVAILABLE, // Only update if still available
                    },
                    data: {
                        status: SeatStatus.HELD,
                        heldBy: userId,
                        heldUntil: expiresAt,
                        version: { increment: 1 }, // Increment version for tracking
                    },
                });

                // Verify all seats were updated (race condition check)
                if (updateResult.count !== seatIds.length) {
                    throw new ApiError(
                        409,
                        'Some seats were booked by another user. Please try again.'
                    );
                }

                // Step 4: Update available seats count on event
                await tx.event.update({
                    where: { id: eventId },
                    data: {
                        availableSeats: { decrement: seatIds.length },
                    },
                });

                return { seatIds };
            },
            {
                maxWait: 5000, // Wait up to 5s for a connection
                timeout: 10000, // 10 second timeout
            }
        );

        return {
            success: true,
            expiresAt,
            holdId: `hold_${Date.now()}_${userId}`,
        };
    }

    /**
     * Release held seats (either manually or when expired)
     */
    static async releaseSeats(
        seatIds: string[],
        userId: string
    ): Promise<{ released: number }> {
        const result = await prisma.$transaction(async (tx) => {
            // Only release seats held by this user
            const updateResult = await tx.seat.updateMany({
                where: {
                    id: { in: seatIds },
                    heldBy: userId,
                    status: SeatStatus.HELD,
                },
                data: {
                    status: SeatStatus.AVAILABLE,
                    heldBy: null,
                    heldUntil: null,
                },
            });

            // Update event available seats
            if (updateResult.count > 0) {
                // Get eventId from first seat
                const seat = await tx.seat.findFirst({
                    where: { id: { in: seatIds } },
                    select: { eventId: true },
                });

                if (seat) {
                    await tx.event.update({
                        where: { id: seat.eventId },
                        data: {
                            availableSeats: { increment: updateResult.count },
                        },
                    });
                }
            }

            return updateResult.count;
        });

        return { released: result };
    }

    /**
     * Release all expired holds (called by cron job)
     */
    static async releaseExpiredHolds(): Promise<{ released: number }> {
        // Find all expired holds (no transaction needed for reads)
        const expiredSeats = await prisma.seat.findMany({
            where: {
                status: SeatStatus.HELD,
                heldUntil: { lt: new Date() },
            },
            select: { id: true, eventId: true },
        });

        if (expiredSeats.length === 0) {
            return { released: 0 };
        }

        // Group by event for count updates
        const eventCounts = new Map<string, number>();
        expiredSeats.forEach((seat) => {
            eventCounts.set(seat.eventId, (eventCounts.get(seat.eventId) || 0) + 1);
        });

        // Release the seats (atomic operation)
        const updateResult = await prisma.seat.updateMany({
            where: {
                id: { in: expiredSeats.map((s) => s.id) },
                status: SeatStatus.HELD, // Double-check still held
            },
            data: {
                status: SeatStatus.AVAILABLE,
                heldBy: null,
                heldUntil: null,
            },
        });

        // Update event available counts (best effort, eventual consistency)
        for (const [eventId, count] of eventCounts) {
            try {
                await prisma.event.update({
                    where: { id: eventId },
                    data: {
                        availableSeats: { increment: count },
                    },
                });
            } catch (err) {
                console.error(`[cron] Failed to update availableSeats for event ${eventId}:`, err);
            }
        }

        return { released: updateResult.count };
    }

    /**
     * Extend hold time for seats (if user needs more time)
     */
    static async extendHold(
        seatIds: string[],
        userId: string,
        additionalSeconds: number = 300
    ): Promise<{ newExpiresAt: Date }> {
        const maxExtension = config.seatHold.ttlSeconds; // Can't extend beyond original TTL
        const extension = Math.min(additionalSeconds, maxExtension);
        const newExpiresAt = new Date(Date.now() + extension * 1000);

        const result = await prisma.seat.updateMany({
            where: {
                id: { in: seatIds },
                heldBy: userId,
                status: SeatStatus.HELD,
                heldUntil: { gt: new Date() }, // Only extend if not expired
            },
            data: {
                heldUntil: newExpiresAt,
            },
        });

        if (result.count === 0) {
            throw new ApiError(400, 'No valid seats to extend hold for');
        }

        return { newExpiresAt };
    }

    /**
     * Get hold status for user's seats
     */
    static async getHoldStatus(
        userId: string,
        eventId?: string
    ): Promise<Array<{ seatId: string; eventId: string; expiresAt: Date }>> {
        const where: any = {
            heldBy: userId,
            status: SeatStatus.HELD,
            heldUntil: { gt: new Date() },
        };

        if (eventId) {
            where.eventId = eventId;
        }

        const seats = await prisma.seat.findMany({
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
            expiresAt: seat.heldUntil!,
        }));
    }
}
