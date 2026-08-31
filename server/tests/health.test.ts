import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('GET /health', () => {
  it('returns the service status', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'vamba-server',
    });
  });

  it('expoe o consumo do teto diario de custo', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.body.cost).toMatchObject({
      limitUsd: expect.any(Number),
      spentUsd: expect.any(Number),
      remainingUsd: expect.any(Number),
    });
  });
});
