import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { RecommendationService } from '../src/services/RecommendationService.js';
import type { AIProvider } from '../src/integrations/ai/AIProvider.js';
import type { PlacesProvider } from '../src/integrations/places/PlacesProvider.js';
import { CostGuard } from '../src/services/CostGuard.js';
import { InMemoryApiUsageLogger } from '../src/services/ApiUsageLogger.js';

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  vi.restoreAllMocks();
});

describe('POST /recommendations', () => {
  it('returns ranked mock places from real candidate IDs', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: { category: 'Conhecer', prompt: 'Tenho duas horas livres' },
        travelMode: 'walking',
      });

    expect(response.status).toBe(200);
    expect(response.body.primaryRecommendation.place.id).toBe('mock-lisbon-lookout');
    expect(response.body.primaryRecommendation.explanation).toContain('próximo');
    expect(response.body.usageEvents).toEqual([
      expect.objectContaining({ provider: 'fake-places', operation: 'search' }),
      expect.objectContaining({ provider: 'fake-ai', operation: 'rankPlaces' }),
    ]);
  });

  it('rejects requests without coordinates', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        intent: { category: 'Comer' },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('LOCATION_REQUIRED');
  });

  it('logs only latitude and longitude in development', async () => {
    process.env.NODE_ENV = 'development';
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: -3.7319, longitude: -38.5267 },
        intent: { category: 'Conhecer' },
      });

    expect(infoSpy).toHaveBeenCalledWith('recommendations.location', {
      latitude: -3.7319,
      longitude: -38.5267,
    });
  });

  it('does not log coordinates outside development', async () => {
    process.env.NODE_ENV = 'production';
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);

    await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: -3.7319, longitude: -38.5267 },
        intent: { category: 'Conhecer' },
      });

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('returns all recommendations with ranking order', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: { category: 'Comer', prompt: 'Restaurante com piscina' },
      });

    expect(response.status).toBe(200);
    expect(response.body.recommendations.length).toBeGreaterThan(1);
    expect(response.body.recommendations[0].rank).toBe(1);
    expect(response.body.recommendations[1].rank).toBe(2);
  });

  it('requires intent with category or prompt', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: {},
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INTENT_REQUIRED');
  });

  it('respects locale param', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: { prompt: 'Test' },
        locale: 'en-US',
      });

    expect(response.status).toBe(200);
    expect(response.body.recommendations[0].place).toHaveProperty('id');
  });

  it('response includes all required fields', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: { category: 'Conhecer' },
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('recommendationId');
    expect(response.body).toHaveProperty('generatedAt');
    expect(response.body).toHaveProperty('primaryRecommendation');
    expect(response.body).toHaveProperty('recommendations');
    expect(response.body).toHaveProperty('usageEvents');
    expect(response.body.primaryRecommendation.place).toHaveProperty('id');
    expect(response.body.primaryRecommendation.place).toHaveProperty('name');
    expect(response.body.primaryRecommendation.place).toHaveProperty('latitude');
    expect(response.body.primaryRecommendation.place).toHaveProperty('longitude');
  });
});

describe('RecommendationService', () => {
  it('rejects AI rankings that reference places not returned by PlacesProvider', async () => {
    const placesProvider: PlacesProvider = {
      async search() {
        return [
          {
            id: 'real-candidate',
            name: 'Real Candidate',
            category: 'museum',
            latitude: 38.72,
            longitude: -9.13,
            distanceMeters: 300,
            rating: 4.7,
            reviewCount: 100,
            isOpenNow: true,
          },
        ];
      },
    };

    const aiProvider: AIProvider = {
      async rankPlaces() {
        return [
          {
            placeId: 'invented-place',
            rank: 1,
            explanation: 'This should never be accepted.',
          },
        ];
      },
    };

    const service = new RecommendationService({
      placesProvider,
      aiProvider,
      usageLogger: new InMemoryApiUsageLogger(),
      costGuard: new CostGuard(5),
    });

    await expect(
      service.recommend({
        location: { latitude: 38.72, longitude: -9.13 },
        intent: { category: 'Conhecer' },
        travelMode: 'walking',
      }),
    ).rejects.toThrow('AIProvider returned an unknown place id: invented-place');
  });
});
