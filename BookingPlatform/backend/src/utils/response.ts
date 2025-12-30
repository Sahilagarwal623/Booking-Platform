/**
 * Standardized API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Success response helper
 */
export function successResponse<T>(
    data: T,
    message?: string,
    pagination?: ApiResponse['pagination']
): ApiResponse<T> {
    return {
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    };
}

/**
 * Error response helper
 */
export function errorResponse(message: string, error?: string): ApiResponse {
    return {
        success: false,
        message,
        error,
    };
}
