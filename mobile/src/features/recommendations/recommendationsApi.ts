import { appConfig } from '../../config/app';
import type { TravelCategory } from '../../types/travel';
import type { RecommendationResponse } from './types';

type RequestRecommendationsInput = {
  latitude: number;
  longitude: number;
  category: TravelCategory;
  prompt: string;
};

export const requestRecommendations = async (
  input: RequestRecommendationsInput,
): Promise<RecommendationResponse> => {
  const response = await fetch(`${appConfig.apiBaseUrl}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation request failed with status ${response.status}`);
  }

  return (await response.json()) as RecommendationResponse;
};
