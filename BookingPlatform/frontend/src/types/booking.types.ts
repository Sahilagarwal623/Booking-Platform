export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';

export interface Seat {
    id: string;
    label: string;
    row: string;
    number: number;
    price: number;
    status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

export interface Booking {
    id: string;
    eventId: string;
    event?: {
        id: string;
        name: string;
        date: string;
        venue: { name: string };
    };
    seats: Seat[];
    totalAmount: number;
    status: BookingStatus;
    createdAt: string;
}

export interface HoldSeatsRequest {
    eventId: string;
    seatIds: string[];
}

export interface HoldSeatsResponse {
    bookingId: string;
    seats: Seat[];
    totalAmount: number;
    expiresAt: string;
}

export interface ConfirmBookingRequest {
    bookingId: string;
    paymentId?: string;
}
