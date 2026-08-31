import type { AIProvider } from '../integrations/ai/AIProvider.js';
import type { PlaceCandidate, PlacesProvider } from '../integrations/places/PlacesProvider.js';
import type {
  RecommendationItem,
  RecommendationRequest,
  RecommendationResponse,
} from '../types/recommendation.js';
import type { ApiUsageLogger } from './ApiUsageLogger.js';

type RecommendationServiceDependencies = {
  placesProvider: PlacesProvider;
  aiProvider: AIProvider;
  usageLogger: ApiUsageLogger;
};

export class RecommendationService {
  private placesProvider: PlacesProvider;
  private aiProvider: AIProvider;
  private usageLogger: ApiUsageLogger;

  constructor(dependencies: RecommendationServiceDependencies) {
    this.placesProvider = dependencies.placesProvider;
    this.aiProvider = dependencies.aiProvider;
    this.usageLogger = dependencies.usageLogger;
  }

  async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
    this.usageLogger.clear();

    const candidates = await this.placesProvider.search({
      latitude: request.location.latitude,
      longitude: request.location.longitude,
      query: request.intent.prompt,
      category: request.intent.category,
      locale: request.locale ?? 'pt-BR',
      radiusMeters: 2_000,
    });

    this.usageLogger.record({
      provider: this.placesProvider.providerName ?? 'places',
      operation: 'search',
      inputUnits: 1,
      outputUnits: candidates.length,
      estimatedCost: 0,
    });

    if (candidates.length === 0) {
      throw new Error('PlacesProvider returned no candidates');
    }

    const rankings = await this.aiProvider.rankPlaces({
      prompt: this.buildPrompt(request),
      candidates,
    });

    this.usageLogger.record({
      provider: this.aiProvider.providerName ?? 'ai',
      operation: 'rankPlaces',
      inputUnits: candidates.length,
      outputUnits: rankings.length,
      estimatedCost: 0,
    });

    const recommendations = this.mergeRankings(candidates, rankings);
    const primaryRecommendation = recommendations[0];

    if (!primaryRecommendation) {
      throw new Error('AIProvider returned no usable recommendations');
    }

    return {
      recommendationId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      primaryRecommendation,
      recommendations,
      usageEvents: this.usageLogger.getEvents(),
    };
  }

  private buildPrompt(request: RecommendationRequest): string {
    const parts = [
      request.intent.category ? `Categoria: ${request.intent.category}` : undefined,
      request.intent.prompt ? `Pedido: ${request.intent.prompt}` : undefined,
      request.timeAvailableMinutes ? `Tempo disponível: ${request.timeAvailableMinutes} minutos` : undefined,
      request.budget ? `Orçamento: ${request.budget}` : undefined,
      request.travelMode ? `Deslocamento: ${request.travelMode}` : undefined,
    ];

    return parts.filter(Boolean).join('\n');
  }

  private mergeRankings(
    candidates: PlaceCandidate[],
    rankings: Awaited<ReturnType<AIProvider['rankPlaces']>>,
  ): RecommendationItem[] {
    const candidatesById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
    const seenPlaceIds = new Set<string>();

    return rankings
      .sort((left, right) => left.rank - right.rank)
      .map((ranking) => {
        const place = candidatesById.get(ranking.placeId);

        if (!place) {
          throw new Error(`AIProvider returned an unknown place id: ${ranking.placeId}`);
        }

        if (seenPlaceIds.has(ranking.placeId)) {
          throw new Error(`AIProvider returned a duplicate place id: ${ranking.placeId}`);
        }

        seenPlaceIds.add(ranking.placeId);

        return {
          place,
          rank: ranking.rank,
          explanation: ranking.explanation,
        };
      });
  }
}
