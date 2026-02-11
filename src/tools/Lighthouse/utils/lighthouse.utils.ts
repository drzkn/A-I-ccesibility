import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';
import type { LighthouseToolInput, LighthouseToolOutput } from '../types/index.js';

export function buildAnalysisTarget(input: LighthouseToolInput): AnalysisTarget {
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

export function buildAnalysisOptions(input: LighthouseToolInput): AnalysisOptions {
  return {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    includeWarnings: false,
  };
}

export function formatOutput(result: AnalysisResult): LighthouseToolOutput {
  const summary = result.summary as AnalysisResult['summary'] & { accessibilityScore?: number };

  return {
    success: result.success,
    target: result.target,
    accessibilityScore: summary.accessibilityScore ?? 0,
    issueCount: result.issues.length,
    issues: result.issues,
    summary: result.summary,
    metadata: result.metadata,
    duration: result.duration,
    error: result.error,
  };
}
