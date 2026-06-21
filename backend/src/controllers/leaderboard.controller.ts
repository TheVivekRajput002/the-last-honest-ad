import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LeaderboardService } from '../services/leaderboard.service';

export class LeaderboardController {
  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        category: z.string().optional(),
        page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
        limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
      });

      const query = schema.parse(req.query);

      const result = await LeaderboardService.getLeaderboard(
        query.category,
        query.page,
        query.limit
      );

      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
