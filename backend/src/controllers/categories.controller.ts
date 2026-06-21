import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

export class CategoriesController {
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          emissionFactors: true,
        },
      });

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }
}
