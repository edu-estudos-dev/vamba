import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { requestCurrentLocation } from '../location/locationService';
import type { TravelCategory } from '../../types/travel';
import { buildExternalMapUrl } from './mapLinks';
import { requestRecommendations } from './recommendationsApi';
import type { RecommendationItem, RecommendationResponse } from './types';

const categories: TravelCategory[] = ['Comer', 'Conhecer', 'Passear', 'Compras', 'Surpreenda-me'];

const demoLocation = {
  latitude: 38.7223,
  longitude: -9.1393,
};

type RecommendationFlowProps = {
  onSaveFavorite?: (item: RecommendationItem) => void;
  isFavorited?: (placeId: string) => boolean;
};

export const RecommendationFlow = ({ onSaveFavorite, isFavorited }: RecommendationFlowProps) => {
  const [category, setCategory] = useState<TravelCategory>('Conhecer');
  const [prompt, setPrompt] = useState('Tenho duas horas livres. O que vale a pena fazer agora?');
  const [statusMessage, setStatusMessage] = useState('Use sua localização ou teste com Lisboa.');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);

  const requestWithGps = async () => {
    setIsLoading(true);
    setStatusMessage('Solicitando localização...');

    const location = await requestCurrentLocation();

    if (location.status !== 'granted') {
      setIsLoading(false);
      setStatusMessage(location.message);
      return;
    }

    await requestWithCoordinates(location.latitude, location.longitude, 'Recomendação baseada no seu GPS.');
  };

  const requestWithDemoLocation = async () => {
    setIsLoading(true);
    await requestWithCoordinates(
      demoLocation.latitude,
      demoLocation.longitude,
      'Recomendação demo usando Lisboa e providers mockados.',
    );
  };

  const requestWithCoordinates = async (latitude: number, longitude: number, successMessage: string) => {
    if (!prompt.trim()) {
      setStatusMessage('Descreva o que você quer fazer.');
      setIsLoading(false);
      return;
    }

    try {
      const nextRecommendation = await requestRecommendations({
        latitude,
        longitude,
        category,
        prompt,
      });
      setRecommendation(nextRecommendation);
      setSelectedItem(nextRecommendation.primaryRecommendation);
      setStatusMessage(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setStatusMessage(`Erro: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openRoute = async (item: RecommendationItem) => {
    const url = buildExternalMapUrl({
      platform: Platform.OS,
      latitude: item.place.latitude,
      longitude: item.place.longitude,
      label: item.place.name,
    });

    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Vamba</Text>
        <Text style={styles.subtitle}>Decida o que vale a pena fazer agora.</Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>O que você quer fazer?</Text>
        <View style={styles.categoryRow}>
          {categories.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={[styles.categoryButton, item === category && styles.categoryButtonActive]}
            >
              <Text style={[styles.categoryText, item === category && styles.categoryTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          multiline
          onChangeText={setPrompt}
          style={styles.input}
          value={prompt}
          placeholder="Pergunte ao Vamba..."
          placeholderTextColor="#6f817b"
        />

        <View style={styles.actions}>
          <Pressable disabled={isLoading} onPress={requestWithGps} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Usar meu GPS</Text>
          </Pressable>
          <Pressable disabled={isLoading} onPress={requestWithDemoLocation} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Testar Lisboa</Text>
          </Pressable>
        </View>

        <View style={styles.statusRow}>
          {isLoading ? <ActivityIndicator color="#143c33" /> : null}
          <Text style={styles.status}>{statusMessage}</Text>
        </View>
      </View>

      {recommendation ? (
        <View style={styles.results}>
          <Text style={styles.sectionTitle}>Recomendação</Text>
          {recommendation.recommendations.map((item) => (
            <Pressable
              key={item.place.id}
              onPress={() => setSelectedItem(item)}
              style={[styles.resultItem, selectedItem?.place.id === item.place.id && styles.resultItemActive]}
            >
              <Text style={styles.resultName}>{item.rank}. {item.place.name}</Text>
              <Text style={styles.resultMeta}>
                {formatDistance(item.place.distanceMeters)} • {item.place.isOpenNow ? 'aberto agora' : 'status não confirmado'}
              </Text>
              <Text style={styles.explanation}>{item.explanation}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {selectedItem ? (
        <View style={styles.details}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <Text style={styles.detailName}>{selectedItem.place.name}</Text>
          <Text style={styles.description}>{selectedItem.place.description}</Text>
          <Text style={styles.detailLine}>{selectedItem.place.address}</Text>
          <Text style={styles.detailLine}>
            Avaliação {selectedItem.place.rating ?? '-'} • {selectedItem.place.reviewCount ?? 0} reviews
          </Text>
          <Text style={styles.detailLine}>Fonte: {selectedItem.place.source === 'mock' ? 'mock local' : 'provider externo'}</Text>
          <View style={styles.detailActions}>
            <Pressable onPress={() => openRoute(selectedItem)} style={styles.routeButton}>
              <Text style={styles.routeButtonText}>Ir agora</Text>
            </Pressable>
            {onSaveFavorite && (
              <Pressable
                onPress={() => onSaveFavorite(selectedItem)}
                style={[styles.favoriteButton, isFavorited?.(selectedItem.place.id) && styles.favoriteButtonActive]}
              >
                <Text style={styles.favoriteButtonText}>{isFavorited?.(selectedItem.place.id) ? '❤️' : '🤍'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}

      {recommendation ? (
        <Text style={styles.costNote}>
          Chamadas registradas: {recommendation.usageEvents.map((event) => event.provider).join(', ')}.
        </Text>
      ) : null}
    </View>
  );
};

const formatDistance = (distanceMeters?: number) => {
  if (!distanceMeters) {
    return 'distância não informada';
  }

  if (distanceMeters >= 1_000) {
    return `${(distanceMeters / 1_000).toFixed(1)} km`;
  }

  return `${distanceMeters} m`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    gap: 4,
  },
  brand: {
    color: '#143c33',
    fontSize: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#35534c',
    fontSize: 18,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  label: {
    color: '#143c33',
    fontSize: 18,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderColor: '#b7cec4',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryButtonActive: {
    backgroundColor: '#143c33',
    borderColor: '#143c33',
  },
  categoryText: {
    color: '#143c33',
    fontWeight: '700',
  },
  categoryTextActive: {
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
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#143c33',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  secondaryButton: {
    borderColor: '#143c33',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#143c33',
    fontWeight: '800',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  status: {
    color: '#60766f',
    flex: 1,
    lineHeight: 20,
  },
  results: {
    gap: 10,
  },
  sectionTitle: {
    color: '#143c33',
    fontSize: 21,
    fontWeight: '800',
  },
  resultItem: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  resultItemActive: {
    borderColor: '#143c33',
  },
  resultName: {
    color: '#143c33',
    fontSize: 17,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#60766f',
  },
  explanation: {
    color: '#35534c',
    lineHeight: 20,
  },
  details: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  detailName: {
    color: '#143c33',
    fontSize: 19,
    fontWeight: '800',
  },
  description: {
    color: '#35534c',
    lineHeight: 20,
  },
  detailLine: {
    color: '#60766f',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    alignItems: 'center',
  },
  routeButton: {
    flex: 1,
    backgroundColor: '#d8ad57',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  routeButtonText: {
    color: '#16362f',
    fontWeight: '900',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e8e5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fbf8',
  },
  favoriteButtonActive: {
    backgroundColor: '#ffe0e0',
    borderColor: '#ff6b6b',
  },
  favoriteButtonText: {
    fontSize: 20,
  },
  costNote: {
    color: '#60766f',
    fontSize: 13,
  },
});
