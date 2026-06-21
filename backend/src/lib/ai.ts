import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';

export const geminiModel = google('gemini-1.5-flash');
export const groqModel = groq('llama-3.1-8b-instant');
