import { describe, it, expect } from 'vitest';
import {
  buildAnalysisTarget,
  buildAnalysisOptions,
  formatOutput,
} from '../../../../src/tools/Lighthouse/utils/lighthouse.utils.js';
import type { LighthouseToolInput } from '../../../../src/tools/Lighthouse/types/index.js';
import type { AnalysisResult } from '../../../../src/shared/types/accessibility.js';

describe('buildAnalysisTarget', () => {
  it('should create URL target with all browser options mapped correctly', () => {
    const input: LighthouseToolInput = {
      url: 'https://example.com',
      options: {
        wcagLevel: 'AA',
        browser: {
          waitForSelector: '#main',
          waitForTimeout: 5000,
          viewport: { width: 1920, height: 1080 },
          ignoreHTTPSErrors: true,
        },
      },
    };

    const target = buildAnalysisTarget(input);

    expect(target.type).toBe('url');
    expect(target.value).toBe('https://example.com');
    expect(target.options?.waitForSelector).toBe('#main');
    expect(target.options?.timeout).toBe(5000);
    expect(target.options?.viewport).toEqual({ width: 1920, height: 1080 });
    expect(target.options?.ignoreHTTPSErrors).toBe(true);
  });

  it('should handle missing options gracefully', () => {
    const target = buildAnalysisTarget({ url: 'https://example.com' });

    expect(target.type).toBe('url');
    expect(target.options?.waitForSelector).toBeUndefined();
    expect(target.options?.timeout).toBeUndefined();
    expect(target.options?.viewport).toBeUndefined();
  });
});

describe('buildAnalysisOptions', () => {
  it('should default to wcagLevel AA with includeWarnings false', () => {
    const options = buildAnalysisOptions({ url: 'https://example.com' });
    expect(options.wcagLevel).toBe('AA');
    expect(options.includeWarnings).toBe(false);
  });

  it('should use provided wcagLevel', () => {
    const options = buildAnalysisOptions({ url: 'https://example.com', options: { wcagLevel: 'AAA' } });
    expect(options.wcagLevel).toBe('AAA');
  });
});

describe('formatOutput', () => {
  const baseResult: AnalysisResult = {
    success: true,
    timestamp: '2026-02-10T12:00:00.000Z',
    duration: 5000,
    target: 'https://example.com',
    tool: 'lighthouse',
    issues: [
      { id: 'lh-0', ruleId: 'image-alt', tool: 'lighthouse', severity: 'serious', location: { selector: 'img' }, message: 'Missing alt' },
      { id: 'lh-1', ruleId: 'color-contrast', tool: 'lighthouse', severity: 'critical', location: {}, message: 'Low contrast' },
    ],
    summary: { total: 2, bySeverity: { critical: 1, serious: 1, moderate: 0, minor: 0 } },
    metadata: { toolVersion: '13.0.0', browserInfo: 'HeadlessChrome/120.0', pageTitle: 'https://example.com' },
  };

  it('should format successful result with all fields', () => {
    const output = formatOutput(baseResult);

    expect(output.success).toBe(true);
    expect(output.target).toBe('https://example.com');
    expect(output.issueCount).toBe(2);
    expect(output.issues).toHaveLength(2);
    expect(output.duration).toBe(5000);
    expect(output.metadata?.toolVersion).toBe('13.0.0');
    expect(output.accessibilityScore).toBe(0);
  });

  it('should extract accessibilityScore from summary when present', () => {
    const resultWithScore: AnalysisResult = {
      ...baseResult,
      summary: { ...baseResult.summary, accessibilityScore: 85 } as AnalysisResult['summary'] & { accessibilityScore: number },
    };
    expect(formatOutput(resultWithScore).accessibilityScore).toBe(85);
  });

  it('should format error result correctly', () => {
    const errorResult: AnalysisResult = {
      success: false, timestamp: '2026-02-10T12:00:00.000Z', duration: 100,
      target: 'https://example.com', tool: 'lighthouse', issues: [],
      summary: { total: 0, bySeverity: { critical: 0, serious: 0, moderate: 0, minor: 0 } },
      error: 'Lighthouse returned no results',
    };

    const output = formatOutput(errorResult);
    expect(output.success).toBe(false);
    expect(output.issueCount).toBe(0);
    expect(output.error).toBe('Lighthouse returned no results');
    expect(output.accessibilityScore).toBe(0);
    expect(output.metadata).toBeUndefined();
  });
});
