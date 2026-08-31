import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';
import { FakeAffiliateProvider } from '../src/integrations/affiliates/FakeAffiliateProvider.js';

describe('/affiliates', () => {
  it('devolve ofertas da categoria e marca todas como mock', async () => {
    const response = await request(createApp()).get('/affiliates').query({ category: 'restaurant' });

    expect(response.status).toBe(200);
    expect(response.body.offers.length).toBeGreaterThan(0);
    expect(response.body.offers.every((offer: { isMock: boolean }) => offer.isMock)).toBe(true);
  });

  it('nao aponta oferta mockada para um parceiro real', async () => {
    const response = await request(createApp()).get('/affiliates').query({ category: 'landmark' });

    for (const offer of response.body.offers as Array<{ trackedUrl: string }>) {
      expect(offer.trackedUrl).toContain('example.com');
    }
  });

  it('usa oferta generica quando a categoria nao tem parceiro', async () => {
    const response = await request(createApp()).get('/affiliates').query({ category: 'inexistente' });

    expect(response.status).toBe(200);
    expect(response.body.offers).toHaveLength(1);
  });

  it('registra clique em oferta', async () => {
    const response = await request(createApp())
      .post('/affiliates/clicks')
      .send({ offerId: 'mock-offer-city-pass', placeId: 'mock-lisbon-square' });

    expect(response.status).toBe(202);
    expect(response.body.recorded).toBe(true);
  });

  it('recusa clique sem offerId', async () => {
    const response = await request(createApp()).post('/affiliates/clicks').send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('OFFER_REQUIRED');
  });
});

describe('FakeAffiliateProvider', () => {
  it('mantem o log de cliques limitado para nao esgotar a memoria do processo', async () => {
    const provider = new FakeAffiliateProvider();

    for (let index = 0; index < 1_200; index += 1) {
      await provider.recordClick({ offerId: `offer-${index}` });
    }

    const clicks = provider.getClicks();

    expect(clicks).toHaveLength(1_000);
    // Mantem os mais recentes, que sao os uteis para decisao de negocio.
    expect(clicks[clicks.length - 1]?.offerId).toBe('offer-1199');
  });
});
