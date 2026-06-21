import { generateObject } from 'ai';
import { z } from 'zod';
import { groqModel } from '../lib/ai';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';

export class ExtractionService {
  static async extract(pageText: string) {
    const categories = await prisma.category.findMany();
    const categoryNames = categories.map((c) => c.name);

    if (env.GROQ_API_KEY === 'gsk_placeholder') {
      console.log('[ExtractionService] Sandbox mode: running simple keyword matcher');
      const text = pageText.toLowerCase();
      let matchedCategory = categoryNames[0] || 'electronics';
      for (const catName of categoryNames) {
        if (text.includes(catName.replace('-', ' ')) || text.includes(catName)) {
          matchedCategory = catName;
          break;
        }
      }

      let productName = 'Sample Product';
      const lines = pageText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length > 0) {
        productName = lines[0].substring(0, 50);
      }

      return {
        productName,
        category: matchedCategory,
        confidence: 0.85,
      };
    }

    try {
      const response = await generateObject({
        model: groqModel as any,
        schema: z.object({
          productName: z.string().describe('The name of the product or service advertised'),
          category: z.string().describe(`The best matching category from: ${categoryNames.join(', ')}`),
          confidence: z.number().min(0).max(1).describe('Confidence score from 0.0 to 1.0'),
        }),
        prompt: `You are an expert product classifier. Analyze the following webpage/ad text and extract the productName and the category.
The category MUST be one of these exact values: ${categoryNames.join(', ')}.

Webpage/Ad Text:
${pageText}
`,
      });

      let matchedCategory = response.object.category;
      if (!categoryNames.includes(matchedCategory)) {
        matchedCategory = categoryNames.includes('electronics') ? 'electronics' : categoryNames[0];
      }

      return {
        productName: response.object.productName,
        category: matchedCategory,
        confidence: response.object.confidence,
      };
    } catch (error: any) {
      console.error('[ExtractionService] AI extraction failed:', error.message || error);
      return {
        productName: 'Detected Product',
        category: categoryNames[0] || 'electronics',
        confidence: 0.5,
      };
    }
  }
}
