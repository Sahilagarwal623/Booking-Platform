import { prisma } from '../config/database';
import { ApiError } from '../middleware';
import { EventStatus, SeatStatus, EventCategory, Prisma, BookingStatus } from '../../generated/prisma/client';

interface CreateEventInput {
    title: string;
    description: string;
    category: string;
    venueId: string;
    eventDate: Date;
    endDate?: Date;
    gateOpenTime?: Date;
    basePrice: number;
    imageUrl?: string;
    bannerUrl?: string;
    termsConditions?: string;
}

interface EventFilters {
    category?: string;
    city?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minPrice?: number;
    maxPrice?: number;
    status?: string;  // 'all', 'DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'
}

/**
 * Event Service
 * Handles event CRUD and seat generation
 */
export class EventService {
    /**
     * Create a new event with auto-generated seats
     */
    static async createEvent(input: CreateEventInput) {
        const {
            title,
            description,
            category,
            venueId,
            eventDate,
            endDate,
            gateOpenTime,
            basePrice,
            imageUrl,
            bannerUrl,
            termsConditions,
        } = input;

        // Verify venue exists and get sections
        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: { sections: true },
        });

        if (!venue) {
            throw new ApiError(404, 'Venue not found');
        }

        // Calculate total seats from venue sections
        const totalSeats = venue.sections.reduce(
            (sum, section) => sum + section.rowCount * section.seatsPerRow,
            0
        );

        // Create event with seats in a transaction
        const event = await prisma.$transaction(async (tx) => {
            // Create event
            const newEvent = await tx.event.create({
                data: {
                    title,
                    description,
                    category: category as any,
                    venueId,
                    eventDate,
                    endDate,
                    gateOpenTime,
                    basePrice,
                    totalSeats,
                    availableSeats: totalSeats,
                    status: EventStatus.DRAFT,
                    imageUrl,
                    bannerUrl,
                    termsConditions,
                },
            });

            // Generate seats for each section
            const seatsData: Prisma.SeatCreateManyInput[] = [];

            for (const section of venue.sections) {
                const seatPrice = basePrice * section.priceMultiplier;

                for (let row = 0; row < section.rowCount; row++) {
                    const rowLabel = String.fromCharCode(65 + row); // A, B, C, ...

                    for (let seatNum = 1; seatNum <= section.seatsPerRow; seatNum++) {
                        seatsData.push({
                            eventId: newEvent.id,
                            sectionId: section.id,
                            rowNumber: rowLabel,
                            seatNumber: seatNum,
                            price: seatPrice,
                            status: SeatStatus.AVAILABLE,
                        });
                    }
                }
            }

            // Bulk create seats
            await tx.seat.createMany({
                data: seatsData,
            });

            return newEvent;
        });

        return event;
    }

    /**
     * Get event by ID with full details
     */


    static async getEvent(eventId: string) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                venue: {
                    include: {
                        sections: true,
                    },
                },
                _count: {
                    select: {
                        bookings: {
                            where: { status: 'CONFIRMED' },
                        },
                        reviews: true,
                    },
                },
            },
        });

        if (!event) {
            throw new ApiError(404, 'Event not found');
        }

        // Get average rating
        const avgRating = await prisma.review.aggregate({
            where: { eventId },
            _avg: { rating: true },
        });

        return {
            ...event,
            averageRating: avgRating._avg.rating || 0,
        };
    }

    /**
     * Get events with filters and pagination
     */
    static async getEvents(
        filters: EventFilters,
        page: number = 1,
        limit: number = 10
    ) {
        const skip = (page - 1) * limit;

        const where: Prisma.EventWhereInput = {};

        // Handle status filter: 'all' returns all statuses, otherwise filter by specific status
        if (filters.status && filters.status !== 'all') {
            where.status = filters.status as EventStatus;
        } else if (!filters.status) {
            // Default to PUBLISHED for public listing
            where.status = EventStatus.PUBLISHED;
        }

        if (filters.category) {
            where.category = filters.category as EventCategory;
        }

        if (filters.city) {
            where.venue = { city: { contains: filters.city, mode: 'insensitive' } };
        }

        if (filters.dateFrom || filters.dateTo) {
            where.eventDate = {};
            if (filters.dateFrom) {
                where.eventDate.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.eventDate.lte = filters.dateTo;
            }
        }

        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.basePrice = {};
            if (filters.minPrice !== undefined) {
                where.basePrice.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                where.basePrice.lte = filters.maxPrice;
            }
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    venue: {
                        include: {
                            sections: true
                        }
                    },
                },
                orderBy: { eventDate: 'asc' },
                skip,
                take: limit,
            }),
            prisma.event.count({ where }),
        ]);

        return {
            events,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get seat availability for an event
     */
    static async getSeatAvailability(eventId: string) {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                totalSeats: true,
                availableSeats: true,
            },
        });

        if (!event) {
            throw new ApiError(404, 'Event not found');
        }

        // Get seats grouped by section and status
        const seats = await prisma.seat.findMany({
            where: { eventId },
            include: {
                section: {
                    select: {
                        id: true,
                        name: true,
                        priceMultiplier: true,
                    },
                },
            },
            orderBy: [
                { section: { name: 'asc' } },
                { rowNumber: 'asc' },
                { seatNumber: 'asc' },
            ],
        });

        // Group by section
        const sectionMap = new Map<string, any>();

        seats.forEach((seat) => {
            if (!sectionMap.has(seat.sectionId)) {
                sectionMap.set(seat.sectionId, {
                    sectionId: seat.section.id,
                    sectionName: seat.section.name,
                    priceMultiplier: seat.section.priceMultiplier,
                    seats: [],
                });
            }

            sectionMap.get(seat.sectionId).seats.push({
                id: seat.id,
                row: seat.rowNumber,
                number: seat.seatNumber,
                price: seat.price,
                status: seat.status,
                // Don't expose who is holding (privacy)
                isAvailable: seat.status === SeatStatus.AVAILABLE,
            });
        });

        return {
            eventId: event.id,
            totalSeats: event.totalSeats,
            availableSeats: event.availableSeats,
            sections: Array.from(sectionMap.values()),
        };
    }

    /**
     * Update event
     */
    static async updateEvent(eventId: string, data: Partial<CreateEventInput>) {
        const event = await prisma.event.update({
            where: { id: eventId },
            data: data as any,
        });

        return event;
    }

    /**
     * Publish event
     */
    static async publishEvent(eventId: string) {
        const event = await prisma.event.update({
            where: { id: eventId },
            data: { status: EventStatus.PUBLISHED },
        });

        return event;
    }

    /**
     * Cancel event
     */
    static async cancelEvent(eventId: string) {
        return await prisma.$transaction(async (tx) => {
            // Update event status
            await tx.event.update({
                where: { id: eventId },
                data: { status: EventStatus.CANCELLED },
            });

            // Cancel all pending bookings
            await tx.booking.updateMany({
                where: {
                    eventId,
                    status: {
                        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
                    },
                },
                data: {
                    status: BookingStatus.CANCELLED,
                    cancellationReason: 'Event cancelled by organizer',
                },
            });

            // Release all held seats
            await tx.seat.updateMany({
                where: {
                    eventId,
                    status: SeatStatus.HELD,
                },
                data: {
                    status: SeatStatus.AVAILABLE,
                    heldBy: null,
                    heldUntil: null,
                },
            });

            return { success: true, message: 'Event cancelled successfully' };
        });
    }
}
