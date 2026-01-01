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
// All booking routes require authentication
router.use(middleware_1.authenticate);
/**
 * @route   POST /api/bookings/hold-seats
 * @desc    Hold/lock seats temporarily
 * @access  Private
 */
router.post('/hold-seats', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { eventId, seatIds } = req.body;
        console.log("eventId: ", eventId);
        console.log("seatIds: ", seatIds);
        if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Event ID and seat IDs are required',
            });
            return;
        }
        const result = yield services_1.SeatLockService.holdSeats(eventId, seatIds, userId);
        res.json({
            success: true,
            message: 'Seats held successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/bookings/release-seats
 * @desc    Release held seats
 * @access  Private
 */
router.post('/release-seats', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { seatIds } = req.body;
        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Seat IDs are required',
            });
            return;
        }
        const result = yield services_1.SeatLockService.releaseSeats(seatIds, userId);
        res.json({
            success: true,
            message: 'Seats released successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/bookings/extend-hold
 * @desc    Extend seat hold time
 * @access  Private
 */
router.post('/extend-hold', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { seatIds, additionalSeconds } = req.body;
        if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Seat IDs are required',
            });
            return;
        }
        const result = yield services_1.SeatLockService.extendHold(seatIds, userId, additionalSeconds);
        res.json({
            success: true,
            message: 'Hold extended successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/bookings/hold-status
 * @desc    Get user's current seat holds
 * @access  Private
 */
router.get('/hold-status', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { eventId } = req.query;
        const holds = yield services_1.SeatLockService.getHoldStatus(userId, eventId);
        res.json({
            success: true,
            data: holds,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/bookings/create
 * @desc    Create a booking from held seats
 * @access  Private
 */
router.post('/create', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { eventId, seatIds } = req.body;
        if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Event ID and seat IDs are required',
            });
            return;
        }
        const booking = yield services_1.BookingService.createBooking({ userId, eventId, seatIds });
        res.status(201).json({
            success: true,
            message: 'Booking created successfully. Please complete payment.',
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/bookings/:id/confirm
 * @desc    Confirm booking after payment
 * @access  Private
 */
router.post('/:id/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const booking = yield services_1.BookingService.confirmBooking({
            bookingId,
            paymentId,
            paymentMethod,
        });
        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Private
 */
router.post('/:id/cancel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.id;
        const bookingId = req.params.id;
        const reason = (_a = req.body) === null || _a === void 0 ? void 0 : _a.reason;
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }
        const result = yield services_1.BookingService.cancelBooking(bookingId, userId, reason);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Private
 */
router.get('/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';
        const bookingId = req.params.id;
        if (!bookingId) {
            res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
            return;
        }
        const booking = yield services_1.BookingService.getBooking(bookingId, isAdmin ? undefined : userId);
        res.json({
            success: true,
            data: booking,
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Private
 */
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { page = '1', limit = '10', status } = req.query;
        const result = yield services_1.BookingService.getUserBookings(userId, parseInt(page), parseInt(limit), status);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
