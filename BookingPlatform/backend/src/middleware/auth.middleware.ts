import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
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

        const decoded = jwt.verify(token, config.jwt.secret) as unknown as JwtPayload;

        // Verify user still exists
        const user = await prisma.user.findUnique({
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
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};

/**
 * Middleware to check if user has required role
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
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

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid token
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];

            if (!token) {
                next();
                return;
            }

            const decoded = jwt.verify(token, config.jwt.secret) as unknown as JwtPayload;

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true },
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch {
        // Token invalid, but that's okay for optional auth
        next();
    }
};
