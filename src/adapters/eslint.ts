import { ESLint, type Linter } from 'eslint';
import { BaseAdapter, type AdapterConfig } from './base.js';
import { eslintNormalizer, type ESLintFileResult, type ESLintIssue } from '@/normalizers/eslint.js';
import type {
  AnalysisTarget,
  AnalysisOptions,
  AnalysisResult,
  AnalysisSummary,
  Severity,
  WCAGPrinciple
} from '@/types/index.js';

export type ESLintAdapterConfig = AdapterConfig

const DEFAULT_ESLINT_RULES: Linter.RulesRecord = {
  'vuejs-accessibility/alt-text': 'error',
  'vuejs-accessibility/anchor-has-content': 'error',
  'vuejs-accessibility/aria-props': 'error',
  'vuejs-accessibility/aria-role': 'error',
  'vuejs-accessibility/aria-unsupported-elements': 'error',
  'vuejs-accessibility/click-events-have-key-events': 'error',
  'vuejs-accessibility/form-control-has-label': 'error',
  'vuejs-accessibility/heading-has-content': 'error',
  'vuejs-accessibility/iframe-has-title': 'error',
  'vuejs-accessibility/interactive-supports-focus': 'error',
  'vuejs-accessibility/label-has-for': 'error',
  'vuejs-accessibility/media-has-caption': 'error',
  'vuejs-accessibility/mouse-events-have-key-events': 'error',
  'vuejs-accessibility/no-access-key': 'error',
  'vuejs-accessibility/no-autofocus': 'warn',
  'vuejs-accessibility/no-distracting-elements': 'error',
  'vuejs-accessibility/no-onchange': 'warn',
  'vuejs-accessibility/no-redundant-roles': 'warn',
  'vuejs-accessibility/no-static-element-interactions': 'error',
  'vuejs-accessibility/role-has-required-aria-props': 'error',
  'vuejs-accessibility/tabindex-no-positive': 'error'
};

export class ESLintAdapter extends BaseAdapter {
  readonly name = 'eslint-vuejs-a11y';
  readonly version = '2.4.1';

  constructor(config: ESLintAdapterConfig = {}) {
    super(config);
  }

  async analyze(
    target: AnalysisTarget,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    const targetValue = target.value;

    this.logger.info('Starting ESLint a11y analysis', { target: targetValue, type: target.type });

    try {
      const eslint = await this.createESLintInstance(options);
      const results = await this.runESLint(eslint, target);

      const fileResults: ESLintFileResult[] = results.map((r) => ({
        filePath: r.filePath,
        messages: r.messages.map((m): ESLintIssue => ({
          ruleId: m.ruleId,
          severity: m.severity as 1 | 2,
          message: m.message,
          line: m.line,
          column: m.column,
          endLine: m.endLine,
          endColumn: m.endColumn,
          nodeType: m.nodeType ?? undefined,
          source: r.source
        })),
        errorCount: r.errorCount,
        warningCount: r.warningCount
      }));

      const issues = eslintNormalizer.normalize(fileResults, {
        tool: 'eslint-vuejs-a11y'
      });

      const duration = Date.now() - startTime;

      this.logger.info('ESLint a11y analysis completed', {
        target: targetValue,
        issueCount: issues.length,
        durationMs: duration
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        duration,
        target: targetValue,
        tool: 'eslint-vuejs-a11y',
        issues,
        summary: this.buildSummary(issues),
        metadata: {
          toolVersion: this.version
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('ESLint a11y analysis failed', {
        target: targetValue,
        error: error instanceof Error ? error : new Error(errorMessage)
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        duration,
        target: targetValue,
        tool: 'eslint-vuejs-a11y',
        issues: [],
        summary: this.buildSummary([]),
        error: errorMessage
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return typeof ESLint === 'function';
    } catch {
      return false;
    }
  }

  private async createESLintInstance(options?: AnalysisOptions): Promise<ESLint> {
    const vuePlugin = await import('eslint-plugin-vuejs-accessibility');
    const vueParser = await import('vue-eslint-parser');

    const rules = { ...DEFAULT_ESLINT_RULES };

    if (options?.rules) {
      for (const rule of options.rules) {
        rules[rule] = 'error';
      }
    }

    if (options?.excludeRules) {
      for (const rule of options.excludeRules) {
        rules[rule] = 'off';
      }
    }

    const plugin = vuePlugin.default ?? vuePlugin;
    const parser = vueParser.default ?? vueParser;

    const baseConfig: Linter.Config[] = [
      {
        files: ['**/*.vue'],
        languageOptions: {
          parser: parser as Linter.Parser,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module'
          }
        },
        plugins: {
          'vuejs-accessibility': plugin as ESLint.Plugin
        },
        rules
      }
    ];

    return new ESLint({
      overrideConfigFile: true,
      overrideConfig: baseConfig,
      fix: false
    });
  }

  private async runESLint(
    eslint: ESLint,
    target: AnalysisTarget
  ): Promise<ESLint.LintResult[]> {
    if (target.type === 'file') {
      return eslint.lintFiles([target.value]);
    }

    if (target.type === 'html') {
      return eslint.lintText(target.value, {
        filePath: 'inline.vue'
      });
    }

    throw new Error(`Unsupported target type for ESLint: ${target.type}. Use 'file' or 'html' (for inline Vue code).`);
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

export const createESLintAdapter = (config?: ESLintAdapterConfig): ESLintAdapter => {
  return new ESLintAdapter(config);
};
