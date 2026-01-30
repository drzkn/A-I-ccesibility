import type { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import type { AnalysisTarget } from '@/shared/types/analysis.js';
import type { Severity, WCAGReference, IssueLocation } from '@/shared/types/accessibility.js';
import { createAdapterLogger } from '@/shared/utils/logger.js';
import type {
  ContrastAnalysisResult,
  ContrastIssue,
  ContrastWCAGLevel,
  ContrastData,
  SuggestedFix,
  RGB,
} from '../types/index.js';
import {
  parseColor,
  getContrastRatio,
  isLargeText,
  meetsWCAG,
  getRequiredRatio,
  suggestFixedColor,
  rgbToHex,
} from '../utils/index.js';

export interface ContrastAdapterConfig {
  timeout?: number;
  headless?: boolean;
  browserArgs?: string[];
  ignoreHTTPSErrors?: boolean;
}

export interface ContrastAdapterOptions {
  wcagLevel?: ContrastWCAGLevel;
  suggestFixes?: boolean;
  includePassingElements?: boolean;
  selector?: string;
}

interface ExtractedElement {
  selector: string;
  snippet: string;
  foreground: string;
  background: string;
  fontSize: number;
  fontWeight: number;
  hasText: boolean;
}

export class ContrastAdapter {
  readonly name = 'contrast-analyzer';
  readonly version = '1.0.0';

  private browser: Browser | null = null;
  private config: ContrastAdapterConfig;
  private logger: ReturnType<typeof createAdapterLogger>;

  constructor(config: ContrastAdapterConfig = {}) {
    this.config = {
      timeout: 30000,
      headless: true,
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      ...config,
    };
    this.logger = createAdapterLogger('ContrastAdapter');
  }

  async analyze(
    target: AnalysisTarget,
    options?: ContrastAdapterOptions
  ): Promise<ContrastAnalysisResult> {
    const startTime = Date.now();
    let page: Page | null = null;

    const wcagLevel = options?.wcagLevel ?? 'AA';
    const suggestFixes = options?.suggestFixes ?? true;
    const includePassingElements = options?.includePassingElements ?? false;
    const selector = options?.selector;

    try {
      this.logger.info('Starting contrast analysis', { target: target.value });

      await this.ensureBrowser();
      page = await this.browser!.newPage();

      if (target.options?.viewport) {
        await page.setViewport(target.options.viewport);
      }

      await this.loadTarget(page, target);

      const extractedElements = await this.extractColorData(page, selector);
      const { issues, passingCount, failingCount, normalText, largeText } =
        this.analyzeContrast(extractedElements, wcagLevel, suggestFixes, includePassingElements);

      const duration = Date.now() - startTime;
      this.logger.info('Contrast analysis completed', {
        issueCount: issues.length,
        passingCount,
        failingCount,
        duration,
      });

      return this.buildSuccessResult(
        target.value,
        wcagLevel,
        issues,
        passingCount + failingCount,
        passingCount,
        failingCount,
        normalText,
        largeText,
        duration
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Contrast analysis failed', { error: error as Error, target: target.value });

      return this.buildErrorResult(target.value, wcagLevel, error, duration);
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
  }

  private async ensureBrowser(): Promise<void> {
    if (!this.browser || !this.browser.connected) {
      this.logger.debug('Launching browser', {
        ignoreHTTPSErrors: this.config.ignoreHTTPSErrors,
      });

      const baseArgs = this.config.browserArgs ?? ['--no-sandbox', '--disable-setuid-sandbox'];
      const sslArgs = this.config.ignoreHTTPSErrors
        ? ['--ignore-certificate-errors', '--ignore-ssl-errors', '--allow-running-insecure-content']
        : [];

      this.browser = await puppeteer.launch({
        headless: this.config.headless ?? true,
        args: [...baseArgs, ...sslArgs],
        acceptInsecureCerts: this.config.ignoreHTTPSErrors ?? false,
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

  private async extractColorData(page: Page, selector?: string): Promise<ExtractedElement[]> {
    return await page.evaluate((scopeSelector?: string) => {
      const results: ExtractedElement[] = [];

      function isVisible(el: Element): boolean {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function getEffectiveBackground(el: Element): string {
        let current: Element | null = el;

        while (current) {
          const style = window.getComputedStyle(current);
          const bg = style.backgroundColor;

          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return bg;
          }

          current = current.parentElement;
        }

        return 'rgb(255, 255, 255)';
      }

      function getSelector(el: Element): string {
        if (el.id) {
          return `#${el.id}`;
        }
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.trim().split(/\s+/).join('.');
          if (classes) {
            return `${el.tagName.toLowerCase()}.${classes}`;
          }
        }
        return el.tagName.toLowerCase();
      }

      function hasDirectText(el: Element): boolean {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            return true;
          }
        }
        return false;
      }

      const rootElement = scopeSelector ? document.querySelector(scopeSelector) : document.body;
      if (!rootElement) return results;

      const elements = rootElement.querySelectorAll('*');

      for (const el of elements) {
        if (!isVisible(el) || !hasDirectText(el)) continue;

        const tagName = el.tagName.toLowerCase();
        if (['script', 'style', 'noscript', 'svg', 'path'].includes(tagName)) continue;

        const style = window.getComputedStyle(el);
        const fg = style.color;
        const bg = getEffectiveBackground(el);
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight, 10) || 400;

        results.push({
          selector: getSelector(el),
          snippet: (el as HTMLElement).outerHTML?.substring(0, 300) ?? '',
          foreground: fg,
          background: bg,
          fontSize,
          fontWeight,
          hasText: true,
        });
      }

      return results;
    }, selector);
  }

  private analyzeContrast(
    elements: ExtractedElement[],
    wcagLevel: ContrastWCAGLevel,
    suggestFixes: boolean,
    includePassingElements: boolean
  ): {
    issues: ContrastIssue[];
    passingCount: number;
    failingCount: number;
    normalText: { passing: number; failing: number };
    largeText: { passing: number; failing: number };
  } {
    const issues: ContrastIssue[] = [];
    let passingCount = 0;
    let failingCount = 0;
    const normalText = { passing: 0, failing: 0 };
    const largeText = { passing: 0, failing: 0 };

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]!;

      const fgRgb = parseColor(element.foreground);
      const bgRgb = parseColor(element.background);

      if (!fgRgb || !bgRgb) {
        this.logger.debug('Could not parse colors', {
          selector: element.selector,
          fg: element.foreground,
          bg: element.background,
        });
        continue;
      }

      const ratio = getContrastRatio(fgRgb, bgRgb);
      const isLarge = isLargeText(element.fontSize, element.fontWeight);
      const requiredRatio = getRequiredRatio(wcagLevel, isLarge);
      const passes = meetsWCAG(ratio, wcagLevel, isLarge);

      if (isLarge) {
        if (passes) {
          largeText.passing++;
        } else {
          largeText.failing++;
        }
      } else {
        if (passes) {
          normalText.passing++;
        } else {
          normalText.failing++;
        }
      }

      if (passes) {
        passingCount++;
        if (!includePassingElements) continue;
      } else {
        failingCount++;
      }

      const contrastData: ContrastData = {
        foreground: element.foreground,
        background: element.background,
        currentRatio: Math.round(ratio * 100) / 100,
        requiredRatio,
        isLargeText: isLarge,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
      };

      if (!passes && suggestFixes) {
        contrastData.suggestedFix = this.generateSuggestedFix(fgRgb, bgRgb, requiredRatio);
      }

      const issue = this.createContrastIssue(
        i,
        element,
        contrastData,
        wcagLevel,
        passes
      );

      issues.push(issue);
    }

    return { issues, passingCount, failingCount, normalText, largeText };
  }

  private generateSuggestedFix(
    fgRgb: RGB,
    bgRgb: RGB,
    targetRatio: number
  ): SuggestedFix {
    const fixedFg = suggestFixedColor(fgRgb, bgRgb, targetRatio);
    const newRatio = getContrastRatio(fixedFg, bgRgb);

    return {
      foreground: rgbToHex(fixedFg),
      background: rgbToHex(bgRgb),
      newRatio: Math.round(newRatio * 100) / 100,
    };
  }

  private createContrastIssue(
    index: number,
    element: ExtractedElement,
    contrastData: ContrastData,
    wcagLevel: ContrastWCAGLevel,
    passes: boolean
  ): ContrastIssue {
    const severity = this.determineSeverity(contrastData.currentRatio, contrastData.requiredRatio);
    const criterion = wcagLevel === 'AAA' ? '1.4.6' : '1.4.3';

    const location: IssueLocation = {
      selector: element.selector,
      snippet: element.snippet,
    };

    const wcag: WCAGReference = {
      criterion,
      level: wcagLevel === 'AAA' ? 'AAA' : 'AA',
      principle: 'perceivable',
      version: '2.1',
      title: wcagLevel === 'AAA' ? 'Contrast (Enhanced)' : 'Contrast (Minimum)',
    };

    const message = passes
      ? `Contrast ratio ${contrastData.currentRatio}:1 meets ${wcagLevel} requirements (${contrastData.requiredRatio}:1 required for ${contrastData.isLargeText ? 'large' : 'normal'} text)`
      : `Contrast ratio ${contrastData.currentRatio}:1 does not meet ${wcagLevel} requirements (${contrastData.requiredRatio}:1 required for ${contrastData.isLargeText ? 'large' : 'normal'} text)`;

    return {
      id: `contrast-${index}`,
      ruleId: 'color-contrast',
      tool: 'contrast-analyzer',
      severity: passes ? 'minor' : severity,
      wcag,
      location,
      message,
      humanContext: passes
        ? undefined
        : `Users with low vision or color blindness may have difficulty reading this text. The current contrast of ${contrastData.currentRatio}:1 is below the ${wcagLevel} threshold of ${contrastData.requiredRatio}:1.`,
      suggestedActions: passes
        ? undefined
        : [
            `Increase contrast ratio to at least ${contrastData.requiredRatio}:1`,
            contrastData.suggestedFix
              ? `Consider using ${contrastData.suggestedFix.foreground} as the text color`
              : 'Darken the text color or lighten the background',
          ],
      affectedUsers: passes ? undefined : ['low-vision', 'color-blind'],
      confidence: 1,
      contrastData,
    };
  }

  private determineSeverity(currentRatio: number, requiredRatio: number): Severity {
    const deficit = requiredRatio - currentRatio;

    if (deficit >= 3) {
      return 'critical';
    } else if (deficit >= 2) {
      return 'serious';
    } else if (deficit >= 1) {
      return 'moderate';
    }
    return 'minor';
  }

  private buildSuccessResult(
    target: string,
    wcagLevel: ContrastWCAGLevel,
    issues: ContrastIssue[],
    total: number,
    passing: number,
    failing: number,
    normalText: { passing: number; failing: number },
    largeText: { passing: number; failing: number },
    duration: number
  ): ContrastAnalysisResult {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      target,
      wcagLevel,
      issues,
      summary: {
        total,
        passing,
        failing,
        byTextSize: {
          normalText,
          largeText,
        },
      },
    };
  }

  private buildErrorResult(
    target: string,
    wcagLevel: ContrastWCAGLevel,
    error: unknown,
    duration: number
  ): ContrastAnalysisResult {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      duration,
      target,
      wcagLevel,
      issues: [],
      summary: {
        total: 0,
        passing: 0,
        failing: 0,
      },
      error: errorMessage,
    };
  }
}
