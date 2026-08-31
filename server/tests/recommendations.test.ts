import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';
import { RecommendationService } from '../src/services/RecommendationService.js';
import type { AIProvider } from '../src/integrations/ai/AIProvider.js';
import type { PlacesProvider } from '../src/integrations/places/PlacesProvider.js';
import { CostGuard } from '../src/services/CostGuard.js';
import { InMemoryApiUsageLogger } from '../src/services/ApiUsageLogger.js';
import { estimateCost } from '../src/config/pricing.js';

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

  it('recusa prompt gigante antes de gastar com a IA', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 38.7223, longitude: -9.1393 },
        intent: { prompt: 'a'.repeat(5_000) },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('INTENT_REQUIRED');
  });

  it('rejeita coordenadas fora da faixa valida', async () => {
    const response = await request(createApp())
      .post('/recommendations')
      .send({
        location: { latitude: 300, longitude: -9.1393 },
        intent: { category: 'Conhecer' },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('LOCATION_REQUIRED');
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
    ).rejects.toThrow('Nao foi possivel montar uma recomendacao');
  });

  it('descarta o id inventado pela IA e mantem os candidatos validos', async () => {
    const placesProvider: PlacesProvider = {
      async search() {
        return [
          {
            id: 'real-a',
            name: 'Real A',
            category: 'museum',
            latitude: 38.72,
            longitude: -9.13,
            distanceMeters: 300,
            rating: 4.7,
            reviewCount: 100,
            isOpenNow: true,
          },
          {
            id: 'real-b',
            name: 'Real B',
            category: 'cafe',
            latitude: 38.721,
            longitude: -9.131,
            distanceMeters: 400,
            rating: 4.5,
            reviewCount: 80,
            isOpenNow: true,
          },
        ];
      },
    };

    // O modelo devolve um id inventado no topo e repete um valido no fim:
    // nenhum dos dois pode derrubar a recomendacao inteira.
    const aiProvider: AIProvider = {
      async rankPlaces() {
        return [
          { placeId: 'invented-place', rank: 1, explanation: 'Alucinacao do modelo.' },
          { placeId: 'real-b', rank: 2, explanation: 'Candidato valido retornado pelo places.' },
          { placeId: 'real-a', rank: 3, explanation: 'Outro candidato valido retornado.' },
          { placeId: 'real-b', rank: 4, explanation: 'Repeticao que deve ser descartada.' },
        ];
      },
    };

    const service = new RecommendationService({
      placesProvider,
      aiProvider,
      usageLogger: new InMemoryApiUsageLogger(),
      costGuard: new CostGuard(5),
    });

    const result = await service.recommend({
      location: { latitude: 38.72, longitude: -9.13 },
      intent: { category: 'Conhecer' },
      travelMode: 'walking',
    });

    expect(result.recommendations.map((item) => item.place.id)).toEqual(['real-b', 'real-a']);
    // Renumerado: sem buraco na contagem que vai para a tela.
    expect(result.recommendations.map((item) => item.rank)).toEqual([1, 2]);
    expect(result.primaryRecommendation.place.id).toBe('real-b');
  });

  it('nao chama a IA quando a busca de lugares ja estourou o teto diario', async () => {
    const placesProvider: PlacesProvider = {
      providerName: 'google-places',
      async search() {
        return [
          {
            id: 'real-a',
            name: 'Real A',
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

    const rankPlaces = vi.fn();
    const aiProvider = { providerName: 'openai', rankPlaces } as unknown as AIProvider;

    // Teto que sobra menos que o custo de uma busca: a busca passa, a IA nao.
    const service = new RecommendationService({
      placesProvider,
      aiProvider,
      usageLogger: new InMemoryApiUsageLogger(),
      costGuard: new CostGuard(0.01),
    });

    await expect(
      service.recommend({
        location: { latitude: 38.72, longitude: -9.13 },
        intent: { category: 'Conhecer' },
        travelMode: 'walking',
      }),
    ).rejects.toThrow('Limite diario de custo');

    expect(rankPlaces).not.toHaveBeenCalled();
  });

  it('descarta ranking com explicacao vazia ou curta demais', async () => {
    const placesProvider: PlacesProvider = {
      async search() {
        return [
          {
            id: 'real-a',
            name: 'Real A',
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

    // Explicacao e o que o usuario le na tela: uma vazia ou irrisoriamente
    // curta e tao invalida quanto um id inventado.
    const aiProvider: AIProvider = {
      async rankPlaces() {
        return [{ placeId: 'real-a', rank: 1, explanation: '' }];
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
    ).rejects.toThrow('Nao foi possivel montar uma recomendacao');
  });

  it('cobra o custo mesmo quando a chamada da IA falha depois do request pago', async () => {
    const placesProvider: PlacesProvider = {
      providerName: 'google-places',
      async search() {
        return [
          {
            id: 'real-a',
            name: 'Real A',
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

    // Simula OpenAI cobrando os tokens e so depois devolvendo erro (JSON
    // malformado, 500 apos gerar a resposta, etc.).
    const aiProvider: AIProvider = {
      providerName: 'openai:gpt-4o-mini',
      async rankPlaces() {
        throw new Error('OpenAI request failed with status 500');
      },
    };

    const costGuard = new CostGuard(5);
    const service = new RecommendationService({
      placesProvider,
      aiProvider,
      usageLogger: new InMemoryApiUsageLogger(),
      costGuard,
    });

    await expect(
      service.recommend({
        location: { latitude: 38.72, longitude: -9.13 },
        intent: { category: 'Conhecer' },
        travelMode: 'walking',
      }),
    ).rejects.toThrow('OpenAI request failed');

    expect(costGuard.snapshot().spentUsd).toBeGreaterThan(0);
  });

  it('segura o teto sob recomendacoes concorrentes com o mesmo CostGuard', async () => {
    const placesProvider: PlacesProvider = {
      providerName: 'google-places',
      async search() {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return [
          {
            id: 'real-a',
            name: 'Real A',
            category: 'museum',
            latitude: 38.72,
            longitude: -9.13,
            isOpenNow: true,
          },
        ];
      },
    };

    const aiProvider: AIProvider = {
      providerName: 'fake-ai',
      async rankPlaces(input) {
        return input.candidates.map((candidate, index) => ({
          placeId: candidate.id,
          rank: index + 1,
          explanation: 'Explicacao valida o suficiente para passar na regra.',
        }));
      },
    };

    const costGuard = new CostGuard(3);
    const service = new RecommendationService({
      placesProvider,
      aiProvider,
      usageLogger: new InMemoryApiUsageLogger(),
      costGuard,
    });

    const request = {
      location: { latitude: 38.72, longitude: -9.13 },
      intent: { category: 'Conhecer' },
      travelMode: 'walking' as const,
    };

    // 200 recomendacoes concorrentes; cada uma cria seu proprio usageLogger
    // (config/providers.ts monta o service por request), mas todas compartilham
    // o mesmo CostGuard, como acontece de verdade no processo do servidor.
    await Promise.all(
      Array.from({ length: 200 }, () => service.recommend(request).catch(() => undefined)),
    );

    expect(costGuard.snapshot().spentUsd).toBeLessThanOrEqual(3 + estimateCost('google-places', 'search') + 1e-6);
  });
});
