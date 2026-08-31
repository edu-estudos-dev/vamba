import { appConfig } from '../config/app';

/** Espelha `AppErrorCode` do backend. */
export type ApiErrorCode =
  | 'LOCATION_REQUIRED'
  | 'INTENT_REQUIRED'
  | 'TRANSLATION_INPUT_REQUIRED'
  | 'OFFER_REQUIRED'
  | 'NO_CANDIDATES'
  | 'COST_LIMIT_REACHED'
  | 'PROVIDER_FAILED'
  | 'INVALID_REQUEST_BODY'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NETWORK_UNAVAILABLE';

/**
 * O turista não deve ver JSON de provider. Cada código vira uma frase que diz
 * o que aconteceu e o que ele pode fazer a seguir.
 */
const messageByCode: Record<ApiErrorCode, string> = {
  LOCATION_REQUIRED: 'Precisamos da sua localização para sugerir algo por perto.',
  INTENT_REQUIRED: 'Escolha uma categoria ou escreva o que você quer fazer.',
  TRANSLATION_INPUT_REQUIRED: 'Escreva um texto menor para traduzir.',
  OFFER_REQUIRED: 'Não foi possível registrar essa oferta.',
  NO_CANDIDATES: 'Não encontramos nada por perto agora. Tente outra categoria ou amplie a busca.',
  COST_LIMIT_REACHED: 'O limite de uso diário do Vamba foi atingido. Tente de novo amanhã.',
  PROVIDER_FAILED: 'Um serviço externo falhou. Tente de novo em instantes.',
  INVALID_REQUEST_BODY: 'Algo deu errado ao enviar seu pedido. Tente de novo.',
  NOT_FOUND: 'Não encontramos o que você pediu.',
  INTERNAL_ERROR: 'Algo deu errado no servidor do Vamba. Tente de novo em instantes.',
  NETWORK_UNAVAILABLE: 'Sem conexão com o servidor do Vamba. Verifique sua internet.',
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  /** Detalhe técnico do backend, útil em desenvolvimento e nunca exibido como mensagem principal. */
  readonly detail?: string;

  constructor(code: ApiErrorCode, detail?: string) {
    super(messageByCode[code]);
    this.name = 'ApiError';
    this.code = code;
    this.detail = detail;
  }
}

export const apiRequest = async <T>(
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      method: init?.method ?? 'GET',
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
      body: init?.body ? JSON.stringify(init.body) : undefined,
      // Sem teto de tempo, um backend travado prende o app com o spinner
      // preso indefinidamente. AbortError cai no mesmo catch de rede abaixo.
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new ApiError('NETWORK_UNAVAILABLE', error instanceof Error ? error.message : undefined);
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;

    const code = (payload?.error ?? 'PROVIDER_FAILED') as ApiErrorCode;
    throw new ApiError(code in messageByCode ? code : 'PROVIDER_FAILED', payload?.message);
  }

  return (await response.json()) as T;
};
