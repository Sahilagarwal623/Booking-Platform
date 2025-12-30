"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
/**
 * Success response helper
 */
function successResponse(data, message, pagination) {
    return Object.assign({ success: true, message,
        data }, (pagination && { pagination }));
}
/**
 * Error response helper
 */
function errorResponse(message, error) {
    return {
        success: false,
        message,
        error,
    };
}
