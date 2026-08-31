import { estimateCost } from '../config/pricing.js';
import { AppError } from '../errors.js';
import type { TranslationProvider } from '../integrations/translation/TranslationProvider.js';
import type { CostGuard } from './CostGuard.js';

export type TranslationRequest = {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
};

export type TranslationResponse = {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  isMock: boolean;
  provider: string;
  estimatedCost: number;
};

type TranslationServiceDependencies = {
  translationProvider: TranslationProvider;
  costGuard: CostGuard;
  maxChars: number;
};

export class TranslationService {
  private readonly translationProvider: TranslationProvider;
  private readonly costGuard: CostGuard;
  private readonly maxChars: number;

  constructor(dependencies: TranslationServiceDependencies) {
    this.translationProvider = dependencies.translationProvider;
    this.costGuard = dependencies.costGuard;
    this.maxChars = dependencies.maxChars;
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    const text = request.text.trim();

    if (!text) {
      throw new AppError('TRANSLATION_INPUT_REQUIRED', 'Texto e obrigatorio para traduzir.');
    }

    if (!request.targetLanguage) {
      throw new AppError('TRANSLATION_INPUT_REQUIRED', 'Idioma de destino e obrigatorio.');
    }

    // Traducao cobra por caractere: cortar antes de enviar evita que um texto colado
    // por engano vire uma conta grande.
    if (text.length > this.maxChars) {
      throw new AppError(
        'TRANSLATION_INPUT_REQUIRED',
        `Texto acima do limite de ${this.maxChars} caracteres.`,
      );
    }

    const sourceLanguage = request.sourceLanguage ?? 'pt';
    const provider = this.translationProvider.providerName ?? 'translation';
    const cost = estimateCost(provider, 'translate', text.length);

    // Reserva antes do await pelo mesmo motivo do RecommendationService: sem
    // isso, duas traducoes concorrentes podem passar juntas pelo teto, e uma
    // traducao que o provider cobrou mas devolveu erro nao entraria na conta.
    this.costGuard.reserve(cost);

    const result = await this.translationProvider.translate({
      text,
      sourceLanguage,
      targetLanguage: request.targetLanguage,
    });

    return {
      translatedText: result.translatedText,
      sourceLanguage,
      targetLanguage: request.targetLanguage,
      isMock: result.isMock,
      provider,
      estimatedCost: cost,
    };
  }
}
