import type { PlaceCandidate } from '../integrations/places/PlacesProvider.js';
import type { CostSnapshot } from '../services/CostGuard.js';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type TravelMode = 'walking' | 'driving' | 'transit';

export type RecommendationIntent = {
  category?: string;
  prompt?: string;
};

export type RecommendationRequest = {
  location: Coordinates;
  intent: RecommendationIntent;
  travelMode?: TravelMode;
  timeAvailableMinutes?: number;
  budget?: string;
  locale?: string;
};

export type RecommendationItem = {
  place: PlaceCandidate;
  rank: number;
  explanation: string;
};

export type RecommendationResponse = {
  recommendationId: string;
  generatedAt: string;
  primaryRecommendation: RecommendationItem;
  recommendations: RecommendationItem[];
  usageEvents: ApiUsageEvent[];
  cost: CostSnapshot;
};

export type ApiUsageEvent = {
  id: string;
  provider: string;
  operation: string;
  inputUnits: number;
  outputUnits: number;
  estimatedCost: number;
  createdAt: string;
};
