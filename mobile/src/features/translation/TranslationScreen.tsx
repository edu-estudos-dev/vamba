import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ApiError } from '../../lib/apiClient';
import { translateText, type TranslationResult } from './translationApi';

const languages = [
  { code: 'en', label: 'Inglês' },
  { code: 'es', label: 'Espanhol' },
  { code: 'fr', label: 'Francês' },
];

const suggestions = ['Bom dia', 'Quanto custa?', 'A conta, por favor', 'Onde fica o banheiro?'];

type TranslationScreenProps = {
  onTrack?: (name: string, data?: Record<string, string | number>) => void;
};

export const TranslationScreen = ({ onTrack }: TranslationScreenProps) => {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const translate = async (input: string) => {
    if (!input.trim()) {
      setErrorMessage('Escreva algo para traduzir.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    onTrack?.('translation_requested', { targetLanguage, length: input.length });

    try {
      setResult(await translateText({ text: input, targetLanguage }));
    } catch (error) {
      setResult(null);
      setErrorMessage(
        error instanceof ApiError ? error.message : 'Não foi possível traduzir agora.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tradutor</Text>
      <Text style={styles.subtitle}>Frases curtas para se virar no lugar onde você está.</Text>

      <View style={styles.panel}>
        <View style={styles.languageRow}>
          {languages.map((language) => (
            <Pressable
              key={language.code}
              onPress={() => setTargetLanguage(language.code)}
              style={[styles.language, language.code === targetLanguage && styles.languageActive]}
            >
              <Text
                style={[
                  styles.languageText,
                  language.code === targetLanguage && styles.languageTextActive,
                ]}
              >
                {language.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          multiline
          onChangeText={setText}
          placeholder="Escreva em português..."
          placeholderTextColor="#6f817b"
          style={styles.input}
          value={text}
        />

        <Pressable disabled={isLoading} onPress={() => translate(text)} style={styles.button}>
          <Text style={styles.buttonText}>Traduzir</Text>
        </Pressable>

        {isLoading ? <ActivityIndicator color="#143c33" /> : null}
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Frases úteis</Text>
      <View style={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => {
              setText(suggestion);
              void translate(suggestion);
            }}
            style={styles.suggestion}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>

      {result ? (
        <View style={styles.result}>
          <Text style={styles.resultLabel}>Tradução</Text>
          <Text style={styles.resultText}>{result.translatedText}</Text>
          {result.isMock ? (
            <Text style={styles.mockWarning}>
              Tradutor em modo mock: só as frases do guia têm tradução real. Ative
              TRANSLATION_PROVIDER=google no backend para traduzir qualquer texto.
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    color: '#143c33',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#35534c',
    fontSize: 16,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 8,
  },
  language: {
    borderColor: '#b7cec4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  languageActive: {
    backgroundColor: '#143c33',
    borderColor: '#143c33',
  },
  languageText: {
    color: '#143c33',
    fontWeight: '700',
  },
  languageTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#eef6f1',
    borderColor: '#c8ddd4',
    borderRadius: 8,
    borderWidth: 1,
    color: '#173d35',
    fontSize: 16,
    minHeight: 76,
    padding: 12,
    textAlignVertical: 'top',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#143c33',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  error: {
    color: '#a3352f',
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#143c33',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestion: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  suggestionText: {
    color: '#35534c',
    fontWeight: '600',
  },
  result: {
    backgroundColor: '#ffffff',
    borderColor: '#143c33',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  resultLabel: {
    color: '#60766f',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  resultText: {
    color: '#143c33',
    fontSize: 20,
    fontWeight: '700',
  },
  mockWarning: {
    color: '#8a6d1f',
    fontSize: 13,
    lineHeight: 19,
  },
});
