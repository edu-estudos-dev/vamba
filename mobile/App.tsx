import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { RecommendationFlow } from './src/features/recommendations/RecommendationFlow';
import { FavoritesScreen } from './src/features/favorites/FavoritesScreen';
import { AnalyticsScreen } from './src/features/analytics/AnalyticsScreen';
import { TranslationScreen } from './src/features/translation/TranslationScreen';
import { OnboardingScreen } from './src/features/onboarding/OnboardingScreen';
import { useOnboarding } from './src/features/onboarding/useOnboarding';
import { useFavorites } from './src/features/favorites/useFavorites';
import { useAnalytics } from './src/features/analytics/useAnalytics';

type Tab = 'recommendations' | 'favorites' | 'translation' | 'analytics';

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'recommendations', label: 'Descobrir' },
  { id: 'favorites', label: 'Favoritos' },
  { id: 'translation', label: 'Traduzir' },
  { id: 'analytics', label: '📊' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');
  const { favorites, remove, isFavorited, toggle } = useFavorites();
  const { events, track, clearEvents } = useAnalytics();
  const onboarding = useOnboarding();

  // Evita piscar o onboarding para quem ja passou por ele enquanto o storage carrega.
  if (!onboarding.isLoaded) {
    return <View style={styles.root} />;
  }

  if (!onboarding.isDone) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safeArea}>
          <OnboardingScreen
            onDone={() => {
              track('onboarding_completed');
              onboarding.complete();
            }}
          />
        </SafeAreaView>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.id === 'favorites' ? `${tab.label} (${favorites.length})` : tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'recommendations' ? (
          <RecommendationFlow onToggleFavorite={toggle} isFavorited={isFavorited} onTrack={track} />
        ) : activeTab === 'favorites' ? (
          <FavoritesScreen favorites={favorites} onRemove={remove} onTrack={track} />
        ) : activeTab === 'translation' ? (
          <TranslationScreen onTrack={track} />
        ) : (
          <AnalyticsScreen events={events} onClear={clearEvents} />
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6f817b',
  },
  tabTextActive: {
    color: '#143c33',
  },
});
