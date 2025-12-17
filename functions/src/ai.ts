import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { onCall } from 'firebase-functions/v2/https';
import * as logger from "firebase-functions/logger";

let aiInstance: any = null;

function getAi() {
  if (!aiInstance) {
    logger.info("Initializing Genkit instance...");
    aiInstance = genkit({
      plugins: [googleAI()],
      model: gemini15Flash,
    });
  }
  return aiInstance;
}

const OutputSchema = z.object({
  readTime: z.string().optional().describe("Estimated read time, e.g. '5 min read'"),
  tags: z.array(z.string()).optional().describe("An array of 3-5 relevant tags."),
  ideas: z.array(z.string()).optional().describe("An array of 5 blog post title ideas."),
});

export const blogAiHelper = onCall({ timeoutSeconds: 60, memory: "512MiB" }, async (request) => {
  if (!request.auth) throw new Error('Unauthenticated');
  
  const { type, content, topic } = request.data;
  const ai = getAi();
  
  let prompt = '';
  
  switch (type) {
    case 'readTime':
      prompt = `Calculate the estimated read time for the following text. Assume an average reading speed of 200 words per minute. Format the output as a string like 'X min read'. Text: ${content}`;
      break;
    case 'tags':
      prompt = `Generate 3-5 relevant SEO-friendly tags for the following blog post content. The tags should be concise and relevant to the main topics. Content: ${content}`;
      break;
    case 'ideas':
      prompt = `Generate 5 creative and engaging blog post titles about "${topic}". The titles should be catchy and relevant to the Chiari Malformation community.`;
      break;
    default:
      throw new Error('Invalid AI helper type requested.');
  }

  try {
    const result = await ai.generate({
      prompt,
      output: { 
        format: 'json',
        schema: OutputSchema
      }
    });
    return result.output;
  } catch (error) {
    logger.error(`AI Error for type: ${type}`, error);
    throw new Error('Failed to generate AI content.');
  }
});
