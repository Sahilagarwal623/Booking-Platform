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
const services_1 = require("../services");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/events
 * @desc    Get all events with filters
 * @access  Public
 */
router.get('/', middleware_1.optionalAuth, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, city, dateFrom, dateTo, minPrice, maxPrice, status, page = '1', limit = '10', } = req.query;
        const filters = {
            category: category,
            city: city,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            status: status, // 'all', 'DRAFT', 'PUBLISHED', etc.
        };
        const result = yield services_1.EventService.getEvents(filters, parseInt(page), parseInt(limit));
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        const event = yield services_1.EventService.getEvent(id);
        res.json({
            success: true,
            data: event,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/events/:id/seats
 * @desc    Get seat availability for an event
 * @access  Public
 */
router.get('/:id/seats', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ success: false, message: 'Event ID is required' });
            return;
        }
        const availability = yield services_1.EventService.getSeatAvailability(id);
        res.json({
            success: true,
            data: availability,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Admin/Organizer)
 */
router.post('/', middleware_1.authenticate, (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, category, venueId, eventDate, endDate, gateOpenTime, basePrice, imageUrl, bannerUrl, termsConditions, } = req.body;
        // Validate required fields
        if (!title || !description || !category || !venueId || !eventDate || !basePrice) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields',
            });
            return;
        }
        const event = yield services_1.EventService.createEvent({
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
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Admin/Organizer)
 */
router.put('/:id', middleware_1.authenticate, (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
    }
    try {
        const event = yield services_1.EventService.updateEvent(id, req.body);
        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/events/:id/publish
 * @desc    Publish an event
 * @access  Private (Admin/Organizer)
 */
router.post('/:id/publish', middleware_1.authenticate, (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
    }
    try {
        const event = yield services_1.EventService.publishEvent(id);
        res.json({
            success: true,
            message: 'Event published successfully',
            data: event,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/events/:id/cancel
 * @desc    Cancel an event
 * @access  Private (Admin/Organizer)
 */
router.post('/:id/cancel', middleware_1.authenticate, (0, middleware_1.authorize)('ADMIN', 'ORGANIZER'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ success: false, message: 'Event ID is required' });
        return;
    }
    try {
        const result = yield services_1.EventService.cancelEvent(id);
        res.json(Object.assign(Object.assign({}, result), { success: true }));
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
