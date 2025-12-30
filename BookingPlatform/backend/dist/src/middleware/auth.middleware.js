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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const database_1 = require("../config/database");
/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Invalid token format.',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        // Verify user still exists
        const user = yield database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found.',
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
});
exports.authenticate = authenticate;
/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated.',
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to access this resource.',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token
 */
const optionalAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (!token) {
                next();
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
            const user = yield database_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true },
            });
            if (user) {
                req.user = user;
            }
        }
        next();
    }
    catch (_a) {
        // Token invalid, but that's okay for optional auth
        next();
    }
});
exports.optionalAuth = optionalAuth;
