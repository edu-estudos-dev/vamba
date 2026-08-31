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

/**
 * Mapeia a categoria escolhida no app para `includedTypes` do Nearby Search
 * (New), Table A da Places API. Sem isso, toda categoria devolvia os mesmos
 * vizinhos genericos e so a IA reordenava por cima — "Comer" podia devolver
 * loja e monumento. "Surpreenda-me" e categorias sem mapa ficam sem filtro,
 * de proposito.
 * Lista conservadora com tipos confirmados da Table A; revisar se a precisao
 * da busca por categoria nao for suficiente.
 */
const includedTypesByCategory: Record<string, string[]> = {
  Comer: ['restaurant', 'cafe', 'bakery'],
  Conhecer: ['tourist_attraction', 'museum', 'art_gallery'],
  Passear: ['park', 'tourist_attraction'],
  Compras: ['shopping_mall', 'clothing_store', 'department_store'],
  'Vida noturna': ['bar', 'night_club'],
};

const EARTH_RADIUS_METERS = 6_371_000;
const WALKING_METERS_PER_MINUTE = 80; // ~4.8 km/h

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Distancia em linha reta entre dois pontos, suficiente para ordenar e exibir "perto". */
const haversineMeters = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): number => {
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(origin.latitude)) * Math.cos(toRadians(destination.latitude)) * Math.sin(deltaLon / 2) ** 2;

  return Math.round(EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatPrimaryType = (primaryType?: string): string | undefined =>
  primaryType ? primaryType.replace(/_/g, ' ').replace(/^\w/, (char) => char.toUpperCase()) : undefined;

export class GooglePlacesProvider implements PlacesProvider {
  readonly providerName = 'google-places';

  constructor(private readonly apiKey: string) {}

  async search(context: PlacesSearchContext): Promise<PlaceCandidate[]> {
    if (!this.apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is required to use GooglePlacesProvider');
    }

    const includedTypes = context.category ? includedTypesByCategory[context.category] : undefined;

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      // Sem teto de tempo, um provider lento prende o request Express e o
      // turista com o spinner travado por ate o timeout padrao do Node.
      signal: AbortSignal.timeout(8_000),
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours,places.primaryType',
      },
      body: JSON.stringify({
        maxResultCount: 8,
        languageCode: context.locale ?? 'pt-BR',
        ...(includedTypes ? { includedTypes } : {}),
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
      const errorData = await response.text();

      if (response.status === 403) {
        throw new Error(
          'Google Places recusou a chave (403). Verifique no projeto da GOOGLE_MAPS_API_KEY: conta de faturamento ativa, "Places API (New)" habilitada e presente nas restricoes de API da chave.',
        );
      }

      throw new Error(`Google Places request failed with status ${response.status}: ${errorData}`);
    }

    const payload = (await response.json()) as { places?: GooglePlace[] };
    return (payload.places ?? []).flatMap((place) => this.normalize(place, context));
  }

  private normalize(place: GooglePlace, context: PlacesSearchContext): PlaceCandidate[] {
    if (!place.id || !place.displayName?.text || !place.location?.latitude || !place.location.longitude) {
      return [];
    }

    const distanceMeters = haversineMeters(context, {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
    });

    return [
      {
        id: place.id,
        name: place.displayName.text,
        category: place.primaryType ?? 'place',
        address: place.formattedAddress,
        description: formatPrimaryType(place.primaryType),
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        distanceMeters,
        estimatedDurationMinutes: Math.max(1, Math.round(distanceMeters / WALKING_METERS_PER_MINUTE)),
        rating: place.rating,
        reviewCount: place.userRatingCount,
        priceLevel: this.normalizePriceLevel(place.priceLevel),
        isOpenNow: place.currentOpeningHours?.openNow,
        source: 'google' as const,
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
