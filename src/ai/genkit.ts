import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // ✅ Switch to 2.0-flash (often has a separate quota from 2.5)
  model: 'googleai/gemini-2.0-flash', 
});