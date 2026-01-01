"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = exports.ApiError = void 0;
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * Not Found error handler
 */
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFound = notFound;
/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, _next) => {
    var _a;
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (err.name === 'PrismaClientKnownRequestError') {
        // Handle Prisma-specific errors
        const prismaError = err;
        statusCode = 400;
        if (prismaError.code === 'P2002') {
            // Unique constraint violation
            const target = (_a = prismaError.meta) === null || _a === void 0 ? void 0 : _a.target;
            message = `A record with this ${target || 'value'} already exists.`;
        }
        else if (prismaError.code === 'P2025') {
            // Record not found
            statusCode = 404;
            message = 'Record not found.';
        }
        else {
            message = prismaError.message || 'Database error occurred.';
        }
        console.error('Prisma Error:', prismaError.code, prismaError.meta);
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }
    res.status(statusCode).json(Object.assign({ success: false, message }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
