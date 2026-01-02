import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    max: 5, // Increase max connections (default is 10)
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 10000, // Wait 10s for a connection
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

const shutdown = async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
}

// Graceful shutdown
process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);
