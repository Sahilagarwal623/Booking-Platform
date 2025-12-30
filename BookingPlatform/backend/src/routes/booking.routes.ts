import { Router, Request, Response, NextFunction } from 'express';
import { BookingService, SeatLockService } from '../services';
import { authenticate } from '../middleware';
import { BookingStatus } from '../../generated/prisma';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/bookings/hold-seats
 * @desc    Hold/lock seats temporarily
 * @access  Private
 */
router.post('/hold-seats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { eventId, seatIds } = req.body;

        if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Event ID and seat IDs are required',
            });
            return;
        }

        const result = await SeatLockService.holdSeats(eventId, seatIds, userId);

        res.json({
            success: true,
            message: 'Seats held successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/release-seats
 * @desc    Release held seats
 * @access  Private
 */
router.post('/release-seats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { seatIds } = req.body;

        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Seat IDs are required',
            });
            return;
        }

        const result = await SeatLockService.releaseSeats(seatIds, userId);

        res.json({
            success: true,
            message: 'Seats released successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/extend-hold
 * @desc    Extend seat hold time
 * @access  Private
 */
router.post('/extend-hold', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { seatIds, additionalSeconds } = req.body;

        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Seat IDs are required',
            });
            return;
        }

        const result = await SeatLockService.extendHold(seatIds, userId, additionalSeconds);

        res.json({
            success: true,
            message: 'Hold extended successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/bookings/hold-status
 * @desc    Get user's current seat holds
 * @access  Private
 */
router.get('/hold-status', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { eventId } = req.query;

        const holds = await SeatLockService.getHoldStatus(userId, eventId as string);

        res.json({
            success: true,
            data: holds,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/create
 * @desc    Create a booking from held seats
 * @access  Private
 */
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { eventId, seatIds } = req.body;

        if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Event ID and seat IDs are required',
            });
            return;
        }

        const booking = await BookingService.createBooking({ userId, eventId, seatIds });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Please complete payment.',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/:id/confirm
 * @desc    Confirm booking after payment
 * @access  Private
 */
router.post('/:id/confirm', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id;
        const { paymentId, paymentMethod } = req.body;

        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }

        if (!paymentId || !paymentMethod) {
            res.status(400).json({
                success: false,
                message: 'Payment ID and payment method are required',
            });
            return;
        }

        const booking = await BookingService.confirmBooking({
            bookingId,
            paymentId,
            paymentMethod,
        });

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const bookingId = req.params.id;
        const { reason } = req.body;

        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }

        const result = await BookingService.cancelBooking(bookingId, userId, reason);

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const isAdmin = req.user!.role === 'ADMIN';
        const bookingId = req.params.id;

        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }

        const booking = await BookingService.getBooking(
            bookingId,
            isAdmin ? undefined : userId
        );

        res.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { page = '1', limit = '10', status } = req.query;

        const result = await BookingService.getUserBookings(
            userId,
            parseInt(page as string),
            parseInt(limit as string),
            status as BookingStatus | undefined
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
