import type { PlaceCandidate } from '../places/PlacesProvider.js';

export type RankedPlace = {
  placeId: string;
  rank: number;
  explanation: string;
};

export interface AIProvider {
  readonly providerName?: string;
  rankPlaces(input: {
    prompt: string;
    candidates: PlaceCandidate[];
  }): Promise<RankedPlace[]>;
}
