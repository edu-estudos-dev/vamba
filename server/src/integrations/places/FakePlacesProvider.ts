import type { PlaceCandidate, PlacesProvider, PlacesSearchContext } from './PlacesProvider.js';

export class FakePlacesProvider implements PlacesProvider {
  readonly providerName = 'fake-places';

  async search(context: PlacesSearchContext): Promise<PlaceCandidate[]> {
    const baseLatitude = context.latitude;
    const baseLongitude = context.longitude;

    return [
      {
        id: 'mock-lisbon-lookout',
        name: 'Miradouro de Santa Catarina',
        category: 'viewpoint',
        address: 'Rua de Santa Catarina, Lisboa',
        description: 'Mirante clássico para uma pausa curta com vista sobre o Tejo.',
        latitude: baseLatitude + 0.004,
        longitude: baseLongitude - 0.003,
        distanceMeters: 650,
        estimatedDurationMinutes: 9,
        rating: 4.6,
        reviewCount: 5800,
        priceLevel: 'budget',
        isOpenNow: true,
        source: 'mock',
      },
      {
        id: 'mock-lisbon-square',
        name: 'Praça do Comércio',
        category: 'landmark',
        address: 'Praça do Comércio, Lisboa',
        description: 'Praça histórica ampla, boa para caminhar e entender a cidade.',
        latitude: baseLatitude - 0.0084,
        longitude: baseLongitude - 0.0001,
        distanceMeters: 1_200,
        estimatedDurationMinutes: 17,
        rating: 4.7,
        reviewCount: 112000,
        priceLevel: 'budget',
        isOpenNow: true,
        source: 'mock',
      },
      {
        id: 'mock-lisbon-cafe',
        name: 'Café A Brasileira',
        category: 'restaurant',
        address: 'Rua Garrett 120, Lisboa',
        description: 'Café histórico no Chiado para uma parada rápida.',
        latitude: baseLatitude + 0.0018,
        longitude: baseLongitude - 0.0015,
        distanceMeters: 450,
        estimatedDurationMinutes: 6,
        rating: 4.1,
        reviewCount: 21000,
        priceLevel: 'moderate',
        isOpenNow: true,
        source: 'mock',
      },
    ];
  }
}
