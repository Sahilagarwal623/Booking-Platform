export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface BookingItem {
    id: string;
    seatId: string;
    price: number;
    seat?: {
        rowNumber: string;
        seatNumber: number;
        section?: {
            name: string;
        };
    };
}

export interface Booking {
    id: string;
    bookingNumber: string;
    eventId: string;
    event?: {
        id: string;
        title: string;
        eventDate: string;
        venue?: {
            name: string;
            city?: string;
        };
    };
    items: BookingItem[];
    totalAmount: number;
    taxAmount?: number;
    finalAmount?: number;
    status: BookingStatus;
    createdAt: string;
    expiresAt?: string;
}

export interface HoldSeatsRequest {
    eventId: string;
    seatIds: string[];
}

export interface HoldSeatsResponse {
    bookingId: string;
    seats: { id: string; price: number }[];
    totalAmount: number;
    expiresAt: string;
}

export interface ConfirmBookingRequest {
    bookingId: string;
    paymentId?: string;
}
