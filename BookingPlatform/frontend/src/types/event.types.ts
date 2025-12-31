export interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    capacity: number;
    amenities?: string[];
    imageUrl?: string;
    sections?: Section[];
}

export interface Section {
    id: string;
    name: string;
    rowCount: number;
    seatsPerRow: number;
    priceMultiplier: number;
}

export interface Event {
    id: string;
    name: string;
    title?: string;
    description: string;
    date: string;
    time: string;
    endDate?: string;
    venue: {
        id: string;
        name: string;
        address: string;
    };
    category: string;
    status: EventStatus;
    imageUrl?: string;
    bannerUrl?: string;
    totalSeats: number;
    availableSeats: number;
    minPrice: number;
    maxPrice: number;
    termsConditions?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

export type EventCategory =
    | 'MUSIC'
    | 'SPORTS'
    | 'COMEDY'
    | 'THEATER'
    | 'CONFERENCE'
    | 'EXHIBITION'
    | 'WORKSHOP'
    | 'OTHER';

export interface CreateEventRequest {
    title: string;
    description: string;
    category: EventCategory | string;
    venueId: string;
    eventDate: string;  // ISO date string
    endDate?: string;
    gateOpenTime?: string;
    basePrice: number;
    imageUrl?: string;
    bannerUrl?: string;
    termsConditions?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> { }

export interface EventsResponse {
    events: Event[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface VenuesResponse {
    venues: Venue[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}