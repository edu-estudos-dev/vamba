export type AffiliateOffer = {
  id: string;
  partner: string;
  title: string;
  trackedUrl: string;
};

export interface AffiliateProvider {
  getOffers(input: { placeId?: string; city?: string }): Promise<AffiliateOffer[]>;
  recordClick(input: { offerId: string; userId?: string }): Promise<void>;
}
