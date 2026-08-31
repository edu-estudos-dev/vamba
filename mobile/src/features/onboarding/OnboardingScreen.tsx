import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const steps = [
  {
    title: 'Decida em segundos',
    body: 'Diga quanto tempo você tem e o Vamba escolhe o que vale a pena fazer agora, perto de você.',
  },
  {
    title: 'Lugares reais, sem invenção',
    body: 'As sugestões vêm de provedores de lugares reais. A IA só organiza o que existe — nunca cria endereço.',
  },
  {
    title: 'Salve e vá',
    body: 'Guarde favoritos, traduza o essencial e abra a rota no seu app de mapas preferido.',
  },
];

type OnboardingScreenProps = {
  onDone: () => void;
};

export const OnboardingScreen = ({ onDone }: OnboardingScreenProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>Vamba</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((item, index) => (
            <View key={item.title} style={[styles.dot, index === stepIndex && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onDone} style={styles.skipButton}>
            <Text style={styles.skipText}>Pular</Text>
          </Pressable>
          <Pressable
            onPress={() => (isLastStep ? onDone() : setStepIndex(stepIndex + 1))}
            style={styles.nextButton}
          >
            <Text style={styles.nextText}>{isLastStep ? 'Começar' : 'Próximo'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  brand: {
    color: '#143c33',
    fontSize: 34,
    fontWeight: '800',
  },
  title: {
    color: '#143c33',
    fontSize: 26,
    fontWeight: '800',
  },
  body: {
    color: '#35534c',
    fontSize: 17,
    lineHeight: 25,
  },
  footer: {
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    backgroundColor: '#c8ddd4',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: '#143c33',
    width: 22,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  skipText: {
    color: '#60766f',
    fontWeight: '700',
  },
  nextButton: {
    backgroundColor: '#143c33',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
