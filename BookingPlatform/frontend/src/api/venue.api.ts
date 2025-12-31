import api from './axios';
import type { Venue, VenuesResponse } from '../types/event.types';
import type { ApiResponse } from '../types/auth.types';

export class VenueService {
    // Get all venues with pagination
    static async getVenues(params?: {
        page?: number;
        limit?: number;
        city?: string;
    }): Promise<ApiResponse<VenuesResponse>> {
        const response = await api.get('/venues', { params });
        return response.data;
    }

    // Get single venue by ID
    static async getVenue(id: string): Promise<ApiResponse<Venue>> {
        const response = await api.get(`/venues/${id}`);
        return response.data;
    }

    // Create a new venue (Organizer/Admin only)
    static async createVenue(data: {
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
        capacity: number;
        amenities?: string[];
        imageUrl?: string;
        sections?: {
            name: string;
            rowCount: number;
            seatsPerRow: number;
            priceMultiplier?: number;
        }[];
    }): Promise<ApiResponse<Venue>> {
        const response = await api.post('/venues', data);
        return response.data;
    }
}
