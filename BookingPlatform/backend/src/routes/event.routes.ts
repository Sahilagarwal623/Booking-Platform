import { Router, Request, Response, NextFunction } from 'express';
import { EventService } from '../services';
import { authenticate, authorize, optionalAuth } from '../middleware';

const router = Router();

/**
 * @route   GET /api/events
 * @desc    Get all events with filters
 * @access  Public
 */
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            category,
            city,
            dateFrom,
            dateTo,
            minPrice,
            maxPrice,
            status,
            page = '1',
            limit = '10',
        } = req.query;

        const filters = {
            category: category as string,
            city: city as string,
            dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
            dateTo: dateTo ? new Date(dateTo as string) : undefined,
            minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
            status: status as string,  // 'all', 'DRAFT', 'PUBLISHED', etc.
        };

        const result = await EventService.getEvents(
            filters,
            parseInt(page as string),
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        const event = await EventService.getEvent(id);

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/events/:id/seats
 * @desc    Get seat availability for an event
 * @access  Public
 */
router.get('/:id/seats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        const availability = await EventService.getSeatAvailability(id);

        res.json({
            success: true,
            data: availability,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Admin/Organizer)
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                title,
                description,
                category,
                venueId,
                eventDate,
                endDate,
                gateOpenTime,
                basePrice,
                imageUrl,
                bannerUrl,
                termsConditions,
            } = req.body;

            // Validate required fields
            if (!title || !description || !category || !venueId || !eventDate || !basePrice) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
                return;
            }

            const event = await EventService.createEvent({
                title,
                description,
                category,
                venueId,
                eventDate: new Date(eventDate),
                endDate: endDate ? new Date(endDate) : undefined,
                gateOpenTime: gateOpenTime ? new Date(gateOpenTime) : undefined,
                basePrice: parseFloat(basePrice),
                imageUrl,
                bannerUrl,
                termsConditions,
            });

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Admin/Organizer)
 */
router.put(
    '/:id',
    authenticate,
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        try {
            const event = await EventService.updateEvent(id, req.body);

            res.json({
                success: true,
                message: 'Event updated successfully',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/events/:id/publish
 * @desc    Publish an event
 * @access  Private (Admin/Organizer)
 */
router.post(
    '/:id/publish',
    authenticate,
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        try {
            const event = await EventService.publishEvent(id);

            res.json({
                success: true,
                message: 'Event published successfully',
                data: event,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/events/:id/cancel
 * @desc    Cancel an event
 * @access  Private (Admin/Organizer)
 */
router.post(
    '/:id/cancel',
    authenticate,
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        try {
            const result = await EventService.cancelEvent(id);

            res.json({
                ...result,
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
