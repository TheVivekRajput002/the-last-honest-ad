import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ExtractionService } from '../services/extraction.service';
import { GenerationService } from '../services/generation.service';
import { prisma } from '../lib/prisma';
import { verifyToken } from '@clerk/backend';
import { env } from '../config/env';

export class AdsController {
  static async extract(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        pageText: z.string().min(1, 'pageText is required'),
        sourceUrl: z.string().url('Invalid sourceUrl').optional(),
      });

      const parsed = schema.parse(req.body);
      const result = await ExtractionService.extract(parsed.pageText);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        productName: z.string().min(1, 'productName is required'),
        categoryId: z.string().uuid('Invalid categoryId'),
        originalCopy: z.string().min(1, 'originalCopy is required'),
        sourceUrl: z.string().url('Invalid sourceUrl'),
        material: z.string().optional(),
        format: z.enum(['CARD', 'RECEIPT']).optional(),
      });

      const parsed = schema.parse(req.body);

      let userId: string | undefined = undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const isSandbox =
          env.CLERK_SECRET_KEY === 'sk_test_placeholder' || token.startsWith('mock_');
        try {
          let clerkId: string;
          if (isSandbox) {
            clerkId = token.startsWith('mock_') ? token : 'mock-clerk-id';
          } else {
            const decoded = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY });
            clerkId = decoded.sub;
          }

          let user = await prisma.user.findUnique({ where: { clerkId } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                clerkId,
                handle: `user_${Math.random().toString(36).substring(2, 8)}`,
              },
            });
          }
          userId = user.id;
        } catch (err) {
          console.warn('[AdsController.generate] Optional auth failed:', err);
        }
      }

      const generatedAd = await GenerationService.generate({
        ...parsed,
        userId,
      });

      res.status(201).json({
        success: true,
        data: generatedAd,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const ad = await prisma.generatedAd.findUnique({
        where: { id },
        include: { category: true },
      });

      if (!ad) {
        res.status(404).json({
          success: false,
          error: { message: 'Honest ad not found', code: 'NOT_FOUND' },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ad,
      });
    } catch (error) {
      next(error);
    }
  }
}
