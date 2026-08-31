import { Router } from 'express';

import { createRecommendation } from '../controllers/recommendations.controller.js';

export const recommendationsRouter = Router();

recommendationsRouter.post('/', createRecommendation);
