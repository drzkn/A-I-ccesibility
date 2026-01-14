import { BaseNormalizer, type NormalizerContext } from './base.js';
import type { AccessibilityIssue, Severity } from '@/types/index.js';

export interface ESLintIssue {
  ruleId: string | null;
  severity: 1 | 2;
  message: string;
  line: number;
  column: number;
  endLine?: number | undefined;
  endColumn?: number | undefined;
  nodeType?: string | undefined;
  source?: string | null | undefined;
}

export interface ESLintFileResult {
  filePath: string;
  messages: ESLintIssue[];
  errorCount: number;
  warningCount: number;
}

const ESLINT_RULE_WCAG_MAP: Record<string, { criterion: string; principle: 'perceivable' | 'operable' | 'understandable' | 'robust' }> = {
  'vuejs-accessibility/alt-text': { criterion: '1.1.1', principle: 'perceivable' },
  'vuejs-accessibility/anchor-has-content': { criterion: '2.4.4', principle: 'operable' },
  'vuejs-accessibility/aria-props': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/aria-role': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/aria-unsupported-elements': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/click-events-have-key-events': { criterion: '2.1.1', principle: 'operable' },
  'vuejs-accessibility/form-control-has-label': { criterion: '1.3.1', principle: 'perceivable' },
  'vuejs-accessibility/heading-has-content': { criterion: '1.3.1', principle: 'perceivable' },
  'vuejs-accessibility/iframe-has-title': { criterion: '2.4.1', principle: 'operable' },
  'vuejs-accessibility/interactive-supports-focus': { criterion: '2.1.1', principle: 'operable' },
  'vuejs-accessibility/label-has-for': { criterion: '1.3.1', principle: 'perceivable' },
  'vuejs-accessibility/media-has-caption': { criterion: '1.2.2', principle: 'perceivable' },
  'vuejs-accessibility/mouse-events-have-key-events': { criterion: '2.1.1', principle: 'operable' },
  'vuejs-accessibility/no-access-key': { criterion: '2.1.1', principle: 'operable' },
  'vuejs-accessibility/no-autofocus': { criterion: '2.4.3', principle: 'operable' },
  'vuejs-accessibility/no-distracting-elements': { criterion: '2.2.2', principle: 'operable' },
  'vuejs-accessibility/no-onchange': { criterion: '3.2.2', principle: 'understandable' },
  'vuejs-accessibility/no-redundant-roles': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/no-static-element-interactions': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/role-has-required-aria-props': { criterion: '4.1.2', principle: 'robust' },
  'vuejs-accessibility/tabindex-no-positive': { criterion: '2.4.3', principle: 'operable' }
};

export class ESLintNormalizer extends BaseNormalizer<ESLintFileResult[]> {
  normalize(results: ESLintFileResult[], context: NormalizerContext): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    for (const fileResult of results) {
      for (const message of fileResult.messages) {
        if (!message.ruleId) continue;

        const issue = this.normalizeIssue(message, fileResult.filePath, context);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  private normalizeIssue(
    message: ESLintIssue,
    filePath: string,
    _context: NormalizerContext
  ): AccessibilityIssue | null {
    if (!message.ruleId) return null;

    const wcagInfo = this.getWcagInfo(message.ruleId);

    return {
      id: this.generateIssueId('eslint-vuejs-a11y', message.ruleId, `${filePath}:${message.line}:${message.column}`),
      ruleId: message.ruleId,
      tool: 'eslint-vuejs-a11y',
      severity: this.mapSeverity(message.severity),
      wcag: wcagInfo,
      location: {
        file: filePath,
        line: message.line,
        column: message.column,
        snippet: message.source ?? undefined
      },
      message: message.message,
      confidence: 1
    };
  }

  private mapSeverity(severity: 1 | 2): Severity {
    return severity === 2 ? 'serious' : 'moderate';
  }

  private getWcagInfo(ruleId: string): AccessibilityIssue['wcag'] | undefined {
    const mapping = ESLINT_RULE_WCAG_MAP[ruleId];
    if (!mapping) return undefined;

    return {
      criterion: mapping.criterion,
      level: 'A',
      principle: mapping.principle,
      version: '2.1'
    };
  }
}

export const eslintNormalizer = new ESLintNormalizer();
