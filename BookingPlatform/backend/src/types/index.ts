import { Request } from 'express';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

// Pagination types
export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Booking flow types
export interface HoldSeatsRequest {
    eventId: string;
    seatIds: string[];
}

export interface CreateBookingRequest {
    eventId: string;
    seatIds: string[];
}

export interface ConfirmBookingRequest {
    paymentId: string;
    paymentMethod: string;
}

// Event filter types
export interface EventFilters {
    category?: string;
    city?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minPrice?: number;
    maxPrice?: number;
}

export { };
