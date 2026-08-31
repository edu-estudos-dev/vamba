import type { AffiliateOffer, AffiliateProvider } from './AffiliateProvider.js';

/**
 * Ofertas de exemplo para exercitar o fluxo de afiliado sem parceria fechada.
 *
 * Todas saem com `isMock: true` e `trackedUrl` apontando para `example.com`, para nao
 * mandar turista para um link real que ninguem contratou. Trocar por um provider de
 * parceiro (ex.: Viator, GetYourGuide) quando a Milestone 4 confirmar conversao.
 */
const offersByCategory: Record<string, AffiliateOffer[]> = {
  restaurant: [
    {
      id: 'mock-offer-food-tour',
      partner: 'Parceiro exemplo',
      title: 'Tour gastronomico a pe',
      description: 'Tres horas provando pratos locais com guia.',
      priceFrom: 'EUR 45',
      trackedUrl: 'https://example.com/ofertas/food-tour?ref=vamba-mock',
      isMock: true,
    },
  ],
  landmark: [
    {
      id: 'mock-offer-skip-line',
      partner: 'Parceiro exemplo',
      title: 'Entrada sem fila',
      description: 'Ingresso com horario marcado para os pontos mais cheios.',
      priceFrom: 'EUR 18',
      trackedUrl: 'https://example.com/ofertas/skip-line?ref=vamba-mock',
      isMock: true,
    },
  ],
  viewpoint: [
    {
      id: 'mock-offer-sunset-cruise',
      partner: 'Parceiro exemplo',
      title: 'Passeio de barco ao por do sol',
      description: 'Saida no fim da tarde, duracao de duas horas.',
      priceFrom: 'EUR 30',
      trackedUrl: 'https://example.com/ofertas/sunset-cruise?ref=vamba-mock',
      isMock: true,
    },
  ],
};

const fallbackOffer: AffiliateOffer = {
  id: 'mock-offer-city-pass',
  partner: 'Parceiro exemplo',
  title: 'Passe da cidade',
  description: 'Transporte e atracoes principais em um unico bilhete.',
  priceFrom: 'EUR 25',
  trackedUrl: 'https://example.com/ofertas/city-pass?ref=vamba-mock',
  isMock: true,
};

export class FakeAffiliateProvider implements AffiliateProvider {
  readonly providerName = 'fake-affiliates';

  private clicks: Array<{ offerId: string; placeId?: string; at: string }> = [];

  async getOffers(input: { placeId?: string; category?: string; city?: string }): Promise<AffiliateOffer[]> {
    const matched = input.category ? offersByCategory[input.category] : undefined;
    return matched ?? [fallbackOffer];
  }

  async recordClick(input: { offerId: string; placeId?: string }): Promise<void> {
    // ponytail: cliques ficam em memoria e somem no restart. Persistir na Milestone 3,
    // quando o numero de cliques passar a sustentar decisao de negocio.
    this.clicks.push({ ...input, at: new Date().toISOString() });
  }

  getClicks(): ReadonlyArray<{ offerId: string; placeId?: string; at: string }> {
    return this.clicks;
  }
}
