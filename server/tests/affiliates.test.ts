import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

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
