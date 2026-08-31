import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { RecommendationFlow } from './src/features/recommendations/RecommendationFlow';
import { FavoritesScreen } from './src/features/favorites/FavoritesScreen';
import { useFavorites } from './src/features/favorites/useFavorites';

type Tab = 'recommendations' | 'favorites';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');
  const { favorites, isLoaded, save, remove, isFavorited } = useFavorites();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'recommendations' && styles.tabActive]}
            onPress={() => setActiveTab('recommendations')}
          >
            <Text style={[styles.tabText, activeTab === 'recommendations' && styles.tabTextActive]}>
              Descobrir
            </Text>
          </Pressable>
          <Pressable style={[styles.tab, activeTab === 'favorites' && styles.tabActive]} onPress={() => setActiveTab('favorites')}>
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.tabTextActive]}>
              Favoritos ({favorites.length})
            </Text>
          </Pressable>
        </View>

        {activeTab === 'recommendations' ? (
          <RecommendationFlow onSaveFavorite={save} isFavorited={isFavorited} />
        ) : (
          <FavoritesScreen favorites={favorites} onRemove={remove} />
        )}
      </SafeAreaView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7fbf8',
  },
  safeArea: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e8e5',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#143c33',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6f817b',
  },
  tabTextActive: {
    color: '#143c33',
  },
});
