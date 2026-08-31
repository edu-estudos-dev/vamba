import type { ApiUsageEvent } from '../types/recommendation.js';

type ApiUsageInput = {
  provider: string;
  operation: string;
  inputUnits?: number;
  outputUnits?: number;
  estimatedCost?: number;
};

export interface ApiUsageLogger {
  record(input: ApiUsageInput): void;
  getEvents(): ApiUsageEvent[];
  clear(): void;
}

export class InMemoryApiUsageLogger implements ApiUsageLogger {
  private events: ApiUsageEvent[] = [];

  record(input: ApiUsageInput): void {
    this.events.push({
      id: crypto.randomUUID(),
      provider: input.provider,
      operation: input.operation,
      inputUnits: input.inputUnits ?? 0,
      outputUnits: input.outputUnits ?? 0,
      estimatedCost: input.estimatedCost ?? 0,
      createdAt: new Date().toISOString(),
    });
  }

  getEvents(): ApiUsageEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }
}
