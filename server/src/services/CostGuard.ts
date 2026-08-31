import { AppError } from '../errors.js';

export type CostSnapshot = {
  day: string;
  spentUsd: number;
  limitUsd: number;
  remainingUsd: number;
};

const currentDay = (): string => new Date().toISOString().slice(0, 10);

/**
 * Teto diario de gasto com providers externos.
 *
 * ponytail: contador em memoria, por processo. Zera no restart e nao soma entre
 * instancias. Suficiente enquanto o backend roda como um processo unico; mover
 * para a tabela `api_usage` no PostgreSQL quando houver mais de uma instancia.
 */
export class CostGuard {
  private day = currentDay();
  private spentUsd = 0;

  constructor(private readonly limitUsd: number) {}

  /** Chamar antes de disparar chamadas pagas. */
  assertWithinBudget(): void {
    const snapshot = this.snapshot();

    if (snapshot.remainingUsd <= 0) {
      throw new AppError(
        'COST_LIMIT_REACHED',
        `Limite diario de custo com APIs externas atingido (USD ${snapshot.limitUsd.toFixed(2)}).`,
      );
    }
  }

  record(costUsd: number): void {
    if (costUsd <= 0) {
      return;
    }

    this.rolloverIfNeeded();
    this.spentUsd = Number((this.spentUsd + costUsd).toFixed(6));
  }

  snapshot(): CostSnapshot {
    this.rolloverIfNeeded();

    return {
      day: this.day,
      spentUsd: this.spentUsd,
      limitUsd: this.limitUsd,
      remainingUsd: Number(Math.max(0, this.limitUsd - this.spentUsd).toFixed(6)),
    };
  }

  private rolloverIfNeeded(): void {
    const today = currentDay();

    if (this.day !== today) {
      this.day = today;
      this.spentUsd = 0;
    }
  }
}
