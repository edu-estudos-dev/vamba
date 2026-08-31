import { Router } from 'express';

import { listOffers, recordOfferClick } from '../controllers/affiliates.controller.js';

export const affiliatesRouter = Router();

affiliatesRouter.get('/', listOffers);
affiliatesRouter.post('/clicks', recordOfferClick);
