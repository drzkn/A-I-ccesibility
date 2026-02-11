import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import { BaseAdapter } from '@/shared/adapters/base.js';
import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type {
  AnalysisResult,
  AnalysisSummary,
  AccessibilityIssue,
  Severity,
  WCAGReference,
  WCAGLevel,
  WCAGPrinciple,
  IssueLocation,
} from '@/shared/types/accessibility.js';
import type {
  LighthouseAdapterConfig,
  LighthouseAudit,
  LighthouseAuditDetail,
  LighthouseCategory,
  LighthouseRunnerResult,
} from '../types/index.js';
import { PRINCIPLE_MAP, AUDIT_WCAG_MAP } from '../types/index.js';

export class LighthouseAdapter extends BaseAdapter {
  readonly name = 'lighthouse';
  readonly version = '13.x';

  private browser: Browser | null = null;
  private adapterConfig: LighthouseAdapterConfig;

  constructor(config: LighthouseAdapterConfig = {}) {
    super(config);
    this.adapterConfig = {
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...config,
    };
  }

  async analyze(target: AnalysisTarget, _options?: AnalysisOptions): Promise<AnalysisResult> {
    const startTime = Date.now();

    if (target.type !== 'url') {
      return this.buildErrorResult(
        target.value,
        new Error(
          'Lighthouse only supports URL targets. Provide a valid URL instead of raw HTML or file paths.'
        ),
        Date.now() - startTime
      );
    }

    try {
      this.logger.info('Starting Lighthouse accessibility analysis', { target: target.value });

      await this.ensureBrowser();
      const port = new URL(this.browser!.wsEndpoint()).port;

      const flags: Record<string, unknown> = {
        port: Number(port),
        onlyCategories: ['accessibility'],
        output: 'json',
        logLevel: 'error',
      };

      if (target.options?.viewport) {
        flags.screenEmulation = {
          width: target.options.viewport.width,
          height: target.options.viewport.height,
          deviceScaleFactor: 1,
          mobile: false,
          disabled: false,
        };
      }

      if (target.options?.timeout) {
        flags.maxWaitForLoad = target.options.timeout;
      }

      const result = (await lighthouse(target.value, flags)) as unknown as LighthouseRunnerResult;

      if (!result?.lhr) {
        throw new Error('Lighthouse returned no results');
      }

      const accessibilityScore = (result.lhr.categories.accessibility?.score ?? 0) * 100;
      const issues = this.transformResults(result.lhr.audits, result.lhr.categories.accessibility);
      const duration = Date.now() - startTime;

      this.logger.info('Lighthouse analysis completed', {
        issueCount: issues.length,
        accessibilityScore,
        duration,
      });

      return {
        success: true,
        timestamp: new Date().toISOString(),
        duration,
        target: target.value,
        tool: 'lighthouse',
        issues,
        summary: this.buildSummary(issues, accessibilityScore),
        metadata: {
          toolVersion: result.lhr.lighthouseVersion,
          browserInfo: result.lhr.userAgent,
          pageTitle: result.lhr.finalDisplayedUrl,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Lighthouse analysis failed', {
        error: error as Error,
        target: target.value,
      });

      return this.buildErrorResult(target.value, error, duration);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.ensureBrowser();
      return true;
    } catch {
      return false;
    }
  }

