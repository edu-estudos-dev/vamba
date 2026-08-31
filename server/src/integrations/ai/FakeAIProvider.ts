import type { AIProvider, RankedPlace } from './AIProvider.js';

export class FakeAIProvider implements AIProvider {
  readonly providerName = 'fake-ai';

  async rankPlaces(input: Parameters<AIProvider['rankPlaces']>[0]): Promise<RankedPlace[]> {
    return [...input.candidates]
      .sort((left, right) => {
        const leftScore = this.score(left.distanceMeters, left.rating, left.isOpenNow, left.category, input.prompt);
        const rightScore = this.score(right.distanceMeters, right.rating, right.isOpenNow, right.category, input.prompt);
        return rightScore - leftScore;
      })
      .map((candidate, index) => ({
        placeId: candidate.id,
        rank: index + 1,
        explanation:
          index === 0
            ? 'Recomendo ir agora porque está próximo, está aberto e combina com um passeio curto.'
            : 'Também é uma boa alternativa real retornada pelo provider de lugares.',
      }));
  }

  private score(
    distanceMeters = 2_000,
    rating = 0,
    isOpenNow = false,
    category = '',
    prompt = '',
  ): number {
    const distanceScore = Math.max(0, 2_000 - distanceMeters) / 100;
    const openBonus = isOpenNow ? 10 : 0;
    const categoryBonus =
      prompt.includes('Conhecer') && ['viewpoint', 'landmark', 'museum'].includes(category) ? 8 : 0;
    return distanceScore + rating + openBonus + categoryBonus;
  }
}
