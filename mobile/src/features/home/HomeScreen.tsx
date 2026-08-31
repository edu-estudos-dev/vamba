import { StyleSheet, Text, View } from 'react-native';

import type { TravelCategory } from '../../types/travel';

const categories: TravelCategory[] = [
  'Comer',
  'Conhecer',
  'Passear',
  'Praia',
  'Compras',
  'Vida noturna',
  'Surpreenda-me',
];

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>Vamba</Text>
        <Text style={styles.subtitle}>
          Seu companheiro para decidir o que vale a pena fazer agora.
        </Text>
      </View>

      <View style={styles.askBox}>
        <Text style={styles.question}>O que você quer fazer agora?</Text>
        <Text style={styles.prompt}>Pergunte ao Vamba...</Text>
      </View>

      <View style={styles.grid}>
        {categories.map((category) => (
          <View key={category} style={styles.category}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>
        Milestone 0: base pronta para receber localização, lugares reais e recomendação contextual.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  brand: {
    color: '#143c33',
    fontSize: 42,
    fontWeight: '800',
  },
  subtitle: {
    color: '#35534c',
    fontSize: 18,
    lineHeight: 26,
  },
  askBox: {
    backgroundColor: '#ffffff',
    borderColor: '#d7e6df',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  question: {
    color: '#143c33',
    fontSize: 22,
    fontWeight: '700',
  },
  prompt: {
    backgroundColor: '#eef6f1',
    borderColor: '#c8ddd4',
    borderRadius: 8,
    borderWidth: 1,
    color: '#557169',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  category: {
    backgroundColor: '#143c33',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    color: '#60766f',
    fontSize: 14,
    lineHeight: 20,
  },
});
