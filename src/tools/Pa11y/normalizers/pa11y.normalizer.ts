import { BaseNormalizer, type NormalizerContext } from '@/shared/normalizers/base.js';
import type { AccessibilityIssue, WCAGPrinciple, WCAGLevel, Severity } from '@/shared/types/accessibility.js';
import type { Pa11yIssue } from '../types/index.js';

const WCAG_PATTERN = /WCAG2(A{1,3})\.(Principle\d)\.Guideline\d+_\d+\.(\d+_\d+_\d+)/;

export class Pa11yNormalizer extends BaseNormalizer<Pa11yIssue[]> {
  normalize(issues: Pa11yIssue[], context: NormalizerContext): AccessibilityIssue[] {
    return issues.map((issue) => this.normalizeIssue(issue, context));
  }

  private normalizeIssue(issue: Pa11yIssue, context: NormalizerContext): AccessibilityIssue {
    const wcagInfo = this.parseWcagCode(issue.code);

    const baseIssue = {
      id: this.generateIssueId('pa11y', issue.code, issue.selector),
      ruleId: issue.code,
      tool: 'pa11y' as const,
      severity: this.mapTypeToSeverity(issue.type),
      wcag: wcagInfo,
      location: {
        selector: issue.selector,
        snippet: issue.context,
        file: context.targetFile
      },
      message: issue.message,
      confidence: issue.type === 'error' ? 1 : 0.8
    };

    return this.enrichWithHumanContext(baseIssue) as AccessibilityIssue;
  }

  private mapTypeToSeverity(type: 'error' | 'warning' | 'notice'): Severity {
    const mapping: Record<string, Severity> = {
      error: 'serious',
      warning: 'moderate',
      notice: 'minor'
    };
    return mapping[type] ?? 'moderate';
  }

  private parseWcagCode(code: string): AccessibilityIssue['wcag'] | undefined {
    const match = WCAG_PATTERN.exec(code);
    if (!match) return undefined;

    const [, levelStr, principleStr, criterionRaw] = match;
    if (!levelStr || !principleStr || !criterionRaw) return undefined;

    const level = levelStr as WCAGLevel;
    const criterion = criterionRaw.replace(/_/g, '.');

    const principleMap: Record<string, WCAGPrinciple> = {
      Principle1: 'perceivable',
      Principle2: 'operable',
      Principle3: 'understandable',
      Principle4: 'robust'
    };

    const principle = principleMap[principleStr];
    if (!principle) return undefined;

    return {
      criterion,
      level,
      principle,
      version: '2.1'
    };
  }
}

export const pa11yNormalizer = new Pa11yNormalizer();
