import type { Request, Response } from 'express';

import { getAffiliateProvider } from '../config/providers.js';
import { AppError, toErrorResponse } from '../errors.js';

export const listOffers = async (request: Request, response: Response) => {
  try {
    const offers = await getAffiliateProvider().getOffers({
      placeId: asString(request.query.placeId),
      category: asString(request.query.category),
      city: asString(request.query.city),
    });

    response.status(200).json({ offers });
  } catch (error) {
    const { status, body } = toErrorResponse(error);
    response.status(status).json(body);
  }
};

export const recordOfferClick = async (request: Request, response: Response) => {
  const body = request.body as { offerId?: unknown; placeId?: unknown };

  try {
    if (typeof body.offerId !== 'string' || !body.offerId) {
      throw new AppError('OFFER_REQUIRED', 'offerId e obrigatorio para registrar o clique.');
    }

    await getAffiliateProvider().recordClick({
      offerId: body.offerId,
      placeId: typeof body.placeId === 'string' ? body.placeId : undefined,
    });

    response.status(202).json({ recorded: true });
  } catch (error) {
    const { status, body: errorBody } = toErrorResponse(error);
    response.status(status).json(errorBody);
  }
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;
