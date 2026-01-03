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
const router = (0, express_1.Router)();
// Cookie options for security
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    path: '/',
};
const accessTokenCookieOptions = Object.assign(Object.assign({}, cookieOptions), { maxAge: 15 * 60 * 1000 });
const refreshTokenCookieOptions = Object.assign(Object.assign({}, cookieOptions), { maxAge: 7 * 24 * 60 * 60 * 1000 });
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, phone } = req.body;
        // Validate input
        if (!email || !password || !name) {
            res.status(400).json({
                success: false,
                message: 'Email, password, and name are required',
            });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
            return;
        }
        const result = yield services_1.AuthService.register({ email, password, name, phone });
        // Set cookies
        res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
        res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: result.user,
            },
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }
        const result = yield services_1.AuthService.login({ email, password });
        // Set cookies
        res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
        res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
            },
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Get refresh token from cookie
        const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }
        const result = yield services_1.AuthService.refreshToken(refreshToken);
        // Set new access token cookie
        res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);
        res.json({
            success: true,
            data: { message: 'Token refreshed' },
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear cookies
 * @access  Public
 */
router.post('/logout', (_req, res) => {
    // Clear cookies
    res.cookie('accessToken', '', Object.assign(Object.assign({}, cookieOptions), { maxAge: 0 }));
    res.cookie('refreshToken', '', Object.assign(Object.assign({}, cookieOptions), { maxAge: 0 }));
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});
exports.default = router;
