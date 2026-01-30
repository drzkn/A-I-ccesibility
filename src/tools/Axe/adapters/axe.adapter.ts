import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import AxePuppeteer from '@axe-core/puppeteer';
import type { AxeResults, Result as AxeResult, NodeResult } from 'axe-core';
import { BaseAdapter, type AdapterConfig } from '@/shared/adapters/base.js';
import type { AnalysisTarget, AnalysisOptions } from '@/shared/types/analysis.js';
import type {
  AnalysisResult,
  AccessibilityIssue,
  Severity,
  WCAGReference,
  WCAGLevel,
  WCAGPrinciple,
  IssueLocation,
} from '@/shared/types/accessibility.js';

export interface AxeAdapterConfig extends AdapterConfig {
  headless?: boolean;
  browserArgs?: string[];
  ignoreHTTPSErrors?: boolean;
}

interface WCAGTagInfo {
  criterion: string;
  level: WCAGLevel;
  version: '2.0' | '2.1' | '2.2';
}

const SEVERITY_MAP: Record<string, Severity> = {
  critical: 'critical',
  serious: 'serious',
  moderate: 'moderate',
  minor: 'minor',
};

const PRINCIPLE_MAP: Record<string, WCAGPrinciple> = {
  '1': 'perceivable',
  '2': 'operable',
  '3': 'understandable',
  '4': 'robust',
};

export class AxeAdapter extends BaseAdapter {
  readonly name = 'axe-core';
  readonly version = '4.x';

  private browser: Browser | null = null;
  private axeConfig: AxeAdapterConfig;

  constructor(config: AxeAdapterConfig = {}) {
    super(config);
    this.axeConfig = {
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...config,
    };
  }

  async analyze(target: AnalysisTarget, options?: AnalysisOptions): Promise<AnalysisResult> {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      this.logger.info('Starting axe-core analysis', { target: target.value });

      await this.ensureBrowser();
      page = await this.browser!.newPage();

      if (target.options?.viewport) {
        await page.setViewport(target.options.viewport);
      }

      await this.loadTarget(page, target);

      const axeBuilder = new AxePuppeteer(page);
      this.configureAxeBuilder(axeBuilder, options);

      const results = await axeBuilder.analyze();
      const issues = this.transformResults(results, options);

      const duration = Date.now() - startTime;
      this.logger.info('Analysis completed', { issueCount: issues.length, duration });

      return this.buildSuccessResult(target.value, issues, results, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Analysis failed', { error: error as Error, target: target.value });

      return this.buildErrorResult(target.value, error, duration);
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
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
      this.logger.debug('Launching browser', { ignoreHTTPSErrors: this.axeConfig.ignoreHTTPSErrors });

      const baseArgs = this.axeConfig.browserArgs ?? ['--no-sandbox', '--disable-setuid-sandbox'];
      const sslArgs = this.axeConfig.ignoreHTTPSErrors
        ? ['--ignore-certificate-errors', '--ignore-ssl-errors', '--allow-running-insecure-content']
        : [];

      this.browser = await puppeteer.launch({
        headless: this.axeConfig.headless ?? true,
        args: [...baseArgs, ...sslArgs],
        acceptInsecureCerts: this.axeConfig.ignoreHTTPSErrors ?? false,
      });
    }
  }

  private async loadTarget(page: Page, target: AnalysisTarget): Promise<void> {
    const timeout = target.options?.timeout ?? this.config.timeout ?? 30000;

    switch (target.type) {
      case 'url':
        await page.goto(target.value, {
          waitUntil: 'networkidle2',
          timeout,
        });
        break;

      case 'html':
        await page.setContent(target.value, {
          waitUntil: 'networkidle2',
          timeout,
        });
        break;

      case 'file':
        await page.goto(`file://${target.value}`, {
          waitUntil: 'networkidle2',
          timeout,
        });
        break;
    }

    if (target.options?.waitForSelector) {
      await page.waitForSelector(target.options.waitForSelector, { timeout });
    }
  }

  private configureAxeBuilder(builder: AxePuppeteer, options?: AnalysisOptions): void {
    const tags = this.getWcagTags(options?.wcagLevel ?? 'AA');
    builder.withTags(tags);

    if (options?.rules && options.rules.length > 0) {
      builder.withRules(options.rules);
    }

    if (options?.excludeRules && options.excludeRules.length > 0) {
      builder.disableRules(options.excludeRules);
    }
  }

  private getWcagTags(level: 'A' | 'AA' | 'AAA'): string[] {
    const baseTags = ['wcag2a', 'wcag21a', 'wcag22a', 'best-practice'];

    if (level === 'AA' || level === 'AAA') {
      baseTags.push('wcag2aa', 'wcag21aa', 'wcag22aa');
    }

    if (level === 'AAA') {
      baseTags.push('wcag2aaa', 'wcag21aaa', 'wcag22aaa');
    }

    return baseTags;
  }

  private transformResults(results: AxeResults, options?: AnalysisOptions): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    let issueIndex = 0;

    for (const violation of results.violations) {
      for (const node of violation.nodes) {
        issues.push(this.transformViolation(violation, node, issueIndex++));
      }
    }

    if (options?.includeWarnings !== false) {
      for (const incomplete of results.incomplete) {
        for (const node of incomplete.nodes) {
          issues.push(this.transformIncomplete(incomplete, node, issueIndex++));
        }
      }
    }

