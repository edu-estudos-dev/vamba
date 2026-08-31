import { afterEach, describe, expect, it, vi } from 'vitest';

import { GooglePlacesProvider } from '../src/integrations/places/GooglePlacesProvider.js';

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GooglePlacesProvider', () => {
  it('envia includedTypes quando a categoria tem mapa conhecido', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ places: [] }));

    const provider = new GooglePlacesProvider('fake-key');
    await provider.search({ latitude: 38.72, longitude: -9.13, category: 'Comer' });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);

    expect(body.includedTypes).toEqual(['restaurant', 'cafe', 'bakery']);
  });

  it('nao envia includedTypes para categoria sem mapa (ex.: Surpreenda-me)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ places: [] }));

    const provider = new GooglePlacesProvider('fake-key');
    await provider.search({ latitude: 38.72, longitude: -9.13, category: 'Surpreenda-me' });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);

    expect(body.includedTypes).toBeUndefined();
  });

  it('preenche distancia e duracao real a partir das coordenadas, em vez de deixar undefined', async () => {
    // ~1.11km ao norte da origem.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      jsonResponse({
        places: [
          {
            id: 'place-1',
            displayName: { text: 'Lugar Teste' },
            formattedAddress: 'Rua Teste, 1',
            location: { latitude: 38.73, longitude: -9.13 },
            primaryType: 'tourist_attraction',
          },
        ],
      }),
    );

    const provider = new GooglePlacesProvider('fake-key');
    const [place] = await provider.search({ latitude: 38.72, longitude: -9.13 });

    expect(place.distanceMeters).toBeGreaterThan(1_000);
    expect(place.distanceMeters).toBeLessThan(1_200);
    expect(place.estimatedDurationMinutes).toBeGreaterThan(0);
    expect(place.description).toBe('Tourist attraction');
  });
});
