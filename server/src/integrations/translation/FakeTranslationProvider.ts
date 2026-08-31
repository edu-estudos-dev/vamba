import type { TranslationProvider } from './TranslationProvider.js';

/**
 * Traducao mockada para desenvolvimento sem credenciais.
 *
 * Nao tenta adivinhar traducao: devolve o texto original com um marcador explicito,
 * porque inventar traducao quebraria a regra de nao apresentar informacao falsa ao turista.
 * Um punhado de expressoes uteis de viagem tem traducao real, so para o fluxo ficar
 * demonstravel de ponta a ponta.
 */
const phrasebook: Record<string, Record<string, string>> = {
  en: {
    'bom dia': 'good morning',
    'boa noite': 'good evening',
    'obrigado': 'thank you',
    'quanto custa?': 'how much is it?',
    'onde fica o banheiro?': 'where is the bathroom?',
    'a conta, por favor': 'the check, please',
  },
  es: {
    'bom dia': 'buenos días',
    'boa noite': 'buenas noches',
    'obrigado': 'gracias',
    'quanto custa?': '¿cuánto cuesta?',
    'onde fica o banheiro?': '¿dónde está el baño?',
    'a conta, por favor': 'la cuenta, por favor',
  },
};

export class FakeTranslationProvider implements TranslationProvider {
  readonly providerName = 'fake-translation';

  async translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{ translatedText: string; isMock: boolean }> {
    const known = phrasebook[input.targetLanguage]?.[input.text.trim().toLowerCase()];

    return {
      translatedText: known ?? `${input.text} [mock: sem traducao real para ${input.targetLanguage}]`,
      isMock: true,
    };
  }
}
