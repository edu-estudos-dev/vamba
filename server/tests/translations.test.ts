import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app.js';

describe('POST /translations', () => {
  it('traduz uma expressao conhecida do phrasebook mockado', async () => {
    const response = await request(createApp())
      .post('/translations')
      .send({ text: 'Bom dia', targetLanguage: 'en' });

    expect(response.status).toBe(200);
    expect(response.body.translatedText).toBe('good morning');
    expect(response.body.isMock).toBe(true);
  });

  it('marca como mock em vez de inventar traducao desconhecida', async () => {
    const response = await request(createApp())
      .post('/translations')
      .send({ text: 'onde compro um chip de celular', targetLanguage: 'en' });

    expect(response.status).toBe(200);
    expect(response.body.isMock).toBe(true);
    expect(response.body.translatedText).toContain('mock');
  });

  it('recusa texto vazio', async () => {
    const response = await request(createApp())
      .post('/translations')
      .send({ text: '   ', targetLanguage: 'en' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('TRANSLATION_INPUT_REQUIRED');
  });

  it('recusa pedido sem idioma de destino', async () => {
    const response = await request(createApp()).post('/translations').send({ text: 'Bom dia' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('TRANSLATION_INPUT_REQUIRED');
  });

  it('recusa texto acima do limite de caracteres', async () => {
    const response = await request(createApp())
      .post('/translations')
      .send({ text: 'a'.repeat(5_000), targetLanguage: 'en' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('TRANSLATION_INPUT_REQUIRED');
  });
});
