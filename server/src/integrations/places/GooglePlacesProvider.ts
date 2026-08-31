import type { PlaceCandidate, PlacesProvider, PlacesSearchContext } from './PlacesProvider.js';

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  currentOpeningHours?: { openNow?: boolean };
  primaryType?: string;
};

export class GooglePlacesProvider implements PlacesProvider {
  readonly providerName = 'google-places';

  constructor(private readonly apiKey: string) {}

  async search(context: PlacesSearchContext): Promise<PlaceCandidate[]> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is required to use GooglePlacesProvider');
    }

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.primaryType',
      },
      body: JSON.stringify({
        maxResultCount: 8,
        languageCode: context.locale ?? 'pt-BR',
        locationRestriction: {
          circle: {
            center: {
              latitude: context.latitude,
              longitude: context.longitude,
            },
            radius: context.radiusMeters ?? 2_000,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Places request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { places?: GooglePlace[] };
    return (payload.places ?? []).flatMap((place) => this.normalize(place));
  }

  private normalize(place: GooglePlace): PlaceCandidate[] {
    if (!place.id || !place.displayName?.text || !place.location?.latitude || !place.location.longitude) {
      return [];
    }

    return [
      {
        id: place.id,
        name: place.displayName.text,
        category: place.primaryType ?? 'place',
        address: place.formattedAddress,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        rating: place.rating,
        reviewCount: place.userRatingCount,
        priceLevel: this.normalizePriceLevel(place.priceLevel),
        isOpenNow: place.currentOpeningHours?.openNow,
        source: 'google',
      },
    ];
  }

  private normalizePriceLevel(value: string | undefined): PlaceCandidate['priceLevel'] {
    if (value === 'PRICE_LEVEL_INEXPENSIVE') {
      return 'budget';
    }

    if (value === 'PRICE_LEVEL_EXPENSIVE' || value === 'PRICE_LEVEL_VERY_EXPENSIVE') {
      return 'premium';
    }

    if (value) {
      return 'moderate';
    }

    return undefined;
  }
}
