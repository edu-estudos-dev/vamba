import type { Request, Response } from 'express';

import { createRecommendationService } from '../config/providers.js';
import type { RecommendationRequest } from '../types/recommendation.js';

export const createRecommendation = async (request: Request, response: Response) => {
  const body = request.body as Partial<RecommendationRequest>;

  if (!body.location || !isNumber(body.location.latitude) || !isNumber(body.location.longitude)) {
    response.status(400).json({
      error: 'LOCATION_REQUIRED',
      message: 'Latitude and longitude are required to request recommendations.',
    });
    return;
  }

  if ((process.env.NODE_ENV ?? 'development') === 'development') {
    console.info('recommendations.location', {
      latitude: body.location.latitude,
      longitude: body.location.longitude,
    });
  }

  if (!body.intent || (!body.intent.category && !body.intent.prompt)) {
    response.status(400).json({
      error: 'INTENT_REQUIRED',
      message: 'Category or prompt is required to request recommendations.',
    });
    return;
  }

  try {
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
    response.status(502).json({
      error: 'RECOMMENDATION_FAILED',
      message: error instanceof Error ? error.message : 'Recommendation failed',
    });
  }
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
