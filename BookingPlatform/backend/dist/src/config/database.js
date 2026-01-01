"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
// Create PostgreSQL connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    max: 20, // Increase max connections (default is 10)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Wait 10s for a connection
});
// Create Prisma adapter
const adapter = new adapter_pg_1.PrismaPg(pool);
// Singleton pattern for Prisma Client
const globalForPrisma = globalThis;
exports.prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new client_1.PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
}
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.prisma.$disconnect();
    yield pool.end();
    process.exit(0);
});
// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
