"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const event_routes_1 = __importDefault(require("./event.routes"));
const booking_routes_1 = __importDefault(require("./booking.routes"));
const venue_routes_1 = __importDefault(require("./venue.routes"));
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
    });
});
// API Routes
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/events', event_routes_1.default);
router.use('/bookings', booking_routes_1.default);
router.use('/venues', venue_routes_1.default);
exports.default = router;
