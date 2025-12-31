import api from './axios';
import type {
    Booking,
    HoldSeatsRequest,
    HoldSeatsResponse
} from '../types/booking.types';
import type { ApiResponse } from '../types/auth.types';

interface BookingsListResponse {
    bookings: Booking[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class BookingService {
    // Hold seats temporarily
    static async holdSeats(data: HoldSeatsRequest): Promise<ApiResponse<HoldSeatsResponse>> {
        const response = await api.post('/bookings/hold-seats', data);
        return response.data;
    }

    // Create booking from held seats
    static async createBooking(data: { eventId: string; seatIds: string[] }): Promise<ApiResponse<Booking>> {
        const response = await api.post('/bookings/create', data);
        return response.data;
    }

    // Confirm booking after payment
    static async confirmBooking(bookingId: string, paymentId: string, paymentMethod: string): Promise<ApiResponse<Booking>> {
        const response = await api.post(`/bookings/${bookingId}/confirm`, { paymentId, paymentMethod });
        return response.data;
    }

    // Get user's bookings
    static async getMyBookings(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<BookingsListResponse>> {
        const response = await api.get('/bookings', { params });
        return response.data;
    }

    // Get single booking
    static async getBooking(id: string): Promise<ApiResponse<Booking>> {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    }

    // Cancel booking
    static async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
        const response = await api.post(`/bookings/${id}/cancel`, { reason });
        return response.data;
    }

    // Release held seats
    static async releaseSeats(seatIds: string[]): Promise<ApiResponse<{ released: number }>> {
        const response = await api.post('/bookings/release-seats', { seatIds });
        return response.data;
    }

    // Extend seat hold
    static async extendHold(seatIds: string[], additionalSeconds?: number): Promise<ApiResponse<{ extended: number }>> {
        const response = await api.post('/bookings/extend-hold', { seatIds, additionalSeconds });
        return response.data;
    }

    // Get hold status
    static async getHoldStatus(eventId?: string): Promise<ApiResponse<unknown>> {
        const response = await api.get('/bookings/hold-status', { params: { eventId } });
        return response.data;
    }
}
