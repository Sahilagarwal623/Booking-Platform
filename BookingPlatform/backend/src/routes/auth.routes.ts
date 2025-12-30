import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';

const router = Router();

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

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
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

        res.json({
            success: true,
            message: 'Login successful',
            data: result,
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
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required',
            });
            return;
        }

        const result = await AuthService.refreshToken(refreshToken);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
