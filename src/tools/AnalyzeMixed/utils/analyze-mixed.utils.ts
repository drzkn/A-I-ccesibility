import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type {
  AccessibilityIssue,
  ToolSource,
  Severity,
  WCAGPrinciple,
  CombinedAnalysisResult,
} from '@/shared/types/accessibility.js';
import type { CombinedAnalysisInput, CombinedToolOutput } from '../types/index.js';

export function buildAnalysisTarget(input: CombinedAnalysisInput): AnalysisTarget {
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

export function buildAnalysisOptions(input: CombinedAnalysisInput): AnalysisOptions {
  return {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    includeWarnings: true,
  };
}

export function generateIssueFingerprint(issue: AccessibilityIssue): string {
  const parts = [
    issue.ruleId,
    issue.wcag?.criterion ?? 'no-wcag',
    issue.location.selector ?? issue.location.file ?? 'no-location',
    issue.message.substring(0, 50)
  ];
  return parts.join('|');
}

export function deduplicateIssues(issues: AccessibilityIssue[]): AccessibilityIssue[] {
  const seen = new Map<string, AccessibilityIssue>();

  for (const issue of issues) {
    const fingerprint = generateIssueFingerprint(issue);

    if (!seen.has(fingerprint)) {
      seen.set(fingerprint, issue);
    } else {
      const existing = seen.get(fingerprint)!;

      if (issue.severity === 'critical' && existing.severity !== 'critical') {
        seen.set(fingerprint, issue);
      } else if (issue.confidence && existing.confidence && issue.confidence > existing.confidence) {
        seen.set(fingerprint, issue);
      }
    }
  }

  return Array.from(seen.values());
}

export function groupByWCAG(issues: AccessibilityIssue[]): Record<string, AccessibilityIssue[]> {
  const grouped: Record<string, AccessibilityIssue[]> = {};

  for (const issue of issues) {
    const key = issue.wcag?.criterion ?? 'unknown';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key]!.push(issue);
  }

  return grouped;
}

export function buildCombinedSummary(
  issues: AccessibilityIssue[],
  _toolsUsed: ToolSource[]
): CombinedAnalysisResult['summary'] {
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

  const byTool: Record<Exclude<ToolSource, 'contrast-analyzer'>, number> = {
    'axe-core': 0,
    'pa11y': 0,
    'lighthouse': 0,
  };

  const byRule: Record<string, number> = {};

  for (const issue of issues) {
    bySeverity[issue.severity]++;

    if (issue.wcag?.principle) {
      byPrinciple[issue.wcag.principle]++;
    }

    if (issue.tool in byTool) {
      byTool[issue.tool as Exclude<ToolSource, 'contrast-analyzer'>]++;
    }
    byRule[issue.ruleId] = (byRule[issue.ruleId] ?? 0) + 1;
  }

  return {
    total: issues.length,
    bySeverity,
    byPrinciple,
    byTool,
    byRule
  };
}

export function formatOutput(
  result: CombinedAnalysisResult,
  deduplicatedCount: number,
  issuesByWCAG: Record<string, AccessibilityIssue[]>
): CombinedToolOutput {
  return {
    success: result.success,
    target: result.target,
    toolsUsed: result.toolsUsed as Array<'axe-core' | 'pa11y' | 'lighthouse'>,
    issueCount: result.issues.length,
    deduplicatedCount,
    issues: result.issues,
    issuesByWCAG,
    summary: result.summary,
    individualResults: result.individualResults ?? [],
    duration: result.duration,
    error: result.error
  };
}
