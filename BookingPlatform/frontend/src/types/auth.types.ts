export type UserRole = 'USER' | 'ADMIN' | 'ORGANIZER';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface RegisterResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}