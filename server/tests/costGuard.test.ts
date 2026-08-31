import { describe, expect, it } from 'vitest';

import { estimateCost } from '../src/config/pricing.js';
import { AppError } from '../src/errors.js';
import { CostGuard } from '../src/services/CostGuard.js';

describe('CostGuard', () => {
  it('deixa passar enquanto ha orcamento', () => {
    const guard = new CostGuard(1);
    guard.record(0.5);

    expect(() => guard.assertWithinBudget()).not.toThrow();
    expect(guard.snapshot().remainingUsd).toBeCloseTo(0.5);
  });

  it('bloqueia quando o teto diario e atingido', () => {
    const guard = new CostGuard(0.05);
    guard.record(0.05);

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
    guard.record(estimateCost('fake-places', 'search'));

    expect(guard.snapshot().spentUsd).toBe(0);
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
});
