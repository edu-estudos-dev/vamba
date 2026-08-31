import { Router } from 'express';

import { createTranslation } from '../controllers/translations.controller.js';

export const translationsRouter = Router();

translationsRouter.post('/', createTranslation);
