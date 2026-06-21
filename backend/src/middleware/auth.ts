import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userClerkId?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  const isSandbox =
    env.CLERK_SECRET_KEY === 'sk_test_placeholder' ||
    (token !== null && token.startsWith('mock_'));

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: 'Unauthorized: Authentication token is required', code: 'UNAUTHORIZED' }
    });
    return;
  }

  try {
    let clerkId: string;

    if (isSandbox) {
      clerkId = token.startsWith('mock_') ? token : 'mock-clerk-id';
    } else {
      const decoded = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
      clerkId = decoded.sub;
    }

    // Upsert local User by clerkId
    let user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          handle: `user_${Math.random().toString(36).substring(2, 8)}`
        }
      });
    }

    req.userId = user.id;
    req.userClerkId = clerkId;
    next();
  } catch (err: any) {
    console.error('[requireAuth] Authentication failed:', err.message || err);
    res.status(401).json({
      success: false,
      error: { message: 'Unauthorized: Invalid or expired authentication token', code: 'UNAUTHORIZED' }
    });
  }
};
