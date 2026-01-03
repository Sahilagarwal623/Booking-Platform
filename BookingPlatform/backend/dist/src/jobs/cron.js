"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCronJobs = initializeCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const services_1 = require("../services");
/**
 * Initialize all background cron jobs
 */
function initializeCronJobs() {
    console.log('[cron] Initializing background jobs...');
    /**
     * Release expired seat holds
     * Runs every minute
     */
    let isReleasingHolds = false;
    node_cron_1.default.schedule('* * * * *', () => __awaiter(this, void 0, void 0, function* () {
        if (isReleasingHolds)
            return;
        isReleasingHolds = true;
        try {
            const result = yield services_1.SeatLockService.releaseExpiredHolds();
            if (result.released > 0) {
                console.log(`[cron] Released ${result.released} expired seat holds`);
            }
        }
        catch (error) {
            console.error('[cron] Error releasing expired holds:', error);
        }
        finally {
            isReleasingHolds = false;
        }
    }));
    /**
     * Expire pending bookings
     * Runs every minute
     */
    let isExpiringBookings = false;
    node_cron_1.default.schedule('* * * * *', () => __awaiter(this, void 0, void 0, function* () {
        if (isExpiringBookings)
            return;
        isExpiringBookings = true;
        try {
            const result = yield services_1.BookingService.expirePendingBookings();
            if (result.expired > 0) {
                console.log(`[cron] Expired ${result.expired} pending bookings`);
            }
        }
        catch (error) {
            console.error('[cron] Error expiring pending bookings:', error);
        }
        finally {
            isExpiringBookings = false;
        }
    }));
    /**
     * Clean up old notifications
     * Runs daily at midnight
     */
    node_cron_1.default.schedule('0 0 * * *', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { prisma } = yield Promise.resolve().then(() => __importStar(require('../config/database')));
            const result = yield prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: thirtyDaysAgo },
                    isRead: true,
                },
            });
            if (result.count > 0) {
                console.log(`[cron] Cleaned up ${result.count} old notifications`);
            }
        }
        catch (error) {
            console.error('[cron] Error cleaning notifications:', error);
        }
    }));
    console.log('[cron] Background jobs initialized successfully');
}
