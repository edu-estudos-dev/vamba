export type TranslationResult = {
  translatedText: string;
  /** `true` quando o texto veio de dados mockados e nao de um tradutor real. */
  isMock: boolean;
};

export interface TranslationProvider {
  readonly providerName?: string;
  translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<TranslationResult>;
}
