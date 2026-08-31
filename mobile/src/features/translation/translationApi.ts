import { apiRequest } from '../../lib/apiClient';

export type TranslationResult = {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  isMock: boolean;
  provider: string;
  estimatedCost: number;
};

export const translateText = (input: { text: string; targetLanguage: string }): Promise<TranslationResult> =>
  apiRequest<TranslationResult>('/translations', {
    method: 'POST',
    body: { text: input.text, sourceLanguage: 'pt', targetLanguage: input.targetLanguage },
  });
