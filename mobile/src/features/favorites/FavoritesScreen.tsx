import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buildExternalMapUrl } from '../recommendations/mapLinks';
import type { Favorite } from './types';

type FavoritesScreenProps = {
  favorites: Favorite[];
  onRemove: (placeId: string) => void;
  onTrack?: (name: string, data?: Record<string, string | number>) => void;
};

export const FavoritesScreen = ({ favorites, onRemove, onTrack }: FavoritesScreenProps) => {
  const handleOpenMap = async (place: Favorite) => {
    const url = buildExternalMapUrl({
      // Antes fixo em 'android': no iOS nunca abria o Apple Maps nativo.
      platform: Platform.OS,
      latitude: place.latitude,
      longitude: place.longitude,
      label: place.name,
    });

    try {
      await Linking.openURL(url);
      onTrack?.('map_opened', { placeId: place.id, source: 'favorites' });
    } catch {
      // Sem app de mapa instalado ou esquema nao registrado: avisar em vez de
      // o toque em "Ir agora" nao fazer nada visivel.
      Alert.alert('Não foi possível abrir o mapa neste aparelho.');
    }
  };

  const handleRemove = (placeId: string) => {
    onRemove(placeId);
    onTrack?.('favorite_removed', { placeId });
  };

  if (favorites.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhum lugar salvo ainda.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meus Favoritos</Text>
      {favorites.map((place) => (
        <View key={place.id} style={styles.card}>
          <Text style={styles.name}>{place.name}</Text>
          <Text style={styles.meta}>
            {place.distanceMeters ? `${(place.distanceMeters / 1000).toFixed(1)}km • ` : ''}
            {place.isOpenNow ? 'aberto agora' : 'status desconhecido'}
          </Text>
          {place.rating && (
            <Text style={styles.rating}>⭐ {place.rating} ({place.reviewCount} reviews)</Text>
          )}
          <View style={styles.actions}>
            <Pressable style={styles.mapButton} onPress={() => void handleOpenMap(place)}>
              <Text style={styles.mapButtonText}>Ir agora</Text>
            </Pressable>
            <Pressable style={styles.removeButton} onPress={() => handleRemove(place.id)}>
              <Text style={styles.removeButtonText}>Remover</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbf8',
  },
  content: {
    padding: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fbf8',
  },
  emptyText: {
    fontSize: 16,
    color: '#6f817b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#143c33',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e8e5',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#143c33',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#6f817b',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    color: '#6f817b',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#d4a574',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#6f817b',
    fontWeight: '600',
    fontSize: 13,
  },
});
