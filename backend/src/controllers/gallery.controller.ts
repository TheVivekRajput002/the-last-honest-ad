import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { z } from 'zod';

export class GalleryController {
  static async publish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { message: 'Unauthorized: User ID not found', code: 'UNAUTHORIZED' },
        });
        return;
      }

      const ad = await prisma.generatedAd.findUnique({
        where: { id },
      });

      if (!ad) {
        res.status(404).json({
          success: false,
          error: { message: 'Generated ad not found', code: 'NOT_FOUND' },
        });
        return;
      }

      if (ad.userId && ad.userId !== userId) {
        res.status(403).json({
          success: false,
          error: { message: 'Forbidden: You do not own this ad', code: 'FORBIDDEN' },
        });
        return;
      }

      await prisma.generatedAd.update({
        where: { id },
        data: {
          isPublic: true,
          userId: ad.userId ? undefined : userId,
        },
      });

      const galleryPost = await prisma.galleryPost.upsert({
        where: { generatedAdId: id },
        update: {},
        create: {
          generatedAdId: id,
          likes: 0,
          shares: 0,
        },
        include: {
          generatedAd: {
            include: {
              category: true,
              user: {
                select: {
                  handle: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        data: galleryPost,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        category: z.string().optional(),
        page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
      });

      const query = schema.parse(req.query);
      const skip = (query.page - 1) * query.limit;

      const where: any = {
        generatedAd: {
          isPublic: true,
        },
      };

      if (query.category) {
        where.generatedAd.OR = [
          { categoryId: query.category },
          {
            category: {
              name: {
                equals: query.category,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      const items = await prisma.galleryPost.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
        include: {
          generatedAd: {
            include: {
              category: true,
              user: {
                select: {
                  handle: true,
                },
              },
            },
          },
        },
      });

      const total = await prisma.galleryPost.count({ where });

      const mappedItems = items.map((post) => ({
        ...post.generatedAd,
        galleryPostId: post.id,
        likes: post.likes,
        shares: post.shares,
      }));

      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

      res.status(200).json({
        success: true,
        data: {
          items: mappedItems,
          pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
