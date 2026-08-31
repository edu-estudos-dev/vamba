import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';

import { env } from './config/env.js';
import { affiliatesRouter } from './routes/affiliates.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { recommendationsRouter } from './routes/recommendations.routes.js';
import { translationsRouter } from './routes/translations.routes.js';

export const createApp = () => {
  const app = express();

  // Sem restricao de origem, qualquer site poderia chamar /translations do navegador
  // de um visitante e queimar a cota diaria de custo.
  app.use(cors({ origin: env.corsOrigins }));
  // Traducao cobra por caractere: um body grande so faz sentido como engano ou abuso.
  app.use(express.json({ limit: '64kb' }));

  app.use('/health', healthRouter);
  app.use('/recommendations', recommendationsRouter);
  app.use('/translations', translationsRouter);
  app.use('/affiliates', affiliatesRouter);

  app.use((_request: Request, response: Response) => {
    response.status(404).json({ error: 'NOT_FOUND', message: 'Rota nao encontrada.' });
  });

  // Middleware de erro do Express (4 argumentos, precisa ser o ultimo `app.use`).
  // Sem isso, um erro antes de chegar ao controller — JSON malformado no body e
  // o caso mais comum, gerado pelo proprio `express.json()` — cai no handler
  // padrao do Express: pagina HTML com stack trace e caminho do sistema de
  // arquivos, fora do contrato JSON da API e vazando detalhe interno ao cliente.
  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    const isBodyParseError =
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      (error as { type?: unknown }).type === 'entity.parse.failed';

    if (isBodyParseError) {
      response.status(400).json({
        error: 'INVALID_REQUEST_BODY',
        message: 'Corpo da requisicao nao e um JSON valido.',
      });
      return;
    }

    console.error('unhandled.request_error', error);
    response.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Erro inesperado no servidor.',
    });
  });

  return app;
};
