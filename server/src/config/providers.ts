import { FakeAffiliateProvider } from '../integrations/affiliates/FakeAffiliateProvider.js';
import type { AffiliateProvider } from '../integrations/affiliates/AffiliateProvider.js';
import { FakeAIProvider } from '../integrations/ai/FakeAIProvider.js';
import { OpenAIProvider } from '../integrations/ai/OpenAIProvider.js';
import { FakePlacesProvider } from '../integrations/places/FakePlacesProvider.js';
import { GooglePlacesProvider } from '../integrations/places/GooglePlacesProvider.js';
import { FakeTranslationProvider } from '../integrations/translation/FakeTranslationProvider.js';
import { GoogleTranslationProvider } from '../integrations/translation/GoogleTranslationProvider.js';
import type { TranslationProvider } from '../integrations/translation/TranslationProvider.js';
import { InMemoryApiUsageLogger } from '../services/ApiUsageLogger.js';
import { CostGuard } from '../services/CostGuard.js';
import { RecommendationService } from '../services/RecommendationService.js';
import { TranslationService } from '../services/TranslationService.js';
import { env } from './env.js';
import { hasKnownOpenAiPricing } from './pricing.js';

/**
 * O teto de custo precisa somar entre requests, entao o guard e criado uma vez
 * por processo, diferente dos services, que sao montados por request.
 */
const costGuard = new CostGuard(env.dailyCostLimitUsd);

// Falha no boot, nao na primeira recomendacao: um modelo sem preco conhecido em
// pricing.ts faria o custo virar zero silenciosamente e o CostGuard nunca barrar
// gasto real com esse modelo.
if (env.aiProvider === 'openai' && !hasKnownOpenAiPricing(env.openaiModel)) {
  throw new Error(
    `OPENAI_MODEL "${env.openaiModel}" nao tem preco conhecido em server/src/config/pricing.ts. ` +
      'Adicione o preco por 1M tokens desse modelo antes de ativar AI_PROVIDER=openai.',
  );
}

const affiliateProvider: AffiliateProvider = new FakeAffiliateProvider();

export const getCostGuard = (): CostGuard => costGuard;

export const getAffiliateProvider = (): AffiliateProvider => affiliateProvider;

export const createRecommendationService = () => {
  const placesProvider =
    env.placesProvider === 'google'
      ? new GooglePlacesProvider(env.googleMapsApiKey)
      : new FakePlacesProvider();

  const aiProvider =
    env.aiProvider === 'openai'
      ? new OpenAIProvider(env.openaiApiKey, env.openaiModel)
      : new FakeAIProvider();

  return new RecommendationService({
    placesProvider,
    aiProvider,
    usageLogger: new InMemoryApiUsageLogger(),
    costGuard,
  });
};

export const createTranslationService = () => {
  const translationProvider: TranslationProvider =
    env.translationProvider === 'google'
      ? new GoogleTranslationProvider(env.googleTranslateApiKey)
      : new FakeTranslationProvider();

  return new TranslationService({
    translationProvider,
    costGuard,
    maxChars: env.translationMaxChars,
  });
};
