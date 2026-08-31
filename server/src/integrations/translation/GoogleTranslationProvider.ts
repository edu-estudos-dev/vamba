import { AppError } from '../../errors.js';
import type { TranslationProvider, TranslationResult } from './TranslationProvider.js';

type GoogleTranslateResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
};

/**
 * Cloud Translation v2. Preparado, ativado por `TRANSLATION_PROVIDER=google`.
 * Cobra por caractere enviado; o custo e registrado pelo chamador.
 */
export class GoogleTranslationProvider implements TranslationProvider {
  readonly providerName = 'google-translate';

  constructor(private readonly apiKey: string) {}

  async translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<TranslationResult> {
    if (!this.apiKey) {
      throw new AppError(
        'PROVIDER_FAILED',
        'GOOGLE_TRANSLATE_API_KEY e obrigatoria para usar GoogleTranslationProvider.',
      );
    }

    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      signal: AbortSignal.timeout(8_000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: input.text,
        source: input.sourceLanguage,
        target: input.targetLanguage,
        format: 'text',
        key: this.apiKey,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');

      if (response.status === 403) {
        throw new AppError(
          'PROVIDER_FAILED',
          'Google Translate recusou a chave (403). Verifique conta de faturamento ativa e "Cloud Translation API" habilitada.',
        );
      }

      throw new AppError(
        'PROVIDER_FAILED',
        `Google Translate falhou com status ${response.status}: ${detail}`,
      );
    }

    const payload = (await response.json()) as GoogleTranslateResponse;
    const translatedText = payload.data?.translations?.[0]?.translatedText;

    if (!translatedText) {
      throw new AppError('PROVIDER_FAILED', 'Google Translate devolveu resposta sem traducao.');
    }

    return { translatedText, isMock: false };
  }
}
