export type AffiliateOffer = {
  id: string;
  partner: string;
  title: string;
  description?: string;
  priceFrom?: string;
  trackedUrl: string;
  isMock: boolean;
};
