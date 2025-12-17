import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Export the consolidated Genkit flow as a Firebase Function
export { blogAiHelper } from './ai';

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
