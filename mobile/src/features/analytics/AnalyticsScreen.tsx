import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import type { AnalyticsEvent } from './useAnalytics';

type AnalyticsScreenProps = {
  events: AnalyticsEvent[];
  onClear: () => void;
};

export const AnalyticsScreen = ({ events, onClear }: AnalyticsScreenProps) => {
  const counts = events.reduce(
    (acc, event) => {
      acc[event.name] = (acc[event.name] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const labels: Record<string, string> = {
    recommendation_requested: '🔍 Recomendações solicitadas',
    place_viewed: '👁️ Lugares visualizados',
    favorite_saved: '❤️ Favoritos salvos',
    favorite_removed: '🗑️ Favoritos removidos',
    map_opened: '🗺️ Mapas abertos',
    onboarding_completed: '👋 Onboarding concluído',
    translation_requested: '🌐 Traduções pedidas',
    offer_clicked: '🎟️ Ofertas clicadas',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Analytics</Text>

      <View style={styles.statsGrid}>
        {Object.entries(counts).map(([name, count]) => (
          <View key={name} style={styles.stat}>
            <Text style={styles.statLabel}>{labels[name] || name}</Text>
            <Text style={styles.statValue}>{count}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Total de eventos: {events.length}</Text>
        {events.length > 0 && (
          <Text style={styles.summaryText}>
            Período: {new Date(events[0].timestamp).toLocaleDateString()} -{' '}
            {new Date(events[events.length - 1].timestamp).toLocaleDateString()}
          </Text>
        )}
      </View>

      {events.length > 0 && (
        <>
          <Text style={styles.eventsTitle}>Últimos eventos</Text>
          {events.slice(-10).reverse().map((event, index) => (
            <View key={index} style={styles.eventItem}>
              <Text style={styles.eventName}>{labels[event.name] || event.name}</Text>
              <Text style={styles.eventTime}>{new Date(event.timestamp).toLocaleTimeString()}</Text>
              {event.data && <Text style={styles.eventData}>{JSON.stringify(event.data)}</Text>}
            </View>
          ))}
        </>
      )}

      {events.length > 0 && (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpar dados</Text>
        </Pressable>
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#143c33',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e8e5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6f817b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#143c33',
  },
  summary: {
    backgroundColor: '#e8f5f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 13,
    color: '#143c33',
    marginBottom: 4,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#143c33',
    marginBottom: 12,
  },
  eventItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#d4a574',
  },
  eventName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#143c33',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#6f817b',
    marginBottom: 4,
  },
  eventData: {
    fontSize: 11,
    color: '#6f817b',
    fontFamily: 'monospace',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
