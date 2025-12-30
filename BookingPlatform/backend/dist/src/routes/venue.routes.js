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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All venue routes for creation/update require admin/organizer
router.use(middleware_1.authenticate);
/**
 * @route   GET /api/venues
 * @desc    Get all venues
 * @access  Private
 */
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city, page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }
        const [venues, total] = yield Promise.all([
            database_1.prisma.venue.findMany({
                where,
                include: {
                    sections: true,
                    _count: {
                        select: { events: true },
                    },
                },
                skip,
                take: parseInt(limit),
            }),
            database_1.prisma.venue.count({ where }),
        ]);
        res.json({
            success: true,
            data: {
                venues,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/venues/:id
 * @desc    Get venue by ID
 * @access  Private
 */
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const venue = yield database_1.prisma.venue.findUnique({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/venues
 * @desc    Create a new venue
 * @access  Private (Admin/Organizer)
 */
router.post('/', (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, city, state, country, pincode, capacity, amenities, imageUrl, sections, } = req.body;
        // Validate required fields
        if (!name || !address || !city || !state || !country || !pincode || !capacity) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
            return;
        }
        const venue = yield database_1.prisma.venue.create({
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
                        create: sections.map((section) => ({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   PUT /api/venues/:id
 * @desc    Update a venue
 * @access  Private (Admin/Organizer)
 */
router.put('/:id', (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, city, state, country, pincode, capacity, amenities, imageUrl } = req.body;
        const venue = yield database_1.prisma.venue.update({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/venues/:id/sections
 * @desc    Add a section to venue
 * @access  Private (Admin/Organizer)
 */
router.post('/:id/sections', (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const section = yield database_1.prisma.section.create({
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
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