  async dispose(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.debug('Browser closed');
    }
    await super.dispose();
  }

  private async ensureBrowser(): Promise<void> {
    if (!this.browser || !this.browser.connected) {
      this.logger.debug('Launching browser', {
        ignoreHTTPSErrors: this.adapterConfig.ignoreHTTPSErrors,
      });

      const baseArgs = this.adapterConfig.browserArgs ?? ['--no-sandbox', '--disable-setuid-sandbox'];
      const sslArgs = this.adapterConfig.ignoreHTTPSErrors
        ? ['--ignore-certificate-errors', '--ignore-ssl-errors', '--allow-running-insecure-content']
        : [];

      this.browser = await puppeteer.launch({
        headless: this.adapterConfig.headless ?? true,
        args: [...baseArgs, ...sslArgs],
        acceptInsecureCerts: this.adapterConfig.ignoreHTTPSErrors ?? false,
      });
    }
  }

  private transformResults(
    audits: Record<string, LighthouseAudit>,
    category?: LighthouseCategory
  ): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    let issueIndex = 0;

    const auditIds = category
      ? category.auditRefs.map((ref) => ref.id)
      : Object.keys(audits);

    for (const auditId of auditIds) {
      const audit = audits[auditId];
      if (!audit) continue;

      if (audit.score === 1 || audit.score === null) continue;
      if (audit.scoreDisplayMode === 'manual' || audit.scoreDisplayMode === 'notApplicable') continue;

      const items = audit.details?.items;
      if (items && items.length > 0) {
        for (const item of items) {
          issues.push(this.transformAuditItem(audit, item, issueIndex++));
        }
      } else {
        issues.push(this.transformAuditWithoutNodes(audit, issueIndex++));
      }
    }

    return issues;
  }

  private transformAuditItem(
    audit: LighthouseAudit,
    item: NonNullable<LighthouseAuditDetail['items']>[number],
    index: number
  ): AccessibilityIssue {
    const severity = this.mapAuditToSeverity(audit.score);
    const wcag = this.mapAuditToWCAG(audit.id);
    const location = this.extractLocation(item);

    return {
      id: `lighthouse-${index}`,
      ruleId: audit.id,
      tool: 'lighthouse',
      severity,
      wcag,
      location,
      message: audit.title,
      humanContext: this.cleanDescription(audit.description),
      suggestedActions: this.extractSuggestedActions(audit, item),
      affectedUsers: this.inferAffectedUsers(audit.id),
      confidence: audit.score !== null ? 1 - audit.score : 0.8,
      rawResult: { audit: { id: audit.id, score: audit.score }, item },
    };
  }

  private transformAuditWithoutNodes(audit: LighthouseAudit, index: number): AccessibilityIssue {
    const severity = this.mapAuditToSeverity(audit.score);
    const wcag = this.mapAuditToWCAG(audit.id);

    return {
      id: `lighthouse-${index}`,
      ruleId: audit.id,
      tool: 'lighthouse',
      severity,
      wcag,
      location: {},
      message: audit.title,
      humanContext: this.cleanDescription(audit.description),
      suggestedActions: [],
      affectedUsers: this.inferAffectedUsers(audit.id),
      confidence: audit.score !== null ? 1 - audit.score : 0.8,
      rawResult: { audit: { id: audit.id, score: audit.score } },
    };
  }

  private mapAuditToSeverity(score: number | null): Severity {
    if (score === null || score === 0) return 'critical';
    if (score < 0.5) return 'serious';
    if (score < 0.9) return 'moderate';
    return 'minor';
  }

  private mapAuditToWCAG(auditId: string): WCAGReference | undefined {
    const mapping = AUDIT_WCAG_MAP[auditId];
    if (!mapping) return undefined;

    const principle = mapping.wcagCriterion.charAt(0);

    return {
      criterion: mapping.wcagCriterion,
      level: mapping.wcagLevel as WCAGLevel,
      principle: PRINCIPLE_MAP[principle] ?? 'perceivable',
      version: '2.1',
    };
  }

  private extractLocation(
    item: NonNullable<LighthouseAuditDetail['items']>[number]
  ): IssueLocation {
    const node = item.node;
    if (!node) return {};

    return {
      selector: node.selector,
      snippet: node.snippet?.substring(0, 500),
    };
  }

  private cleanDescription(description: string): string {
    return description.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
  }

  private extractSuggestedActions(
    audit: LighthouseAudit,
    item: NonNullable<LighthouseAuditDetail['items']>[number]
  ): string[] {
    const actions: string[] = [];

    if (item.node?.explanation) {
      actions.push(item.node.explanation);
    }

    const desc = this.cleanDescription(audit.description);
    if (desc && desc !== audit.title) {
      actions.push(desc);
    }

    return actions;
  }

  private inferAffectedUsers(
    auditId: string
  ): Array<
    | 'screen-reader'
    | 'keyboard-only'
    | 'low-vision'
    | 'color-blind'
    | 'cognitive'
    | 'motor-impaired'
  > {
    const users: Set<
      | 'screen-reader'
      | 'keyboard-only'
      | 'low-vision'
      | 'color-blind'
      | 'cognitive'
      | 'motor-impaired'
    > = new Set();

    const id = auditId.toLowerCase();

    if (
      id.includes('aria') ||
      id.includes('label') ||
      id.includes('alt') ||
      id.includes('image') ||
      id.includes('role')
    ) {
      users.add('screen-reader');
    }

    if (id.includes('keyboard') || id.includes('focus') || id.includes('tabindex') || id === 'accesskeys') {
      users.add('keyboard-only');
      users.add('motor-impaired');
    }

    if (id.includes('color') || id.includes('contrast')) {
      users.add('low-vision');
      users.add('color-blind');
    }

    if (id === 'font-size' || id === 'meta-viewport') {
      users.add('low-vision');
    }

    if (id === 'tap-targets') {
      users.add('motor-impaired');
    }

    if (
      id.includes('heading') ||
      id.includes('landmark') ||
      id.includes('link') ||
      id === 'document-title'
    ) {
      users.add('screen-reader');
      users.add('cognitive');
    }

    if (users.size === 0) {
      users.add('screen-reader');
    }

    return Array.from(users);
  }

  private buildSummary(issues: AccessibilityIssue[], accessibilityScore?: number): AnalysisSummary {
    const bySeverity: Record<Severity, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    const byPrinciple: Record<WCAGPrinciple, number> = {
      perceivable: 0,
      operable: 0,
      understandable: 0,
      robust: 0,
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
      byRule,
      ...(accessibilityScore !== undefined && {
        accessibilityScore: Math.round(accessibilityScore),
      }),
    };
  }

  private buildErrorResult(target: string, error: unknown, duration: number): AnalysisResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      duration,
      target,
      tool: 'lighthouse',
      issues: [],
      summary: {
        total: 0,
        bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      },
      error: errorMessage,
    };
  }
}

export const createLighthouseAdapter = (config?: LighthouseAdapterConfig): LighthouseAdapter => {
  return new LighthouseAdapter(config);
};
