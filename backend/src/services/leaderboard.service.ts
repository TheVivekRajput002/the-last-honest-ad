import { prisma } from '../lib/prisma';

export class LeaderboardService {
  static async getLeaderboard(categoryId?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const items = await prisma.generatedAd.findMany({
      where,
      orderBy: {
        co2eKg: 'desc',
      },
      skip,
      take: limit,
      include: {
        category: true,
      },
    });

    const total = await prisma.generatedAd.count({ where });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
