import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';
import { createAdapterLogger } from '@/shared/utils/logger.js';

export interface AdapterConfig {
  timeout?: number;
  maxRetries?: number;
}

export interface Adapter {
  readonly name: string;
  readonly version: string;

  analyze(target: AnalysisTarget, options?: AnalysisOptions): Promise<AnalysisResult>;

  isAvailable(): Promise<boolean>;

  dispose(): Promise<void>;
}

export abstract class BaseAdapter implements Adapter {
  abstract readonly name: string;
  abstract readonly version: string;

  protected config: AdapterConfig;
  protected logger: ReturnType<typeof createAdapterLogger>;

  constructor(config: AdapterConfig = {}) {
    this.config = {
      timeout: 30000,
      maxRetries: 1,
      ...config,
    };
    this.logger = createAdapterLogger(this.constructor.name);
  }

  abstract analyze(target: AnalysisTarget, options?: AnalysisOptions): Promise<AnalysisResult>;

  abstract isAvailable(): Promise<boolean>;

  async dispose(): Promise<void> {
    this.logger.debug('Adapter disposed');
  }
}
