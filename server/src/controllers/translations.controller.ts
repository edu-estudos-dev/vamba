import type { Request, Response } from 'express';

import { createTranslationService } from '../config/providers.js';
import { AppError, toErrorResponse } from '../errors.js';

type TranslationBody = {
  text?: unknown;
  sourceLanguage?: unknown;
  targetLanguage?: unknown;
};

export const createTranslation = async (request: Request, response: Response) => {
  const body = request.body as TranslationBody;

  try {
    if (typeof body.text !== 'string') {
      throw new AppError('TRANSLATION_INPUT_REQUIRED', 'Texto e obrigatorio para traduzir.');
    }

    if (typeof body.targetLanguage !== 'string' || !body.targetLanguage) {
      throw new AppError('TRANSLATION_INPUT_REQUIRED', 'Idioma de destino e obrigatorio.');
    }

    const translation = await createTranslationService().translate({
      text: body.text,
      sourceLanguage: typeof body.sourceLanguage === 'string' ? body.sourceLanguage : undefined,
      targetLanguage: body.targetLanguage,
    });

    response.status(200).json(translation);
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    response.status(status).json(errorBody);
  }
};
