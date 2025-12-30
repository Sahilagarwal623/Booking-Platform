import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { ApiError } from '../middleware';
import { UserRole } from '../../generated/prisma';

interface RegisterInput {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

interface LoginInput {
    email: string;
    password: string;
}

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Authentication Service
 * Handles user registration, login, and token management
 */
export class AuthService {
    /**
     * Register a new user
     */
    static async register(input: RegisterInput) {
        const { email, password, name, phone } = input;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role: UserRole.USER,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
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

        return {
            user,
            ...tokens,
        };
    }

    /**
     * Login user
     */
    static async login(input: LoginInput) {
        const { email, password } = input;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // Generate tokens
        const tokens = this.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role,
            },
            ...tokens,
        };
    }

    /**
     * Generate access and refresh tokens
     */
    private static generateTokens(payload: TokenPayload) {
        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        const refreshToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.refreshExpiresIn,
        });

        return { accessToken, refreshToken };
    }

    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken: string) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwt.secret) as TokenPayload;

            // Verify user still exists
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true },
            });

            if (!user) {
                throw new ApiError(401, 'User not found');
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                config.jwt.secret,
                { expiresIn: config.jwt.expiresIn }
            );

            return { accessToken };
        } catch {
            throw new ApiError(401, 'Invalid refresh token');
        }
    }

    /**
     * Get user profile
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
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
            throw new ApiError(404, 'User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        userId: string,
        data: { name?: string; phone?: string }
    ) {
        const user = await prisma.user.update({
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
    }

    /**
     * Change password
     */
    static async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            throw new ApiError(400, 'Current password is incorrect');
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: 'Password changed successfully' };
    }
}
