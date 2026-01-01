import api from './axios';
import type { Event, EventsResponse, CreateEventRequest, UpdateEventRequest } from '../types/event.types';
import type { ApiResponse } from '../types/auth.types';

export class EventService {
    // Get events with filters
    static async getEvents(params?: {
        page?: number;
        limit?: number;
        category?: string;
        status?: string;
        minPrice?: number;
        maxPrice?: number;
        dateFrom?: string;
        dateTo?: string;
        city?: string;
    }): Promise<ApiResponse<EventsResponse>> {
        const response = await api.get('/events', { params });
        return response.data;
    }

    // Get single event by ID
    static async getEvent(id: string): Promise<ApiResponse<Event>> {
        const response = await api.get(`/events/${id}`);
        return response.data;
    }

    // Create a new event (Organizer/Admin only)
    static async createEvent(data: CreateEventRequest): Promise<ApiResponse<Event>> {
        const response = await api.post('/events', data);
        return response.data;
    }

    // Update an event (Organizer/Admin only)
    static async updateEvent(id: string, data: UpdateEventRequest): Promise<ApiResponse<Event>> {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    }

    // Publish an event (Organizer/Admin only)
    static async publishEvent(id: string): Promise<ApiResponse<Event>> {
        const response = await api.post(`/events/${id}/publish`);
        return response.data;
    }

    // Cancel an event (Organizer/Admin only)
    static async cancelEvent(id: string): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post(`/events/${id}/cancel`);
        return response.data;
    }

    // Get seat availability for an event
    static async getSeatAvailability(id: string): Promise<ApiResponse<unknown>> {
        const response = await api.get(`/events/${id}/seats`);
        console.log(response);
        return response.data;
    }
}