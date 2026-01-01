"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    // Server
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    // JWT
    jwt: {
        secret: (process.env.JWT_SECRET || 'your-super-secret-key'),
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d'),
    },
    // Seat Hold Configuration
    seatHold: {
        ttlSeconds: parseInt(process.env.SEAT_HOLD_TTL || '600'), // 10 minutes
        maxSeatsPerUser: parseInt(process.env.MAX_SEATS_PER_USER || '6'),
    },
    // Redis (for distributed locking)
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    // Payment Gateway
    payment: {
        gateway: process.env.PAYMENT_GATEWAY || 'razorpay',
        razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID || '',
            keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        },
    },
    // Pagination defaults
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
    },
};
