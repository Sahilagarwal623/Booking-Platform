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

    static async refreshTokens(): Promise<ApiResponse<{ accessToken: string }>> {

        const refreshToken = localStorage.getItem('refreshToken');
        const response = await api.post('/auth/refresh-token', { refreshToken });
        return response.data;
    }

    static logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

}