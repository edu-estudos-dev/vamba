import type { Request, Response } from 'express';

import { createRecommendationService } from '../config/providers.js';
import { AppError, toErrorResponse } from '../errors.js';
import type { RecommendationRequest } from '../types/recommendation.js';

export const createRecommendation = async (request: Request, response: Response) => {
  const body = request.body as Partial<RecommendationRequest>;

  try {
    if (!body.location || !isNumber(body.location.latitude) || !isNumber(body.location.longitude)) {
      throw new AppError('LOCATION_REQUIRED', 'Latitude e longitude sao obrigatorias.');
    }

    if (!body.intent || (!body.intent.category && !body.intent.prompt)) {
      throw new AppError('INTENT_REQUIRED', 'Categoria ou pedido em texto e obrigatorio.');
    }

    if ((process.env.NODE_ENV ?? 'development') === 'development') {
      console.info('recommendations.location', {
        latitude: body.location.latitude,
        longitude: body.location.longitude,
      });
    }

    const recommendation = await createRecommendationService().recommend({
      location: body.location,
      intent: body.intent,
      travelMode: body.travelMode ?? 'walking',
      timeAvailableMinutes: body.timeAvailableMinutes,
      budget: body.budget,
      locale: body.locale ?? 'pt-BR',
    });

    response.status(200).json(recommendation);
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    response.status(status).json(errorBody);
  }
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
