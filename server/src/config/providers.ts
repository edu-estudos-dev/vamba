import { FakeAIProvider } from '../integrations/ai/FakeAIProvider.js';
import { OpenAIProvider } from '../integrations/ai/OpenAIProvider.js';
import { FakePlacesProvider } from '../integrations/places/FakePlacesProvider.js';
import { GooglePlacesProvider } from '../integrations/places/GooglePlacesProvider.js';
import { InMemoryApiUsageLogger } from '../services/ApiUsageLogger.js';
import { RecommendationService } from '../services/RecommendationService.js';
import { env } from './env.js';

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
  });
};
