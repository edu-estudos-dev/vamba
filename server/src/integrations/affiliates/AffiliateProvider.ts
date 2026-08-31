export type AffiliateOffer = {
  id: string;
  partner: string;
  title: string;
  description?: string;
  priceFrom?: string;
  trackedUrl: string;
  /** `true` quando a oferta e exemplo local, sem parceria real por tras. */
  isMock: boolean;
};

export interface AffiliateProvider {
  readonly providerName?: string;
  getOffers(input: { placeId?: string; category?: string; city?: string }): Promise<AffiliateOffer[]>;
  recordClick(input: { offerId: string; placeId?: string }): Promise<void>;
}
