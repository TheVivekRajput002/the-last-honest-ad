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
    let analysisJson: any = null;

    if (env.GOOGLE_GENERATIVE_AI_API_KEY === 'AIzaSyPlaceholder') {
      console.log('[GenerationService] Sandbox mode: generating mock copy');
      const mockAnalysis = {
        honestAd: "This product's lifecycle is estimated to generate substantial environmental damage.",
        impactAnalysis: `The production process generated ${footprint.co2eKg} kg of CO2e and consumed ${footprint.waterLiters} liters of water.`,
        badEffects: "Contributes heavily to landfill accumulation and resource depletion.",
        hiddenProblems: "Invisible pollution and long-term ecosystem degradation often result from the disposal of this item."
      };
      honestCopy = mockAnalysis.honestAd;
      analysisJson = mockAnalysis;
    } else {
      try {
        const prompt = `You are an environmental analyst writing an impact report for a product. Here is the marketing copy for a product named "${data.productName}" in the category "${category.name}".
Original Copy: "${data.originalCopy}"
Its estimated environmental footprint:
- CO2e: ${footprint.co2eKg} kg
- Water: ${footprint.waterLiters} liters
- Waste: ${footprint.wasteKg} kg
Sourced from: ${footprint.sourceCitation}

Return ONLY a valid JSON object with the following fields:
- "honestAd": A truthful, punchy, 1-2 sentence honest marketing copy that replaces the original claims with harsh ecological reality.
- "impactAnalysis": A factual, scientific 2-sentence summary of the exact environmental footprint using the provided numbers.
- "badEffects": Specific detrimental ecological or social effects of this product type.
- "hiddenProblems": Issues not immediately obvious to the consumer (e.g. microplastics, e-waste hazards, supply chain issues).

Ensure the response is strictly JSON and nothing else.`;

        const response = await generateText({
          model: groqModel as any,
          prompt,
        });

        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          honestCopy = parsed.honestAd || "Environmental impact analysis complete.";
          analysisJson = parsed;
        } else {
          honestCopy = response.text.trim();
        }
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
        analysis: analysisJson,
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
