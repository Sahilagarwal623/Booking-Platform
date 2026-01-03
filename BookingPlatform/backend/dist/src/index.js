"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const middleware_1 = require("./middleware");
const cron_1 = require("./jobs/cron");
const config_1 = require("./config");
// Load env vars
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = config_1.config.port;
// Security middleware
app.use((0, helmet_1.default)());
// CORS - allow credentials for cookies
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
// Cookie parser - must be before routes
app.use((0, cookie_parser_1.default)());
// Request logging
if (config_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check (before routes)
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Booking Platform API',
        version: '1.0.0',
        docs: '/api/health',
    });
});
// API Routes
app.use('/api', routes_1.default);
// Error handling
app.use(middleware_1.notFound);
app.use(middleware_1.errorHandler);
// Start Server
app.listen(port, () => {
    console.log(`[server] Server is running at http://localhost:${port}`);
    console.log(`[server] Environment: ${config_1.config.nodeEnv}`);
    // Initialize background jobs
    (0, cron_1.initializeCronJobs)();
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
exports.default = app;
