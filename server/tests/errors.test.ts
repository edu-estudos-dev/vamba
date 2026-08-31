import { describe, expect, it, vi } from 'vitest';

import { AppError, toErrorResponse } from '../src/errors.js';

describe('toErrorResponse', () => {
  it('mantem a mensagem de erro de validacao, que foi escrita para o usuario', () => {
    const { status, body } = toErrorResponse(
      new AppError('LOCATION_REQUIRED', 'Latitude e longitude sao obrigatorias.'),
    );

    expect(status).toBe(400);
    expect(body).toEqual({
      error: 'LOCATION_REQUIRED',
      message: 'Latitude e longitude sao obrigatorias.',
    });
  });

  it('nao devolve ao cliente o corpo cru da resposta do provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const raw =
      'Google Places request failed with status 400: {"error":{"message":"API key not valid. Please pass a valid API key.","status":"INVALID_ARGUMENT"}}';

    const { status, body } = toErrorResponse(new Error(raw));

    expect(status).toBe(502);
    expect(body.error).toBe('PROVIDER_FAILED');
    expect(body.message).not.toContain('API key');
    expect(body.message).not.toContain('INVALID_ARGUMENT');
  });

  it('tambem esconde o detalhe quando o PROVIDER_FAILED vem de um AppError', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { body } = toErrorResponse(
      new AppError('PROVIDER_FAILED', 'AIProvider returned an unknown place id: ChIJinventado'),
    );

    expect(body.error).toBe('PROVIDER_FAILED');
    expect(body.message).not.toContain('ChIJinventado');
  });

  it('registra o detalhe no log do servidor, onde ele e util', () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('detalhe tecnico do provider');

    toErrorResponse(error);

    expect(logged).toHaveBeenCalledWith('provider.failed', error);
  });
});
