export type AppErrorCode =
  | 'LOCATION_REQUIRED'
  | 'INTENT_REQUIRED'
  | 'TRANSLATION_INPUT_REQUIRED'
  | 'OFFER_REQUIRED'
  | 'NO_CANDIDATES'
  | 'COST_LIMIT_REACHED'
  | 'PROVIDER_FAILED'
  | 'INVALID_REQUEST_BODY'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

const statusByCode: Record<AppErrorCode, number> = {
  LOCATION_REQUIRED: 400,
  INTENT_REQUIRED: 400,
  TRANSLATION_INPUT_REQUIRED: 400,
  OFFER_REQUIRED: 400,
  NO_CANDIDATES: 404,
  COST_LIMIT_REACHED: 429,
  PROVIDER_FAILED: 502,
  INVALID_REQUEST_BODY: 400,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

/**
 * Erro com codigo estavel para o mobile traduzir em mensagem para o usuario.
 * A `message` e diagnostica e pode conter detalhe tecnico do provider.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = statusByCode[code];
  }
}

const PROVIDER_FAILED_MESSAGE = 'Falha inesperada ao falar com um provider externo.';

/**
 * Mensagem de erro de validacao e escrita por nos e pode ir para o cliente.
 * Mensagem de `PROVIDER_FAILED` nao: ela carrega o corpo cru da resposta do
 * provider (chave recusada, id inventado pelo modelo, stack de SDK). Esse
 * detalhe fica no log do servidor e a resposta HTTP leva so a frase generica.
 */
export const toErrorResponse = (error: unknown): { status: number; body: { error: AppErrorCode; message: string } } => {
  if (error instanceof AppError && error.code !== 'PROVIDER_FAILED') {
    return { status: error.status, body: { error: error.code, message: error.message } };
  }

  console.error('provider.failed', error);

  return {
    status: statusByCode.PROVIDER_FAILED,
    body: { error: 'PROVIDER_FAILED', message: PROVIDER_FAILED_MESSAGE },
  };
};
