import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';
import type { Pa11yToolInput, Pa11yToolOutput } from '../types/index.js';

export function buildAnalysisTarget(input: Pa11yToolInput): AnalysisTarget {
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

export function buildAnalysisOptions(input: Pa11yToolInput): AnalysisOptions {
  const standardMap: Record<string, 'A' | 'AA' | 'AAA'> = {
    'WCAG2A': 'A',
    'WCAG2AA': 'AA',
    'WCAG2AAA': 'AAA',
    'WCAG21A': 'A',
    'WCAG21AA': 'AA',
    'WCAG21AAA': 'AAA'
  };

  const wcagLevel = input.options?.standard
    ? standardMap[input.options.standard] ?? 'AA'
    : 'AA';

  return {
    wcagLevel,
    includeWarnings: input.options?.includeWarnings ?? true,
  };
}

export function formatOutput(result: AnalysisResult): Pa11yToolOutput {
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
