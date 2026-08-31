/**
 * Custo estimado em USD por operacao externa. Serve para orcamento e alerta,
 * nao para cobranca: a fatura real e a do fornecedor.
 *
 * Referencias usadas ao definir os valores (revisar quando o fornecedor mudar tabela):
 * - Google Places Nearby Search (New), SKU Enterprise.
 * - OpenAI, precos por 1M tokens do modelo configurado.
 * - Google Cloud Translation v2, preco por 1M caracteres.
 */

/**
 * Preco por chamada de rankPlaces, ja embutindo o tamanho tipico de um pedido
 * (~600 tokens de entrada: prompt + ate 8 candidatos; ~350 de saida: ranking
 * em JSON estruturado). Fonte: https://platform.openai.com/docs/pricing (ago/2026).
 * Modelo sem entrada aqui nao tem preco conhecido: `hasKnownOpenAiPricing`
 * bloqueia o boot do servidor nesse caso, em vez de deixar o custo virar zero
 * silenciosamente.
 */
const openAiRankPlacesCostByModel: Record<string, number> = {
  'gpt-4o-mini': 0.0003,
  'gpt-4o': 0.005,
  'gpt-4.1': 0.004,
  'gpt-4.1-mini': 0.0008,
  'gpt-5': 0.00425,
  'gpt-5-mini': 0.00085,
};

export const hasKnownOpenAiPricing = (model: string): boolean => model in openAiRankPlacesCostByModel;

const openAiPricingByProviderName = Object.fromEntries(
  Object.entries(openAiRankPlacesCostByModel).map(([model, rankPlaces]) => [
    `openai:${model}`,
    { rankPlaces },
  ]),
);

export const pricing = {
  'google-places': {
    // Por request de Nearby Search (New). O FieldMask atual (rating,
    // userRatingCount, priceLevel, currentOpeningHours) e do SKU Enterprise,
    // nao Pro — reavaliar se o FieldMask mudar.
    search: 0.035,
  },
  ...openAiPricingByProviderName,
  'google-translate': {
    // Por caractere enviado (USD 20 por 1M caracteres). Ignora os 500k
    // caracteres gratuitos por mes — superestima, na direcao segura.
    translate: 0.00002,
  },
} satisfies Record<string, Record<string, number>>;

type PricedProvider = keyof typeof pricing;

/**
 * Providers fake nao custam nada. Qualquer provider desconhecido tambem devolve 0,
 * porque um numero inventado seria pior que a ausencia de estimativa.
 */
export const estimateCost = (provider: string, operation: string, units = 1): number => {
  const providerPricing = pricing[provider as PricedProvider] as Record<string, number> | undefined;
  const unitCost = providerPricing?.[operation];

  return unitCost === undefined ? 0 : Number((unitCost * units).toFixed(6));
};
