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

    const dbFootprint = await FootprintService.lookup(category.id, data.material);
    let dynamicFootprint = { ...dbFootprint };

    let honestCopy = '';
    let analysisJson: any = null;

    if (env.GOOGLE_GENERATIVE_AI_API_KEY === 'AIzaSyPlaceholder') {
      console.log('[GenerationService] Sandbox mode: generating mock copy');
      const mockAnalysis = {
        honestAd: "This product's lifecycle is estimated to generate substantial environmental damage.",
        impactAnalysis: `The production process generated ${dynamicFootprint.co2eKg} kg of CO2e and consumed ${dynamicFootprint.waterLiters} liters of water.`,
        badEffects: "Contributes heavily to landfill accumulation and resource depletion.",
        hiddenProblems: "Invisible pollution and long-term ecosystem degradation often result from the disposal of this item.",
        ecoAlternative: "Consider purchasing second-hand or seeking out products made from certified recycled or biodegradable materials."
      };
      honestCopy = mockAnalysis.honestAd;
      analysisJson = mockAnalysis;
    } else {
      try {
        const prompt = `You are an environmental analyst writing an impact report for a product. Here is the marketing copy for a product named "${data.productName}" in the category "${category.name}".
Original Copy: "${data.originalCopy}"

Please estimate the specific environmental lifecycle footprint (production, transport, use, and disposal) for this exact product type. Do NOT use generic category numbers. Be highly specific.

Return ONLY a valid JSON object with the following exact fields:
- "honestAd": A truthful, punchy, 1-2 sentence honest marketing copy that replaces the original claims with harsh ecological reality.
- "impactAnalysis": A factual, scientific 2-sentence summary explaining your environmental footprint estimates.
- "badEffects": Specific detrimental ecological or social effects of this product type.
- "hiddenProblems": Issues not immediately obvious to the consumer (e.g. microplastics, rare earth mining, e-waste hazards, sweatshops).
- "ecoAlternative": A practical, environmentally friendly alternative to this product or an actionable tip to minimize impact.
- "estimatedCo2eKg": A realistic numeric estimate of the CO2e footprint in kg (e.g., 2.5). Just the number.
- "estimatedWaterLiters": A realistic numeric estimate of water usage in liters (e.g., 500). Just the number.
- "estimatedWasteKg": A realistic numeric estimate of waste generated in kg (e.g., 0.2). Just the number.

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

          if (typeof parsed.estimatedCo2eKg === 'number') dynamicFootprint.co2eKg = parsed.estimatedCo2eKg;
          if (typeof parsed.estimatedWaterLiters === 'number') dynamicFootprint.waterLiters = parsed.estimatedWaterLiters;
          if (typeof parsed.estimatedWasteKg === 'number') dynamicFootprint.wasteKg = parsed.estimatedWasteKg;
          dynamicFootprint.sourceCitation = 'AI Lifecycle Assessment Estimation';

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
        co2eKg: dynamicFootprint.co2eKg,
        waterLiters: dynamicFootprint.waterLiters,
        wasteKg: dynamicFootprint.wasteKg,
        sourceCitation: dynamicFootprint.sourceCitation,
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
          totalFootprintSaved: { increment: dynamicFootprint.co2eKg },
        },
      });
    }

    return generatedAd;
  }
}
