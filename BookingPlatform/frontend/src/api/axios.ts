import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important: Send cookies with requests
});

// Request interceptor - no need to manually attach tokens, cookies are sent automatically
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
            (originalRequest as any)._retry = true;

            try {
                // Try to refresh the token
                await api.post('/auth/refresh-token');
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear user data and redirect to login
                localStorage.removeItem('user');

                // Only redirect if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;

// Type for API error responses
export interface ApiErrorResponse {
    success: false;
    error: string;
    message?: string;
}

// Helper to extract error message
export const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorResponse;
        return data?.error || data?.message || error.message || 'Something went wrong';
    }
    return 'Something went wrong';
};
