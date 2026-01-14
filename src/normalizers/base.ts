import type { AccessibilityIssue, ToolSource, Severity } from '@/types/index.js';

export interface NormalizerContext {
  tool: ToolSource;
  targetUrl?: string | undefined;
  targetFile?: string | undefined;
}

export interface Normalizer<TRawResult = unknown> {
  normalize(raw: TRawResult, context: NormalizerContext): AccessibilityIssue[];
}

export abstract class BaseNormalizer<TRawResult = unknown> implements Normalizer<TRawResult> {
  abstract normalize(raw: TRawResult, context: NormalizerContext): AccessibilityIssue[];

  protected generateIssueId(tool: ToolSource, ruleId: string, selector?: string): string {
    const base = `${tool}:${ruleId}`;
    if (selector) {
      const selectorHash = this.hashString(selector).toString(16);
      return `${base}:${selectorHash}`;
    }
    return base;
  }

  protected mapImpactToSeverity(impact: string | undefined): Severity {
    const mapping: Record<string, Severity> = {
      critical: 'critical',
      serious: 'serious',
      moderate: 'moderate',
      minor: 'minor',
    };
    return mapping[impact ?? ''] ?? 'moderate';
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
