import { apiRequest } from '../../lib/apiClient';
import type { AffiliateOffer } from './types';

export const fetchOffers = async (input: { placeId: string; category: string }): Promise<AffiliateOffer[]> => {
  const query = new URLSearchParams({ placeId: input.placeId, category: input.category });
  const payload = await apiRequest<{ offers: AffiliateOffer[] }>(`/affiliates?${query.toString()}`);

  return payload.offers;
};

export const recordOfferClick = (input: { offerId: string; placeId: string }): Promise<unknown> =>
  apiRequest('/affiliates/clicks', { method: 'POST', body: input });
