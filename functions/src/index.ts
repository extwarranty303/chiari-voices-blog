import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Export the Genkit flows as Firebase Functions
// Note: In a real deployment, we'd export these directly from the file where they are defined
// or re-export them here.

export { generatePostIdeas, generateOutline, generateSeo } from './ai';

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
