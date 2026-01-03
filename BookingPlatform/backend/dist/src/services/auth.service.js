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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const client_1 = require("@prisma/client");
/**
 * Authentication Service
 * Handles user registration, login, and token management
 */
class AuthService {
    /**
     * Register a new user
     */
    static register(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, name, phone } = input;
            // Check if user exists
            const existingUser = yield database_1.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new middleware_1.ApiError(400, 'User with this email already exists');
            }
            // Hash password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            // Create user
            const user = yield database_1.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    phone,
                    role: client_1.UserRole.USER,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                },
            });
            // Generate tokens
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return Object.assign({ user }, tokens);
        });
    }
    /**
     * Login user
     */
    static login(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = input;
            // Find user
            const user = yield database_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new middleware_1.ApiError(401, 'Invalid email or password');
            }
            // Verify password
            const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                throw new middleware_1.ApiError(401, 'Invalid email or password');
            }
            // Generate tokens
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return Object.assign({ user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                } }, tokens);
        });
    }
    /**
     * Generate access and refresh tokens
     */
    static generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn,
        });
        return { accessToken, refreshToken };
    }
    /**
     * Refresh access token
     */
    static refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, config_1.config.jwt.secret);
                // Verify user still exists
                const user = yield database_1.prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: { id: true, email: true, role: true },
                });
                if (!user) {
                    throw new middleware_1.ApiError(401, 'User not found');
                }
                // Generate new access token
                const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
                return { accessToken };
            }
            catch (_a) {
                throw new middleware_1.ApiError(401, 'Invalid refresh token');
            }
        });
    }
    /**
     * Get user profile
     */
    static getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                    isVerified: true,
                    createdAt: true,
                    _count: {
                        select: {
                            bookings: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new middleware_1.ApiError(404, 'User not found');
            }
            return user;
        });
    }
    /**
     * Update user profile
     */
    static updateProfile(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.prisma.user.update({
                where: { id: userId },
                data,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    role: true,
                },
            });
            return user;
        });
    }
    /**
     * Change password
     */
    static changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield database_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new middleware_1.ApiError(404, 'User not found');
            }
            // Verify current password
            const isValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValid) {
                throw new middleware_1.ApiError(400, 'Current password is incorrect');
            }
            // Hash new password
            const salt = yield bcryptjs_1.default.genSalt(10);
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, salt);
            yield database_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return { success: true, message: 'Password changed successfully' };
        });
    }
}
exports.AuthService = AuthService;
