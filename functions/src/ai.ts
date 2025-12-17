import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';
import { onCall } from 'firebase-functions/v2/https';
import * as logger from "firebase-functions/logger";

// Singleton for Genkit instance to avoid top-level initialization blocking deployment
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

// Schemas
const IdeasSchema = z.object({
  ideas: z.array(z.string())
});

const OutlineSchema = z.object({
  introduction: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    points: z.array(z.string())
  })),
  conclusion: z.string()
});

const SeoSchema = z.object({
  keywords: z.array(z.string()),
  metaDescription: z.string()
});

// Export Cloud Functions
export const generatePostIdeas = onCall({ timeoutSeconds: 60, memory: "512MiB" }, async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }
  const { topic } = request.data;
  
  try {
    const ai = getAi();
    const prompt = `Generate 5 creative and engaging blog post titles about "${topic}". 
    The titles should be catchy, relevant to the Chiari Malformation community or general health/wellness if unspecified, 
    and optimized for clicks. Return ONLY a JSON object with a property 'ideas' containing the array of strings.`;

    const result = await ai.generate({
      prompt: prompt,
      output: { 
        format: 'json',
        schema: IdeasSchema
      }
    });

    return result.output;
  } catch (error) {
    logger.error("Error generating ideas", error);
    throw new Error('Failed to generate ideas');
  }
});

export const generateOutline = onCall({ timeoutSeconds: 60, memory: "512MiB" }, async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }
  const { title } = request.data;
  
  try {
    const ai = getAi();
    const prompt = `Create a detailed blog post outline for the title: "${title}".
    Include an introduction idea, 3-5 main section headings with bullet points for each, and a conclusion idea.
    Format the output as JSON.`;

    const result = await ai.generate({
      prompt: prompt,
      output: { 
        format: 'json',
        schema: OutlineSchema
      }
    });

    return result.output;
  } catch (error) {
     logger.error("Error generating outline", error);
     throw new Error('Failed to generate outline');
  }
});

export const generateSeo = onCall({ timeoutSeconds: 60, memory: "512MiB" }, async (request) => {
  if (!request.auth) {
    throw new Error('Unauthenticated');
  }
  const { content } = request.data;
  
  try {
    const ai = getAi();
    const prompt = `Analyze the following blog post content and generate 5-8 relevant SEO keywords and a compelling meta description (under 160 characters).
    
    Content: ${content.substring(0, 3000)}... (truncated for processing)
    
    Return JSON.`;

    const result = await ai.generate({
      prompt: prompt,
      output: { 
        format: 'json',
        schema: SeoSchema
      }
    });

    return result.output;
  } catch (error) {
     logger.error("Error generating SEO", error);
     throw new Error('Failed to generate SEO');
  }
});
