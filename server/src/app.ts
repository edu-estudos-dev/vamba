import cors from 'cors';
import express from 'express';

import { affiliatesRouter } from './routes/affiliates.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { recommendationsRouter } from './routes/recommendations.routes.js';
import { translationsRouter } from './routes/translations.routes.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  // Traducao cobra por caractere: um body grande so faz sentido como engano ou abuso.
  app.use(express.json({ limit: '64kb' }));

  app.use('/health', healthRouter);
  app.use('/recommendations', recommendationsRouter);
  app.use('/translations', translationsRouter);
  app.use('/affiliates', affiliatesRouter);

  return app;
};
