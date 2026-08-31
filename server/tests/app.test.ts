import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from '../src/app.js';

describe('erros de infraestrutura do Express', () => {
  it('devolve o envelope JSON da API para corpo malformado, nao a pagina HTML padrao do Express', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const response = await request(createApp())
      .post('/recommendations')
      .set('Content-Type', 'application/json')
      .send('{"location": {"latitude": 1,'); // JSON invalido de proposito

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({
      error: 'INVALID_REQUEST_BODY',
      message: expect.any(String),
    });
    // A pagina HTML padrao do Express inclui o caminho do sistema de arquivos
    // no stack trace; o envelope JSON nunca pode carregar isso.
    expect(response.text).not.toContain('node_modules');
  });

  it('devolve JSON para rota desconhecida, nao a pagina 404 padrao do Express', async () => {
    const response = await request(createApp()).get('/rota-que-nao-existe');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toEqual({ error: 'NOT_FOUND', message: expect.any(String) });
  });
});
