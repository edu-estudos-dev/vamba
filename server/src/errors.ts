export type AppErrorCode =
  | 'LOCATION_REQUIRED'
  | 'INTENT_REQUIRED'
  | 'TRANSLATION_INPUT_REQUIRED'
  | 'OFFER_REQUIRED'
  | 'NO_CANDIDATES'
  | 'COST_LIMIT_REACHED'
  | 'PROVIDER_FAILED';

const statusByCode: Record<AppErrorCode, number> = {
  LOCATION_REQUIRED: 400,
  INTENT_REQUIRED: 400,
  TRANSLATION_INPUT_REQUIRED: 400,
  OFFER_REQUIRED: 400,
  NO_CANDIDATES: 404,
  COST_LIMIT_REACHED: 429,
  PROVIDER_FAILED: 502,
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

export const toErrorResponse = (error: unknown): { status: number; body: { error: AppErrorCode; message: string } } => {
  if (error instanceof AppError) {
    return { status: error.status, body: { error: error.code, message: error.message } };
  }

  return {
    status: statusByCode.PROVIDER_FAILED,
    body: {
      error: 'PROVIDER_FAILED',
      message: error instanceof Error ? error.message : 'Falha inesperada ao falar com um provider externo.',
    },
  };
};
