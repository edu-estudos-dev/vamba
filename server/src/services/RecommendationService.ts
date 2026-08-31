import { estimateCost } from '../config/pricing.js';
import { AppError } from '../errors.js';
import type { AIProvider } from '../integrations/ai/AIProvider.js';
import type { PlaceCandidate, PlacesProvider } from '../integrations/places/PlacesProvider.js';
import type {
  RecommendationItem,
  RecommendationRequest,
  RecommendationResponse,
} from '../types/recommendation.js';
import type { ApiUsageLogger } from './ApiUsageLogger.js';
import type { CostGuard } from './CostGuard.js';

type RecommendationServiceDependencies = {
  placesProvider: PlacesProvider;
  aiProvider: AIProvider;
  usageLogger: ApiUsageLogger;
  costGuard: CostGuard;
};

export class RecommendationService {
  private placesProvider: PlacesProvider;
  private aiProvider: AIProvider;
  private usageLogger: ApiUsageLogger;
  private costGuard: CostGuard;

  constructor(dependencies: RecommendationServiceDependencies) {
    this.placesProvider = dependencies.placesProvider;
    this.aiProvider = dependencies.aiProvider;
    this.usageLogger = dependencies.usageLogger;
    this.costGuard = dependencies.costGuard;
  }

  async recommend(request: RecommendationRequest): Promise<RecommendationResponse> {
    this.usageLogger.clear();

    const placesProviderName = this.placesProvider.providerName ?? 'places';
    const placesCost = estimateCost(placesProviderName, 'search');
    // Reserva antes do await: se a busca falhar depois de o provider ja ter
    // cobrado, o gasto ainda entra na conta.
    this.costGuard.reserve(placesCost);

    const candidates = await this.placesProvider.search({
      latitude: request.location.latitude,
      longitude: request.location.longitude,
      query: request.intent.prompt,
      category: request.intent.category,
      locale: request.locale ?? 'pt-BR',
      radiusMeters: 2_000,
    });

    this.usageLogger.record({
      provider: placesProviderName,
      operation: 'search',
      inputUnits: 1,
      outputUnits: candidates.length,
      estimatedCost: placesCost,
    });

    if (candidates.length === 0) {
      throw new AppError(
        'NO_CANDIDATES',
        'Nenhum lugar encontrado por perto para esse pedido.',
      );
    }

    const aiProviderName = this.aiProvider.providerName ?? 'ai';
    const rankCost = estimateCost(aiProviderName, 'rankPlaces');
    // Mesma logica: reserva antes do await da IA, nao depois.
    this.costGuard.reserve(rankCost);

    const rankings = await this.aiProvider.rankPlaces({
      prompt: this.buildPrompt(request),
      candidates,
    });

    this.usageLogger.record({
      provider: aiProviderName,
      operation: 'rankPlaces',
      inputUnits: candidates.length,
      outputUnits: rankings.length,
      estimatedCost: rankCost,
    });

    const recommendations = this.mergeRankings(candidates, rankings);
    const primaryRecommendation = recommendations[0];

    if (!primaryRecommendation) {
      throw new AppError('NO_CANDIDATES', 'Nao foi possivel montar uma recomendacao com os lugares encontrados.');
    }

    return {
      recommendationId: crypto.randomUUID(),
      generatedAt: new Date().toISOString(),
      primaryRecommendation,
      recommendations,
      usageEvents: this.usageLogger.getEvents(),
      cost: this.costGuard.snapshot(),
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

    // O modelo as vezes inventa ou repete um id. Derrubar a resposta inteira por
    // causa de um item ruim joga fora os validos e o dinheiro ja gasto na busca:
    // descarta so o item e segue. Ficar sem nenhum vira `NO_CANDIDATES` em `recommend`.
    return rankings
      .sort((left, right) => left.rank - right.rank)
      .flatMap((ranking) => {
        const place = candidatesById.get(ranking.placeId);
        const hasExplanation = ranking.explanation?.trim().length >= 10;

        if (!place || seenPlaceIds.has(ranking.placeId) || !hasExplanation) {
          console.warn('ai.invalid_ranking', {
            provider: this.aiProvider.providerName,
            placeId: ranking.placeId,
            reason: !place ? 'unknown' : !hasExplanation ? 'empty_explanation' : 'duplicate',
          });

          return [];
        }

        seenPlaceIds.add(ranking.placeId);

        return [
          {
            place,
            rank: ranking.rank,
            explanation: ranking.explanation,
          },
        ];
      })
      // O rank vai para a tela como "1.", "2."... Renumerar evita o buraco que um
      // item descartado deixaria na contagem.
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }
}
