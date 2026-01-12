import type { AnalysisTarget, AnalysisOptions, AnalysisResult } from '@/types/index.js';

export interface AdapterConfig {
  timeout?: number;
  maxRetries?: number;
}

export interface Adapter {
  readonly name: string;
  readonly version: string;

  analyze(
    target: AnalysisTarget,
    options?: AnalysisOptions
  ): Promise<AnalysisResult>;

  isAvailable(): Promise<boolean>;

  dispose(): Promise<void>;
}

export abstract class BaseAdapter implements Adapter {
  abstract readonly name: string;
  abstract readonly version: string;

  protected config: AdapterConfig;

  constructor(config: AdapterConfig = {}) {
    this.config = {
      timeout: 30000,
      maxRetries: 1,
      ...config
    };
  }

  abstract analyze(
    target: AnalysisTarget,
    options?: AnalysisOptions
  ): Promise<AnalysisResult>;

  abstract isAvailable(): Promise<boolean>;

  async dispose(): Promise<void> {
  }
}
