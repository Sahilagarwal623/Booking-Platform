import api from "./axios";
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, ApiResponse } from "../types/auth.types";


export class AuthService {

    static async login(request: LoginRequest): Promise<ApiResponse<LoginResponse>> {
        const response = await api.post('/auth/login', request);
        return response.data;
    }

    static async register(request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
        const response = await api.post('/auth/register', request);
        return response.data;
    }

    static async refreshTokens(): Promise<ApiResponse<{ message: string }>> {
        const response = await api.post('/auth/refresh-token');
        return response.data;
    }

    static async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore errors on logout
        }
        localStorage.removeItem('user');
    }

}