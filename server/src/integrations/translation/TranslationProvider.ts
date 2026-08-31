export interface TranslationProvider {
  translate(input: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
  }): Promise<{
    translatedText: string;
  }>;
}
