import { appConfig } from '../../config/app';
import { apiRequest } from '../../lib/apiClient';
import type { TravelCategory } from '../../types/travel';
import type { RecommendationResponse } from './types';

type RequestRecommendationsInput = {
  latitude: number;
  longitude: number;
  category: TravelCategory;
  prompt: string;
};

export const requestRecommendations = (
  input: RequestRecommendationsInput,
): Promise<RecommendationResponse> =>
  apiRequest<RecommendationResponse>('/recommendations', {
    method: 'POST',
    body: {
      location: {
        latitude: input.latitude,
        longitude: input.longitude,
      },
      intent: {
        category: input.category,
        prompt: input.prompt,
      },
      travelMode: 'walking',
      locale: appConfig.defaultLocale,
    },
  });
