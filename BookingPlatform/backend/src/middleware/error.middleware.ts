import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found error handler
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    } else if (err.name === 'PrismaClientKnownRequestError') {
        // Handle Prisma-specific errors
        const prismaError = err as any;
        statusCode = 400;

        if (prismaError.code === 'P2002') {
            // Unique constraint violation
            const target = prismaError.meta?.target;
            message = `A record with this ${target || 'value'} already exists.`;
        } else if (prismaError.code === 'P2025') {
            // Record not found
            statusCode = 404;
            message = 'Record not found.';
        } else {
            message = prismaError.message || 'Database error occurred.';
        }

        console.error('Prisma Error:', prismaError.code, prismaError.meta);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
