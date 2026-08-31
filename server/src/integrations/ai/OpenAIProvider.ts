import type { AIProvider, RankedPlace } from './AIProvider.js';

type OpenAIResponse = {
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

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
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: 'system',
            content:
              'Você ranqueia somente lugares candidatos fornecidos em JSON. Nunca invente placeId. Responda apenas no schema solicitado.',
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
        text: {
          format: {
            type: 'json_schema',
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

    const payload = (await response.json()) as OpenAIResponse;
    const text = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;

    if (!text) {
      throw new Error('OpenAI response did not include structured text output');
    }

    const parsed = JSON.parse(text) as { rankings?: RankedPlace[] };
    const rankings = parsed.rankings ?? [];
    const unknown = rankings.find((ranking) => !candidateIds.has(ranking.placeId));

    if (unknown) {
      throw new Error(`OpenAI returned an unknown place id: ${unknown.placeId}`);
    }

    return rankings;
  }
}
