import { describe, expect, it } from 'vitest';

import { estimateCost, hasKnownOpenAiPricing } from '../src/config/pricing.js';
import { AppError } from '../src/errors.js';
import { CostGuard } from '../src/services/CostGuard.js';

describe('CostGuard', () => {
  it('deixa passar enquanto ha orcamento', () => {
    const guard = new CostGuard(1);
    guard.reserve(0.5);

    expect(() => guard.assertWithinBudget()).not.toThrow();
    expect(guard.snapshot().remainingUsd).toBeCloseTo(0.5);
  });

  it('bloqueia quando o teto diario e atingido', () => {
    const guard = new CostGuard(0.05);
    guard.reserve(0.05);

    expect(() => guard.assertWithinBudget()).toThrow(AppError);

    try {
      guard.assertWithinBudget();
    } catch (error) {
      expect((error as AppError).code).toBe('COST_LIMIT_REACHED');
      expect((error as AppError).status).toBe(429);
    }
  });

  it('ignora custo zero dos providers fake', () => {
    const guard = new CostGuard(1);
    guard.reserve(estimateCost('fake-places', 'search'));

    expect(guard.snapshot().spentUsd).toBe(0);
  });

  // Sem isso, renomear um providerName real (ex.: typo em "google-places")
  // faz o custo cair no fallback de provider desconhecido e virar zero: o teto
  // nunca dispara e a suite continua verde.
  it('provider real conhecido soma custo diferente de zero', () => {
    const guard = new CostGuard(1);
    guard.reserve(estimateCost('google-places', 'search'));

    expect(guard.snapshot().spentUsd).toBeGreaterThan(0);
  });

  // Reproduz a corrida do CostGuard antigo: duas checagens (assert + record em
  // dois passos, com um await no meio) deixavam requests concorrentes lerem o
  // mesmo saldo e passarem juntas, furando o teto sem limite superior.
  it('segura o teto sob concorrencia', async () => {
    const guard = new CostGuard(3);
    const costPerCall = estimateCost('google-places', 'search');
    let accepted = 0;

    const oneRequest = async () => {
      try {
        guard.reserve(costPerCall);
        accepted += 1;
        await new Promise((resolve) => setTimeout(resolve, 5)); // latencia simulada do provider
      } catch {
        // 429, esperado quando o teto ja foi atingido
      }
    };

    await Promise.all(Array.from({ length: 200 }, oneRequest));

    // Reserva-e-soma no mesmo passo sincrono permite no maximo UMA reserva
    // acima do teto (a que estava em andamento quando o saldo virou zero),
    // nunca dezenas delas.
    expect(guard.snapshot().spentUsd).toBeLessThan(3 + costPerCall + 1e-6);
    expect(accepted * costPerCall).toBeLessThan(3 + costPerCall + 1e-6);
  });
});

describe('estimateCost', () => {
  it('cobra por request no Places e por caractere na traducao', () => {
    expect(estimateCost('google-places', 'search')).toBeGreaterThan(0);
    expect(estimateCost('google-translate', 'translate', 100)).toBeCloseTo(
      estimateCost('google-translate', 'translate') * 100,
      8,
    );
  });

  it('devolve zero para provider ou operacao sem preco conhecido', () => {
    expect(estimateCost('fake-ai', 'rankPlaces')).toBe(0);
    expect(estimateCost('google-places', 'operacao-inexistente')).toBe(0);
  });

  it('resolve preco de rankPlaces pelo modelo embutido no providerName da OpenAI', () => {
    expect(estimateCost('openai:gpt-4o-mini', 'rankPlaces')).toBeGreaterThan(0);
    expect(estimateCost('openai:gpt-4o', 'rankPlaces')).toBeGreaterThan(
      estimateCost('openai:gpt-4o-mini', 'rankPlaces'),
    );
  });
});

describe('hasKnownOpenAiPricing', () => {
  it('reconhece o modelo padrao do .env.example', () => {
    expect(hasKnownOpenAiPricing('gpt-4o-mini')).toBe(true);
  });

  it('rejeita modelo sem preco cadastrado', () => {
    expect(hasKnownOpenAiPricing('modelo-inexistente')).toBe(false);
  });
});
