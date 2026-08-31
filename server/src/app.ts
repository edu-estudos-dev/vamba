import cors from 'cors';
import express from 'express';

import { healthRouter } from './routes/health.routes.js';
import { recommendationsRouter } from './routes/recommendations.routes.js';

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/health', healthRouter);
  app.use('/recommendations', recommendationsRouter);

  return app;
};
