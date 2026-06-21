import { generateText } from 'ai';
import { groqModel } from '../lib/ai';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { FootprintService } from './footprint.service';

export class GenerationService {
  static async generate(data: {
    productName: string;
    categoryId: string;
    originalCopy: string;
    sourceUrl: string;
    material?: string;
    format?: 'CARD' | 'RECEIPT';
    userId?: string;
  }) {
    let category = await prisma.category.findFirst({
      where: { name: data.categoryId },
    });
    
    if (!category) {
      try {
        category = await prisma.category.findUnique({
          where: { id: data.categoryId },
        });
      } catch (e) {
        // Ignore invalid UUID errors
      }
    }

    if (!category) {
      throw new Error(`Category not found: ${data.categoryId}`);
    }

    const footprint = await FootprintService.lookup(category.id, data.material);

    let honestCopy = '';

    if (env.GOOGLE_GENERATIVE_AI_API_KEY === 'AIzaSyPlaceholder') {
      console.log('[GenerationService] Sandbox mode: generating mock copy');
      const mockCopies: Record<string, string> = {
        'fast-fashion': `This cheap ${data.material || 'apparel'} was made to be discarded. It used ${footprint.waterLiters}L of water and will end up in a landfill next season. But at least you'll look trendy for a week!`,
        'electronics': `A shiny new ${data.productName || 'device'} that will be obsolete in 18 months. It created ${footprint.wasteKg}kg of e-waste and ${footprint.co2eKg}kg of CO2. Buy now, throw away later!`,
        'flights': `Fly to your destination while dumping ${footprint.co2eKg}kg of CO2 straight into the upper atmosphere. Carbon offsets won't save this one!`,
        'fast-food': `Indulge in a factory-farmed ${data.material || 'meal'} that generated ${footprint.co2eKg}kg of greenhouse gases and ${footprint.waterLiters}L of water waste. Your body and the environment will pay later.`,
        'delivery': `Pay an underpaid courier to drive across town just to bring you a single item. Emissions: ${footprint.co2eKg}kg of CO2. Extreme convenience has a price.`,
        'home-goods': `Plastic home decor that will chip within months. Made from fossil fuels, emitting ${footprint.co2eKg}kg of CO2 during production. Modern trash for your living room.`,
      };
      honestCopy = mockCopies[category.name] || `A product you do not need. It cost the planet ${footprint.co2eKg}kg of carbon emissions and ${footprint.waterLiters}L of fresh water. Buy it anyway?`;
    } else {
      try {
        const prompt = `You are a satirical copywriter writing for "The Last Honest Ad". Here is real ad copy for a product named "${data.productName}" in the category "${category.name}".
Original Copy: "${data.originalCopy}"
Its estimated environmental footprint:
- CO2e: ${footprint.co2eKg} kg
- Water: ${footprint.waterLiters} liters
- Waste: ${footprint.wasteKg} kg
Sourced from: ${footprint.sourceCitation}

Rewrite this ad to sound like a perky infomercial that went terribly wrong. Start with their marketing enthusiasm, but immediately hit them with the brutal environmental reality using the exact footprint numbers provided.
Crucial rules:
1. Make it funny, punchy, and highly satirical.
2. DO NOT be preachy, depressing, or use generic guilt trips. Use the brand's own faux-positivity against them.
3. Keep it to 2-3 short sentences max. End with a sarcastic tagline.
`;

        const response = await generateText({
          model: groqModel as any,
          prompt,
        });

        honestCopy = response.text.trim();
      } catch (err: any) {
        console.error('[GenerationService] AI generation failed:', err.message || err);
        throw new Error('Failed to generate honest ad copy');
      }
    }

    const generatedAd = await prisma.generatedAd.create({
      data: {
        productName: data.productName,
        sourceUrl: data.sourceUrl,
        categoryId: category.id,
        originalCopy: data.originalCopy,
        honestCopy,
        co2eKg: footprint.co2eKg,
        waterLiters: footprint.waterLiters,
        wasteKg: footprint.wasteKg,
        sourceCitation: footprint.sourceCitation,
        format: data.format || 'CARD',
        userId: data.userId || null,
      },
    });

    if (data.userId) {
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          scansCount: { increment: 1 },
          totalFootprintSaved: { increment: footprint.co2eKg },
        },
      });
    }

    return generatedAd;
  }
}
