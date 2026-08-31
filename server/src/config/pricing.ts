/**
 * Custo estimado em USD por operacao externa. Serve para orcamento e alerta,
 * nao para cobranca: a fatura real e a do fornecedor.
 *
 * Referencias usadas ao definir os valores (revisar quando o fornecedor mudar tabela):
 * - Google Places Nearby Search (New), SKU Essentials/Pro conforme FieldMask.
 * - OpenAI, precos por 1M tokens do modelo configurado.
 * - Google Cloud Translation v2, preco por 1M caracteres.
 */
export const pricing = {
  'google-places': {
    // Por request de Nearby Search (New).
    search: 0.032,
  },
  openai: {
    // Aproximacao por request; entrada e saida de um ranking sao pequenas.
    rankPlaces: 0.0004,
  },
  'google-translate': {
    // Por caractere enviado (USD 20 por 1M caracteres).
    translate: 0.00002,
  },
} as const satisfies Record<string, Record<string, number>>;

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
