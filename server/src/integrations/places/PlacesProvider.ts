export type PlaceCandidate = {
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
  photoUrl?: string;
  source?: 'mock' | 'google';
};

export type PlacesSearchContext = {
  latitude: number;
  longitude: number;
  query?: string;
  category?: string;
  locale?: string;
  radiusMeters?: number;
};

export interface PlacesProvider {
  readonly providerName?: string;
  search(context: PlacesSearchContext): Promise<PlaceCandidate[]>;
}
