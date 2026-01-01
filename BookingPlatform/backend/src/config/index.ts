import dotenv from 'dotenv';

dotenv.config();

export const config = {
    // Server
    port: parseInt(process.env.PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',

    // JWT
    jwt: {
        secret: (process.env.JWT_SECRET || 'your-super-secret-key') as string,
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
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
