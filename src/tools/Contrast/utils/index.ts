export * from './converters.js';
export * from './parsers.js';
export * from './contrast.js';

import type { AnalysisTarget } from '@/shared/types/analysis.js';
import type { ContrastToolInput, ContrastAnalysisResult } from '../types/contrast.js';

export interface ContrastToolOutput {
  success: boolean;
  target: string;
  wcagLevel: string;
  issueCount: number;
  issues: ContrastAnalysisResult['issues'];
  summary: ContrastAnalysisResult['summary'];
  duration?: number | undefined;
  error?: string | undefined;
}

export function buildAnalysisTarget(input: ContrastToolInput): AnalysisTarget {
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

export interface ContrastBuildOptions {
  wcagLevel: 'AA' | 'AAA';
  suggestFixes: boolean;
  includePassingElements: boolean;
  selector?: string;
}

export function buildAnalysisOptions(input: ContrastToolInput): ContrastBuildOptions {
  const options: ContrastBuildOptions = {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    suggestFixes: input.options?.suggestFixes ?? true,
    includePassingElements: input.options?.includePassingElements ?? false,
  };
  if (input.options?.selector !== undefined) {
    options.selector = input.options.selector;
  }
  return options;
}

export function formatOutput(result: ContrastAnalysisResult): ContrastToolOutput {
  return {
    success: result.success,
    target: result.target,
    wcagLevel: result.wcagLevel,
    issueCount: result.issues.length,
    issues: result.issues,
    summary: result.summary,
    duration: result.duration,
    error: result.error,
  };
}
