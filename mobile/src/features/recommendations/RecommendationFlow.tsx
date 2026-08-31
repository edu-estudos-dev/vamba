import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchOffers, recordOfferClick } from '../affiliates/affiliatesApi';
import type { AffiliateOffer } from '../affiliates/types';
import { ApiError } from '../../lib/apiClient';
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
  onToggleFavorite?: (item: RecommendationItem) => string;
  isFavorited?: (placeId: string) => boolean;
  onTrack?: (name: string, data?: Record<string, string | number>) => void;
};

export const RecommendationFlow = ({ onToggleFavorite, isFavorited, onTrack }: RecommendationFlowProps) => {
  const [category, setCategory] = useState<TravelCategory>('Conhecer');
  const [prompt, setPrompt] = useState('Tenho duas horas livres. O que vale a pena fazer agora?');
  const [statusMessage, setStatusMessage] = useState('Use sua localização ou teste com Lisboa.');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);
  const [offers, setOffers] = useState<AffiliateOffer[]>([]);

  // Ofertas dependem do lugar aberto, entao so busca quando a selecao muda.
  useEffect(() => {
    if (!selectedItem) {
      setOffers([]);
      return;
    }

    let active = true;

    fetchOffers({ placeId: selectedItem.place.id, category: selectedItem.place.category })
      .then((nextOffers) => {
        if (active) setOffers(nextOffers);
      })
      .catch(() => {
        // Oferta e complemento: se falhar, a recomendacao continua util.
        if (active) setOffers([]);
      });

    return () => {
      active = false;
    };
  }, [selectedItem]);

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

    onTrack?.('recommendation_requested', { category, prompt: prompt.substring(0, 50) });

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
      setRecommendation(null);
      setSelectedItem(null);
      setStatusMessage(
        error instanceof ApiError ? error.message : 'Algo deu errado. Tente de novo em instantes.',
      );
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
              onPress={() => {
                setSelectedItem(item);
                onTrack?.('place_viewed', { placeId: item.place.id, placeName: item.place.name });
              }}
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
            <Pressable
              onPress={() => {
                openRoute(selectedItem);
                onTrack?.('map_opened', { placeId: selectedItem.place.id });
              }}
              style={styles.routeButton}
            >
              <Text style={styles.routeButtonText}>Ir agora</Text>
            </Pressable>
            {onToggleFavorite && (
              <Pressable
                onPress={() => {
                  const result = onToggleFavorite(selectedItem);
                  onTrack?.(result === 'saved' ? 'favorite_saved' : 'favorite_removed', {
                    placeId: selectedItem.place.id,
                  });
                }}
                style={[styles.favoriteButton, isFavorited?.(selectedItem.place.id) && styles.favoriteButtonActive]}
              >
                <Text style={styles.favoriteButtonText}>{isFavorited?.(selectedItem.place.id) ? '❤️' : '🤍'}</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : null}

      {selectedItem && offers.length > 0 ? (
        <View style={styles.offers}>
          <Text style={styles.sectionTitle}>Enquanto você está aqui</Text>
          {offers.map((offer) => (
            <Pressable
              key={offer.id}
              onPress={() => {
                onTrack?.('offer_clicked', { offerId: offer.id, placeId: selectedItem.place.id });
                // Registro do clique e best-effort: falhar aqui nao pode impedir
                // o usuario de abrir a oferta, nem virar unhandled rejection.
                recordOfferClick({ offerId: offer.id, placeId: selectedItem.place.id }).catch(
                  () => undefined,
                );
                void Linking.openURL(offer.trackedUrl);
              }}
              style={styles.offer}
            >
              <Text style={styles.offerTitle}>{offer.title}</Text>
              {offer.description ? <Text style={styles.offerDescription}>{offer.description}</Text> : null}
              <Text style={styles.offerMeta}>
                {offer.partner}
                {offer.priceFrom ? ` • a partir de ${offer.priceFrom}` : ''}
              </Text>
              {offer.isMock ? (
                <Text style={styles.offerMock}>Oferta de exemplo: ainda não há parceria real por trás.</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {recommendation ? (
        <Text style={styles.costNote}>
          Providers usados: {recommendation.usageEvents.map((event) => event.provider).join(', ')}. Custo
          estimado hoje: USD {recommendation.cost.spentUsd.toFixed(4)} de {recommendation.cost.limitUsd.toFixed(2)}.
        </Text>
      ) : null}
    </ScrollView>
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
  },
  contentContainer: {
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
  offers: {
    gap: 10,
  },
  offer: {
    backgroundColor: '#fffaf0',
    borderColor: '#e6d3a3',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  offerTitle: {
    color: '#143c33',
    fontSize: 16,
    fontWeight: '800',
  },
  offerDescription: {
    color: '#35534c',
    lineHeight: 20,
  },
  offerMeta: {
    color: '#60766f',
    fontSize: 13,
  },
  offerMock: {
    color: '#8a6d1f',
    fontSize: 12,
  },
  costNote: {
    color: '#60766f',
    fontSize: 13,
  },
});
