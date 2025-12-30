import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';
import venueRoutes from './venue.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/venues', venueRoutes);

export default router;
