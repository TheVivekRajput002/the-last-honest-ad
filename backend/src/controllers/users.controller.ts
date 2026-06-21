import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

export class UsersController {
  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized: User not authenticated', code: 'UNAUTHORIZED' },
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          clerkId: true,
          handle: true,
          totalFootprintSaved: true,
          scansCount: true,
        },
      });

      const items = await prisma.generatedAd.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      });

      res.status(200).json({
        success: true,
        data: {
          user,
          items,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateHandle(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized: User not authenticated', code: 'UNAUTHORIZED' },
        });
        return;
      }

      const schema = z.object({
        handle: z
          .string()
          .min(3)
          .max(30)
          .regex(
            /^[a-zA-Z0-9_]+$/,
            'Handle can only contain alphanumeric characters and underscores'
          ),
      });

      const { handle } = schema.parse(req.body);

      const existing = await prisma.user.findUnique({
        where: { handle },
      });

      if (existing && existing.id !== userId) {
        res.status(409).json({
          success: false,
          error: { message: 'Handle is already taken', code: 'CONFLICT' },
        });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { handle },
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
