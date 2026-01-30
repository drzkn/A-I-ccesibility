import pa11y from 'pa11y';
import { BaseAdapter, type AdapterConfig } from '@/shared/adapters/base.js';
import { pa11yNormalizer } from '../normalizers/index.js';
import type { Pa11yIssue } from '../types/index.js';
import type {
  AnalysisTarget,
  AnalysisOptions,
} from '@/shared/types/analysis.js';
import type {
  AnalysisResult,
  AnalysisSummary,
  Severity,
  WCAGPrinciple
} from '@/shared/types/accessibility.js';

type Pa11yOptions = NonNullable<Parameters<typeof pa11y>[1]>;

interface Pa11yResults {
  documentTitle: string;
  pageUrl: string;
  issues: Pa11yIssue[];
}

export interface Pa11yAdapterConfig extends AdapterConfig {
  chromeLaunchConfig?: {
    executablePath?: string;
    ignoreHTTPSErrors?: boolean;
  };
}

export class Pa11yAdapter extends BaseAdapter {
  readonly name = 'pa11y';
  readonly version = '9.0.1';

  private adapterConfig: Pa11yAdapterConfig;

  constructor(config: Pa11yAdapterConfig = {}) {
    super(config);
    this.adapterConfig = config;
  }

  async analyze(
    target: AnalysisTarget,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    const targetValue = target.value;

    this.logger.info('Starting Pa11y analysis', { target: targetValue });

    try {
      const pa11yOptions = this.buildPa11yOptions(target, options);
      const results = await this.runPa11y(target, pa11yOptions);

      const issues = pa11yNormalizer.normalize(results.issues, {
        tool: 'pa11y',
        targetUrl: target.type === 'url' ? targetValue : undefined
      });

      const duration = Date.now() - startTime;

      this.logger.info('Pa11y analysis completed', {
        target: targetValue,
        issueCount: issues.length,
        durationMs: duration
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        duration,
        target: targetValue,
        tool: 'pa11y',
        issues,
        summary: this.buildSummary(issues),
        metadata: {
          toolVersion: this.version,
          pageTitle: results.documentTitle
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Pa11y analysis failed', {
        target: targetValue,
        error: error instanceof Error ? error : new Error(errorMessage)
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        target: targetValue,
        tool: 'pa11y',
        issues: [],
        summary: this.buildSummary([]),
        error: errorMessage
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return typeof pa11y === 'function';
    } catch {
      return false;
    }
  }

  private buildPa11yOptions(
    target: AnalysisTarget,
    options?: AnalysisOptions
  ): Pa11yOptions {
    const pa11yOpts: Pa11yOptions = {
      timeout: this.config.timeout,
      wait: 0,
      standard: this.mapWcagLevel(options?.wcagLevel ?? 'AA'),
      includeWarnings: options?.includeWarnings ?? true,
      includeNotices: false
    };

    if (target.options?.viewport) {
      pa11yOpts.viewport = {
        width: target.options.viewport.width,
        height: target.options.viewport.height
      };
    }

    if (target.options?.waitForSelector) {
      pa11yOpts.wait = 1000;
    }

    if (target.options?.timeout) {
      pa11yOpts.wait = target.options.timeout;
    }

    if (this.adapterConfig.chromeLaunchConfig) {
      pa11yOpts.chromeLaunchConfig = this.adapterConfig.chromeLaunchConfig as Pa11yOptions['chromeLaunchConfig'];
    }

    if (options?.rules && options.rules.length > 0) {
      pa11yOpts.rules = options.rules;
    }

    if (options?.excludeRules && options.excludeRules.length > 0) {
      pa11yOpts.ignore = options.excludeRules;
    }

    return pa11yOpts;
  }

  private async runPa11y(
    target: AnalysisTarget,
    options: Pa11yOptions
  ): Promise<Pa11yResults> {
    if (target.type === 'url') {
      return pa11y(target.value, options) as Promise<Pa11yResults>;
    }

    if (target.type === 'html') {
      const htmlContent = target.value;
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      return pa11y(dataUrl, options) as Promise<Pa11yResults>;
    }

    throw new Error(`Unsupported target type: ${target.type}`);
  }

  private mapWcagLevel(level: 'A' | 'AA' | 'AAA'): 'WCAG2A' | 'WCAG2AA' | 'WCAG2AAA' {
    const mapping = {
      A: 'WCAG2A' as const,
      AA: 'WCAG2AA' as const,
      AAA: 'WCAG2AAA' as const
    };
    return mapping[level];
  }

  private buildSummary(issues: AnalysisResult['issues']): AnalysisSummary {
    const bySeverity: Record<Severity, number> = {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    };

    const byPrinciple: Record<WCAGPrinciple, number> = {
      perceivable: 0,
      operable: 0,
      understandable: 0,
      robust: 0
    };

    const byRule: Record<string, number> = {};

    for (const issue of issues) {
      bySeverity[issue.severity]++;

      if (issue.wcag?.principle) {
        byPrinciple[issue.wcag.principle]++;
      }

      byRule[issue.ruleId] = (byRule[issue.ruleId] ?? 0) + 1;
    }

    return {
      total: issues.length,
      bySeverity,
      byPrinciple,
      byRule
    };
  }
}

export const createPa11yAdapter = (config?: Pa11yAdapterConfig): Pa11yAdapter => {
  return new Pa11yAdapter(config);
};
