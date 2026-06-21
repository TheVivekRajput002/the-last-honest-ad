import { prisma } from '../lib/prisma';

export class FootprintService {
  static async lookup(categoryId: string, material?: string) {
    let factor = null;

    if (material) {
      factor = await prisma.emissionFactor.findFirst({
        where: {
          categoryId,
          material: {
            equals: material.trim().toLowerCase(),
            mode: 'insensitive',
          },
        },
      });
    }

    if (!factor) {
      factor = await prisma.emissionFactor.findFirst({
        where: {
          categoryId,
          OR: [
            { material: 'general' },
            { material: null },
          ],
        },
      });
    }

    if (!factor) {
      factor = await prisma.emissionFactor.findFirst({
        where: { categoryId },
      });
    }

    if (!factor) {
      throw new Error(`No emission factors found for category ID: ${categoryId}`);
    }

    return {
      co2eKg: factor.co2eKg,
      waterLiters: factor.waterLiters,
      wasteKg: factor.wasteKg,
      sourceCitation: factor.source,
      material: factor.material,
    };
  }
}
