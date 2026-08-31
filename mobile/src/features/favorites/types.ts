import type { RecommendationPlace } from '../recommendations/types';

export type Favorite = RecommendationPlace & {
  savedAt: string;
};
