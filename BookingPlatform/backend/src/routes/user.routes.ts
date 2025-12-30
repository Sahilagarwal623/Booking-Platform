import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { authenticate } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const profile = await AuthService.getProfile(userId);

        res.json({
            success: true,
            data: profile,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { name, phone } = req.body;

        const updatedProfile = await AuthService.updateProfile(userId, { name, phone });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedProfile,
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Current password and new password are required',
            });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters',
            });
            return;
        }

        const result = await AuthService.changePassword(userId, currentPassword, newPassword);

        res.json({
            ...result,
            success: true,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
