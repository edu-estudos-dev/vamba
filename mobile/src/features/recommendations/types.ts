export type RecommendationPlace = {
  id: string;
  name: string;
  category: string;
  address?: string;
  description?: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  estimatedDurationMinutes?: number;
  rating?: number;
  reviewCount?: number;
  priceLevel?: 'budget' | 'moderate' | 'premium';
  isOpenNow?: boolean;
  source?: 'mock' | 'google';
};

export type RecommendationItem = {
  place: RecommendationPlace;
  rank: number;
  explanation: string;
};

export type RecommendationResponse = {
  recommendationId: string;
  generatedAt: string;
  primaryRecommendation: RecommendationItem;
  recommendations: RecommendationItem[];
  cost: {
    day: string;
    spentUsd: number;
    limitUsd: number;
    remainingUsd: number;
  };
  usageEvents: Array<{
    provider: string;
    operation: string;
    inputUnits: number;
    outputUnits: number;
    estimatedCost: number;
    createdAt: string;
  }>;
};
