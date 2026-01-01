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
exports.EventService = void 0;
const database_1 = require("../config/database");
const middleware_1 = require("../middleware");
const client_1 = require("@prisma/client");
/**
 * Event Service
 * Handles event CRUD and seat generation
 */
class EventService {
    /**
     * Create a new event with auto-generated seats
     */
    static createEvent(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, description, category, venueId, eventDate, endDate, gateOpenTime, basePrice, imageUrl, bannerUrl, termsConditions, } = input;
            // Verify venue exists and get sections
            const venue = yield database_1.prisma.venue.findUnique({
                where: { id: venueId },
                include: { sections: true },
            });
            if (!venue) {
                throw new middleware_1.ApiError(404, 'Venue not found');
            }
            // Calculate total seats from venue sections
            const totalSeats = venue.sections.reduce((sum, section) => sum + section.rowCount * section.seatsPerRow, 0);
            // Create event with seats in a transaction
            const event = yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Create event
                const newEvent = yield tx.event.create({
                    data: {
                        title,
                        description,
                        category: category,
                        venueId,
                        eventDate,
                        endDate,
                        gateOpenTime,
                        basePrice,
                        totalSeats,
                        availableSeats: totalSeats,
                        status: client_1.EventStatus.DRAFT,
                        imageUrl,
                        bannerUrl,
                        termsConditions,
                    },
                });
                // Generate seats for each section
                const seatsData = [];
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
                                status: client_1.SeatStatus.AVAILABLE,
                            });
                        }
                    }
                }
                // Bulk create seats
                yield tx.seat.createMany({
                    data: seatsData,
                });
                return newEvent;
            }));
            return event;
        });
    }
    /**
     * Get event by ID with full details
     */
    static getEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield database_1.prisma.event.findUnique({
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
                throw new middleware_1.ApiError(404, 'Event not found');
            }
            // Get average rating
            const avgRating = yield database_1.prisma.review.aggregate({
                where: { eventId },
                _avg: { rating: true },
            });
            return Object.assign(Object.assign({}, event), { averageRating: avgRating._avg.rating || 0 });
        });
    }
    /**
     * Get events with filters and pagination
     */
    static getEvents(filters_1) {
        return __awaiter(this, arguments, void 0, function* (filters, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const where = {};
            // Handle status filter: 'all' returns all statuses, otherwise filter by specific status
            if (filters.status && filters.status !== 'all') {
                where.status = filters.status;
            }
            else if (!filters.status) {
                // Default to PUBLISHED for public listing
                where.status = client_1.EventStatus.PUBLISHED;
            }
            if (filters.category) {
                where.category = filters.category;
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
            const [events, total] = yield Promise.all([
                database_1.prisma.event.findMany({
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
                database_1.prisma.event.count({ where }),
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
        });
    }
    /**
     * Get seat availability for an event
     */
    static getSeatAvailability(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield database_1.prisma.event.findUnique({
                where: { id: eventId },
                select: {
                    id: true,
                    totalSeats: true,
                    availableSeats: true,
                },
            });
            if (!event) {
                throw new middleware_1.ApiError(404, 'Event not found');
            }
            // Get seats grouped by section and status
            const seats = yield database_1.prisma.seat.findMany({
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
            const sectionMap = new Map();
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
                    isAvailable: seat.status === client_1.SeatStatus.AVAILABLE,
                });
            });
            return {
                eventId: event.id,
                totalSeats: event.totalSeats,
                availableSeats: event.availableSeats,
                sections: Array.from(sectionMap.values()),
            };
        });
    }
    /**
     * Update event
     */
    static updateEvent(eventId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield database_1.prisma.event.update({
                where: { id: eventId },
                data: data,
            });
            return event;
        });
    }
    /**
     * Publish event
     */
    static publishEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield database_1.prisma.event.update({
                where: { id: eventId },
                data: { status: client_1.EventStatus.PUBLISHED },
            });
            return event;
        });
    }
    /**
     * Cancel event
     */
    static cancelEvent(eventId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Update event status
                yield tx.event.update({
                    where: { id: eventId },
                    data: { status: client_1.EventStatus.CANCELLED },
                });
                // Cancel all pending bookings
                yield tx.booking.updateMany({
                    where: {
                        eventId,
                        status: {
                            in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.CONFIRMED],
                        },
                    },
                    data: {
                        status: client_1.BookingStatus.CANCELLED,
                        cancellationReason: 'Event cancelled by organizer',
                    },
                });
                // Release all held seats
                yield tx.seat.updateMany({
                    where: {
                        eventId,
                        status: client_1.SeatStatus.HELD,
                    },
                    data: {
                        status: client_1.SeatStatus.AVAILABLE,
                        heldBy: null,
                        heldUntil: null,
                    },
                });
                return { success: true, message: 'Event cancelled successfully' };
            }));
        });
    }
}
exports.EventService = EventService;