    return issues;
  }

  private transformViolation(
    violation: AxeResult,
    node: NodeResult,
    index: number
  ): AccessibilityIssue {
    return {
      id: `axe-${index}`,
      ruleId: violation.id,
      tool: 'axe-core',
      severity: SEVERITY_MAP[violation.impact ?? 'moderate'] ?? 'moderate',
      wcag: this.extractWcagReference(violation.tags),
      location: this.extractLocation(node),
      message: violation.help,
      humanContext: violation.description,
      suggestedActions: this.extractSuggestedActions(node),
      affectedUsers: this.inferAffectedUsers(violation),
      confidence: 1,
      rawResult: { violation, node },
    };
  }

  private transformIncomplete(
    incomplete: AxeResult,
    node: NodeResult,
    index: number
  ): AccessibilityIssue {
    return {
      id: `axe-incomplete-${index}`,
      ruleId: incomplete.id,
      tool: 'axe-core',
      severity: 'minor',
      wcag: this.extractWcagReference(incomplete.tags),
      location: this.extractLocation(node),
      message: `[Requires review] ${incomplete.help}`,
      humanContext: incomplete.description,
      suggestedActions: this.extractSuggestedActions(node),
      affectedUsers: this.inferAffectedUsers(incomplete),
      confidence: 0.5,
      rawResult: { incomplete, node },
    };
  }

  private extractLocation(node: NodeResult): IssueLocation {
    return {
      selector: node.target.join(' '),
      xpath: node.xpath?.join(' '),
      snippet: node.html?.substring(0, 500),
    };
  }

  private extractWcagReference(tags: string[]): WCAGReference | undefined {
    const wcagTag = this.parseWcagTags(tags);
    if (!wcagTag) return undefined;

    const principle = wcagTag.criterion.charAt(0);

    return {
      criterion: wcagTag.criterion,
      level: wcagTag.level,
      principle: PRINCIPLE_MAP[principle] ?? 'perceivable',
      version: wcagTag.version,
    };
  }

  private parseWcagTags(tags: string[]): WCAGTagInfo | null {
    const scPattern = /^wcag(\d{3,})$/;
    const levelPattern = /^wcag2\d?(a{1,3})$/;

    let criterion: string | null = null;
    let level: WCAGLevel = 'A';
    let version: '2.0' | '2.1' | '2.2' = '2.0';

    for (const tag of tags) {
      const scMatch = tag.match(scPattern);
      if (scMatch && scMatch[1]) {
        const digits = scMatch[1];
        if (digits.length >= 3) {
          criterion = `${digits[0]}.${digits[1]}.${digits.slice(2)}`;
        }
      }

      const levelMatch = tag.match(levelPattern);
      if (levelMatch && levelMatch[1]) {
        const levelStr = levelMatch[1].toUpperCase();
        if (levelStr === 'A' || levelStr === 'AA' || levelStr === 'AAA') {
          level = levelStr;
        }
      }

      if (tag.includes('21')) version = '2.1';
      if (tag.includes('22')) version = '2.2';
    }

    if (!criterion) return null;

    return { criterion, level, version };
  }

  private extractSuggestedActions(node: NodeResult): string[] {
    const actions: string[] = [];

    for (const check of node.any ?? []) {
      if (check.message) {
        actions.push(check.message);
      }
    }

    for (const check of node.all ?? []) {
      if (check.message) {
        actions.push(check.message);
      }
    }

    for (const check of node.none ?? []) {
      if (check.message) {
        actions.push(`Avoid: ${check.message}`);
      }
    }

    return actions;
  }

  private inferAffectedUsers(
    result: AxeResult
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

    const tags = result.tags.join(' ').toLowerCase();
    const id = result.id.toLowerCase();

    if (
      tags.includes('aria') ||
      id.includes('aria') ||
      id.includes('label') ||
      id.includes('alt')
    ) {
      users.add('screen-reader');
    }

    if (id.includes('keyboard') || id.includes('focus') || id.includes('tabindex')) {
      users.add('keyboard-only');
      users.add('motor-impaired');
    }

    if (id.includes('color') || id.includes('contrast')) {
      users.add('low-vision');
      users.add('color-blind');
    }

    if (id.includes('heading') || id.includes('landmark') || id.includes('link')) {
      users.add('screen-reader');
      users.add('cognitive');
    }

    if (users.size === 0) {
      users.add('screen-reader');
    }

    return Array.from(users);
  }

  private buildSuccessResult(
    target: string,
    issues: AccessibilityIssue[],
    axeResults: AxeResults,
    duration: number
  ): AnalysisResult {
    const summary = this.calculateSummary(issues);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      target,
      tool: 'axe-core',
      issues,
      summary,
      metadata: {
        toolVersion: axeResults.testEngine?.version,
        browserInfo: axeResults.testEnvironment?.userAgent,
        pageTitle: axeResults.url,
      },
    };
  }

  private buildErrorResult(target: string, error: unknown, duration: number): AnalysisResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      duration,
      target,
      tool: 'axe-core',
      issues: [],
      summary: {
        total: 0,
        bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 },
      },
      error: errorMessage,
    };
  }

  private calculateSummary(issues: AccessibilityIssue[]): AnalysisResult['summary'] {
    const bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    const byPrinciple = { perceivable: 0, operable: 0, understandable: 0, robust: 0 };
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
    };
  }
}
