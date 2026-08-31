import { AppError } from '../errors.js';

export type CostSnapshot = {
  day: string;
  spentUsd: number;
  limitUsd: number;
  remainingUsd: number;
};

/**
 * O fornecedor fatura no fuso da conta de billing, nao em UTC. Fixar o dia no
 * fuso do Google Cloud evita que o contador zere horas antes da meia-noite real
 * de faturamento e libere um segundo teto dentro do mesmo dia cobrado.
 * Ajustar se a conta de billing usar outro fuso.
 */
const BILLING_TIMEZONE = 'America/Los_Angeles';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BILLING_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const currentDay = (): string => dayFormatter.format(new Date());

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

  /**
   * Verifica o teto e soma o custo estimado no mesmo passo sincrono. Chamar
   * antes do `await` da chamada paga, mesmo que ela possa falhar depois: uma
   * chamada que o provider ja cobrou nao pode ficar de fora da conta so porque
   * devolveu erro.
   *
   * Checar e somar em dois passos separados (como antes) deixa uma janela entre
   * eles: duas chamadas concorrentes podem ler o mesmo saldo e passar juntas,
   * cada uma pensando que ainda ha orcamento. Manter os dois no mesmo metodo
   * sincrono fecha essa janela — nao ha `await` entre a leitura e a escrita.
   */
  reserve(costUsd: number): void {
    this.rolloverIfNeeded();

    if (this.limitUsd - this.spentUsd <= 0) {
      throw new AppError(
        'COST_LIMIT_REACHED',
        `Limite diario de custo com APIs externas atingido (USD ${this.limitUsd.toFixed(2)}).`,
      );
    }

    if (costUsd > 0) {
      this.spentUsd = Number((this.spentUsd + costUsd).toFixed(6));
    }
  }

  /** Checagem sem custo associado (ex.: antes de decidir se vale a pena seguir). */
  assertWithinBudget(): void {
    this.reserve(0);
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
