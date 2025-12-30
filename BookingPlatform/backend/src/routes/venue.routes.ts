import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize } from '../middleware';
import { Prisma } from '../../generated/prisma/client';

const router = Router();

// All venue routes for creation/update require admin/organizer
router.use(authenticate);

/**
 * @route   GET /api/venues
 * @desc    Get all venues
 * @access  Private
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { city, page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const where: Prisma.VenueWhereInput = {};
        if (city) {
            where.city = { contains: city as string, mode: 'insensitive' };
        }

        const [venues, total] = await Promise.all([
            prisma.venue.findMany({
                where,
                include: {
                    sections: true,
                    _count: {
                        select: { events: true },
                    },
                },
                skip,
                take: parseInt(limit as string),
            }),
            prisma.venue.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                venues,
                pagination: {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit as string)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/venues/:id
 * @desc    Get venue by ID
 * @access  Private
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const venue = await prisma.venue.findUnique({
            where: { id: req.params.id },
            include: {
                sections: true,
                events: {
                    where: {
                        status: 'PUBLISHED',
                        eventDate: { gte: new Date() },
                    },
                    orderBy: { eventDate: 'asc' },
                    take: 5,
                },
            },
        });

        if (!venue) {
            res.status(404).json({
                success: false,
                message: 'Venue not found',
            });
            return;
        }

        res.json({
            success: true,
            data: venue,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/venues
 * @desc    Create a new venue
 * @access  Private (Admin/Organizer)
 */
router.post(
    '/',
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                name,
                address,
                city,
                state,
                country,
                pincode,
                capacity,
                amenities,
                imageUrl,
                sections,
            } = req.body;

            // Validate required fields
            if (!name || !address || !city || !state || !country || !pincode || !capacity) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields',
                });
                return;
            }

            const venue = await prisma.venue.create({
                data: {
                    name,
                    address,
                    city,
                    state,
                    country,
                    pincode,
                    capacity,
                    amenities: amenities || [],
                    imageUrl,
                    sections: sections
                        ? {
                            create: sections.map((section: any) => ({
                                name: section.name,
                                rowCount: section.rowCount,
                                seatsPerRow: section.seatsPerRow,
                                priceMultiplier: section.priceMultiplier || 1.0,
                            })),
                        }
                        : undefined,
                },
                include: {
                    sections: true,
                },
            });

            res.status(201).json({
                success: true,
                message: 'Venue created successfully',
                data: venue,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   PUT /api/venues/:id
 * @desc    Update a venue
 * @access  Private (Admin/Organizer)
 */
router.put(
    '/:id',
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, address, city, state, country, pincode, capacity, amenities, imageUrl } =
                req.body;

            const venue = await prisma.venue.update({
                where: { id: req.params.id },
                data: {
                    name,
                    address,
                    city,
                    state,
                    country,
                    pincode,
                    capacity,
                    amenities,
                    imageUrl,
                },
                include: {
                    sections: true,
                },
            });

            res.json({
                success: true,
                message: 'Venue updated successfully',
                data: venue,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * @route   POST /api/venues/:id/sections
 * @desc    Add a section to venue
 * @access  Private (Admin/Organizer)
 */
router.post(
    '/:id/sections',
    authorize('ADMIN', 'ORGANIZER'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, rowCount, seatsPerRow, priceMultiplier } = req.body;

            const venueId = req.params.id;
            if (!venueId) {
                res.status(400).json({
                    success: false,
                    message: 'Venue ID is required',
                });
                return;
            }

            if (!name || !rowCount || !seatsPerRow) {
                res.status(400).json({
                    success: false,
                    message: 'Name, row count, and seats per row are required',
                });
                return;
            }

            const section = await prisma.section.create({
                data: {
                    venueId,
                    name,
                    rowCount,
                    seatsPerRow,
                    priceMultiplier: priceMultiplier || 1.0,
                },
            });

            res.status(201).json({
                success: true,
                message: 'Section added successfully',
                data: section,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
