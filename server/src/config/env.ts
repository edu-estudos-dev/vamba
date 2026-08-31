import dotenv from 'dotenv';

dotenv.config();

const readPort = (value: string | undefined): number => {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:8081',
  placesProvider: process.env.PLACES_PROVIDER ?? 'fake',
  aiProvider: process.env.AI_PROVIDER ?? 'fake',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-5-mini',
};
