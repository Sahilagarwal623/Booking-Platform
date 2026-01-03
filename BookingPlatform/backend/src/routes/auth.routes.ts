import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';

const router = Router();

// Cookie options for security
const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none' as const,
    path: '/',
};

const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
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

        const result = await AuthService.register({ email, password, name, phone });

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
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
            return;
        }

        const result = await AuthService.login({ email, password });

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
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }

        const result = await AuthService.refreshToken(refreshToken);

        // Set new access token cookie
        res.cookie('accessToken', result.accessToken, accessTokenCookieOptions);

        res.json({
            success: true,
            data: { message: 'Token refreshed' },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear cookies
 * @access  Public
 */
router.post('/logout', (_req: Request, res: Response) => {
    // Clear cookies
    res.cookie('accessToken', '', { ...cookieOptions, maxAge: 0 });
    res.cookie('refreshToken', '', { ...cookieOptions, maxAge: 0 });

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
});

export default router;
