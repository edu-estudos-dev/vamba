import type { Request, Response } from 'express';

import { createRecommendationService } from '../config/providers.js';
import { env } from '../config/env.js';
import { AppError, toErrorResponse } from '../errors.js';
import type { RecommendationRequest } from '../types/recommendation.js';

export const createRecommendation = async (request: Request, response: Response) => {
  const body = request.body as Partial<RecommendationRequest>;

  try {
    if (
      !body.location ||
      !isValidLatitude(body.location.latitude) ||
      !isValidLongitude(body.location.longitude)
    ) {
      throw new AppError('LOCATION_REQUIRED', 'Latitude e longitude sao obrigatorias.');
    }

    if (!body.intent || (!body.intent.category && !body.intent.prompt)) {
      throw new AppError('INTENT_REQUIRED', 'Categoria ou pedido em texto e obrigatorio.');
    }

    // O preco de rankPlaces em pricing.ts assume um numero fixo de tokens de
    // entrada. Sem este teto, um prompt gigante faz o custo real da OpenAI
    // estourar o que o CostGuard reservou para a chamada.
    if (body.intent.prompt && body.intent.prompt.length > env.recommendationPromptMaxChars) {
      throw new AppError(
        'INTENT_REQUIRED',
        `Pedido em texto acima do limite de ${env.recommendationPromptMaxChars} caracteres.`,
      );
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

// Fora da faixa valida e erro do chamador (400), nao falha de provider (502) —
// e evita mandar uma coordenada absurda para a API do Google de graca.
const isValidLatitude = (value: unknown): value is number => isNumber(value) && Math.abs(value) <= 90;
const isValidLongitude = (value: unknown): value is number => isNumber(value) && Math.abs(value) <= 180;
