import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';
import type { AxeToolInput, AxeToolOutput } from '../types/index.js';

export function buildAnalysisTarget(input: AxeToolInput): AnalysisTarget {
  if (input.url) {
    return {
      type: 'url',
      value: input.url,
      options: {
        waitForSelector: input.options?.browser?.waitForSelector,
        timeout: input.options?.browser?.waitForTimeout,
        viewport: input.options?.browser?.viewport,
        ignoreHTTPSErrors: input.options?.browser?.ignoreHTTPSErrors,
      },
    };
  }

  return {
    type: 'html',
    value: input.html!,
    options: {
      waitForSelector: input.options?.browser?.waitForSelector,
      timeout: input.options?.browser?.waitForTimeout,
      viewport: input.options?.browser?.viewport,
      ignoreHTTPSErrors: input.options?.browser?.ignoreHTTPSErrors,
    },
  };
}

export function buildAnalysisOptions(input: AxeToolInput): AnalysisOptions {
  return {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    rules: input.options?.rules,
    excludeRules: input.options?.excludeRules,
    includeWarnings: input.options?.includeIncomplete ?? false,
  };
}

export function formatOutput(result: AnalysisResult): AxeToolOutput {
  return {
    success: result.success,
    target: result.target,
    issueCount: result.issues.length,
    issues: result.issues,
    summary: result.summary,
    metadata: result.metadata,
    duration: result.duration,
    error: result.error,
  };
}
