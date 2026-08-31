import type { AIProvider, RankedPlace } from './AIProvider.js';

export class OpenAIProvider implements AIProvider {
  readonly providerName = 'openai';

  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async rankPlaces(input: Parameters<AIProvider['rankPlaces']>[0]): Promise<RankedPlace[]> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is required to use OpenAIProvider');
    }

    const candidateIds = new Set(input.candidates.map((candidate) => candidate.id));
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Você ranqueia somente lugares candidatos fornecidos em JSON. Nunca invente placeId. Responda apenas no schema solicitado. Escreva a explanation sempre em português do Brasil.',
          },
          {
            role: 'user',
            content: JSON.stringify({
              request: input.prompt,
              candidates: input.candidates.map((candidate) => ({
                id: candidate.id,
                name: candidate.name,
                category: candidate.category,
                distanceMeters: candidate.distanceMeters,
                rating: candidate.rating,
                reviewCount: candidate.reviewCount,
                isOpenNow: candidate.isOpenNow,
                priceLevel: candidate.priceLevel,
              })),
            }),
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'vamba_place_ranking',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['rankings'],
              properties: {
                rankings: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['placeId', 'rank', 'explanation'],
                    properties: {
                      placeId: { type: 'string' },
                      rank: { type: 'integer' },
                      explanation: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as any;
    const text = payload.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error('OpenAI response did not include structured text output');
    }

    const parsed = JSON.parse(text) as { rankings?: RankedPlace[] };
    const rankings = parsed.rankings ?? [];

    // O modelo as vezes inventa um id apesar da instrucao. Descartar so o item
    // preserva os validos — e a busca de lugares que ja foi paga. Se nao sobrar
    // nenhum, quem chama trata como "sem candidatos".
    const known = rankings.filter((ranking) => candidateIds.has(ranking.placeId));

    if (known.length < rankings.length) {
      console.warn('openai.invented_place_ids', {
        discarded: rankings.length - known.length,
        of: rankings.length,
      });
    }

    return known;
  }
}
