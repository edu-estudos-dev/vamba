import dotenv from 'dotenv';

dotenv.config();

const readPort = (value: string | undefined): number => {
  const port = Number(value ?? 3000);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer');
  }

  return port;
};

const readPositiveNumber = (value: string | undefined, fallback: number, name: string): number => {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: readPort(process.env.PORT),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:8081',
  placesProvider: process.env.PLACES_PROVIDER ?? 'fake',
  aiProvider: process.env.AI_PROVIDER ?? 'fake',
  translationProvider: process.env.TRANSLATION_PROVIDER ?? 'fake',
  affiliateProvider: process.env.AFFILIATE_PROVIDER ?? 'fake',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
  googleTranslateApiKey: process.env.GOOGLE_TRANSLATE_API_KEY ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
  dailyCostLimitUsd: readPositiveNumber(process.env.DAILY_COST_LIMIT_USD, 5, 'DAILY_COST_LIMIT_USD'),
  translationMaxChars: readPositiveNumber(process.env.TRANSLATION_MAX_CHARS, 500, 'TRANSLATION_MAX_CHARS'),
};
