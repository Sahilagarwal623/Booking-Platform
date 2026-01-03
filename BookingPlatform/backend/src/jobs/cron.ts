import cron from 'node-cron';
import { SeatLockService, BookingService } from '../services';

/**
 * Initialize all background cron jobs
 */
export function initializeCronJobs() {
    console.log('[cron] Initializing background jobs...');

    /**
     * Release expired seat holds
     * Runs every minute
     */
    let isReleasingHolds = false;
    cron.schedule('* * * * *', async () => {
        if (isReleasingHolds) return;
        isReleasingHolds = true;
        try {
            const result = await SeatLockService.releaseExpiredHolds();
            if (result.released > 0) {
                console.log(`[cron] Released ${result.released} expired seat holds`);
            }
        } catch (error) {
            console.error('[cron] Error releasing expired holds:', error);
        } finally {
            isReleasingHolds = false;
        }
    });

    /**
     * Expire pending bookings
     * Runs every minute
     */
    let isExpiringBookings = false;
    cron.schedule('* * * * *', async () => {
        if (isExpiringBookings) return;
        isExpiringBookings = true;
        try {
            const result = await BookingService.expirePendingBookings();
            if (result.expired > 0) {
                console.log(`[cron] Expired ${result.expired} pending bookings`);
            }
        } catch (error) {
            console.error('[cron] Error expiring pending bookings:', error);
        } finally {
            isExpiringBookings = false;
        }
    });

    /**
     * Clean up old notifications
     * Runs daily at midnight
     */
    cron.schedule('0 0 * * *', async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { prisma } = await import('../config/database');
            const result = await prisma.notification.deleteMany({
                where: {
                    createdAt: { lt: thirtyDaysAgo },
                    isRead: true,
                },
            });

            if (result.count > 0) {
                console.log(`[cron] Cleaned up ${result.count} old notifications`);
            }
        } catch (error) {
            console.error('[cron] Error cleaning notifications:', error);
        }
    });

    console.log('[cron] Background jobs initialized successfully');
}
