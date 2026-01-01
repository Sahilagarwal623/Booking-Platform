import api from './axios';
import type { ApiResponse } from '../types/auth.types';

export interface HoldSeatsResponse {
    seatIds: string[];
    expiresAt: Date;
    holdId: string;
}

export interface CreateBookingResponse {
    id: string;
    bookingNumber: string;
    totalAmount: number;
    status: string;
    expiresAt: string;
}

export class BookingService {
    // Hold seats temporarily
    static async holdSeats(eventId: string, seatIds: string[]): Promise<ApiResponse<HoldSeatsResponse>> {
        console.log(eventId, seatIds);

        const response = await api.post('/bookings/hold-seats', { eventId, seatIds });
        return response.data;
    }

    // Release held seats
    static async releaseSeats(seatIds: string[]): Promise<ApiResponse<{ released: number }>> {
        const response = await api.post('/bookings/release-seats', { seatIds });
        return response.data;
    }

    // Create a pending booking
    static async createBooking(eventId: string, seatIds: string[]): Promise<ApiResponse<CreateBookingResponse>> {
        const response = await api.post('/bookings/create', { eventId, seatIds });
        return response.data;
    }

    // Confirm booking (Payment integration placeholder)
    static async confirmBooking(bookingId: string, paymentDetails: { paymentId: string; paymentMethod: string }): Promise<ApiResponse<any>> {
        const response = await api.post(`/bookings/${bookingId}/confirm`, paymentDetails);
        return response.data;
    }

    // Get user's bookings
    static async getMyBookings(): Promise<ApiResponse<any>> {
        const response = await api.get('/bookings');
        return response.data;
    }

    // Cancel a booking
    static async cancelBooking(bookingId: string): Promise<ApiResponse<any>> {
        const response = await api.post(`/bookings/${bookingId}/cancel`);
        return response.data;
    }
}
