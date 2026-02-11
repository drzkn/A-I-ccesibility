import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import type { AnalysisTarget } from '../../../src/shared/types/analysis.js';

const mockBrowser = {
  connected: true,
  wsEndpoint: vi.fn().mockReturnValue('ws://127.0.0.1:9222/devtools'),
  newPage: vi.fn().mockResolvedValue({ goto: vi.fn(), close: vi.fn() }),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('puppeteer', () => ({
  default: { launch: vi.fn().mockResolvedValue(mockBrowser) },
}));

function createMockLighthouseResult(overrides: Record<string, unknown> = {}) {
  return {
    lhr: {
      categories: {
        accessibility: {
          score: 0.85,
          auditRefs: [
            { id: 'image-alt', weight: 10 },
            { id: 'color-contrast', weight: 6 },
            { id: 'document-title', weight: 3 },
            { id: 'passing-audit', weight: 5 },
            { id: 'manual-audit', weight: 0 },
            { id: 'na-audit', weight: 0 },
          ],
        },
      },
      audits: {
        'image-alt': {
          id: 'image-alt',
          title: 'Image elements do not have [alt] attributes',
          description: 'Informative elements should [aim for short, descriptive text](https://example.com).',
          score: 0,
          scoreDisplayMode: 'binary',
          details: {
            items: [
              { node: { selector: 'img.hero', snippet: '<img src="hero.jpg" class="hero">', explanation: 'Fix: add alt attribute' } },
              { node: { selector: 'img.logo', snippet: '<img src="logo.png" class="logo">' } },
            ],
          },
        },
        'color-contrast': {
          id: 'color-contrast',
          title: 'Background and foreground colors do not have a sufficient contrast ratio.',
          description: 'Low contrast text is hard to read. [Learn more](https://example.com).',
          score: 0.3,
          scoreDisplayMode: 'binary',
          details: { items: [{ node: { selector: 'p.light-text', snippet: '<p class="light-text">Low contrast</p>' } }] },
        },
        'document-title': {
          id: 'document-title',
          title: 'Document does not have a <title> element',
          description: 'The title gives screen reader users an overview. [Learn more](https://example.com).',
          score: 0,
          scoreDisplayMode: 'binary',
          details: { items: [] },
        },
        'passing-audit': { id: 'passing-audit', title: 'All elements have valid roles', description: 'Roles are valid.', score: 1, scoreDisplayMode: 'binary' },
        'manual-audit': { id: 'manual-audit', title: 'Manual check needed', description: 'Check this manually.', score: null, scoreDisplayMode: 'manual' },
        'na-audit': { id: 'na-audit', title: 'Not applicable', description: 'N/A', score: null, scoreDisplayMode: 'notApplicable' },
      },
      lighthouseVersion: '13.0.0',
      userAgent: 'HeadlessChrome/120.0.6099.71',
      finalDisplayedUrl: 'https://example.com/',
      ...overrides,
    },
  };
}

const mockLighthouseFn = vi.fn().mockResolvedValue(createMockLighthouseResult());

vi.mock('lighthouse', () => ({ default: mockLighthouseFn }));

const { LighthouseAdapter, createLighthouseAdapter } = await import(
  '../../../src/tools/Lighthouse/adapters/lighthouse.adapter.js'
);

describe('LighthouseAdapter', () => {
  let adapter: InstanceType<typeof LighthouseAdapter>;

  beforeAll(() => {
    adapter = new LighthouseAdapter({ headless: true, timeout: 60000 });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.connected = true;
    mockLighthouseFn.mockResolvedValue(createMockLighthouseResult());
  });

  afterAll(async () => {
    await adapter.dispose();
  });

  it('should have name "lighthouse" and version string', () => {
    expect(adapter.name).toBe('lighthouse');
    expect(typeof adapter.version).toBe('string');
  });

  describe('isAvailable', () => {
    it('should return true when browser launches successfully', async () => {
      expect(await adapter.isAvailable()).toBe(true);
    });

    it('should return false when browser launch fails', async () => {
      const puppeteer = (await import('puppeteer')).default;
      vi.mocked(puppeteer.launch).mockRejectedValueOnce(new Error('Launch failed'));
      mockBrowser.connected = false;

      const failAdapter = new LighthouseAdapter({ headless: true });
      expect(await failAdapter.isAvailable()).toBe(false);
    });
  });

  describe('analyze - target rejection', () => {
    it('should return error for non-URL targets (HTML/file)', async () => {
      for (const target of [
        { type: 'html' as const, value: '<html></html>' },
        { type: 'file' as const, value: '/path/to/file.html' },
      ]) {
        const result = await adapter.analyze(target);

        expect(result.success).toBe(false);
        expect(result.error).toContain('only supports URL');
        expect(result.tool).toBe('lighthouse');
        expect(result.issues).toEqual([]);
        expect(result.duration).toBeGreaterThanOrEqual(0);
        expect(result.timestamp).toBeDefined();
      }
    });
  });

  describe('analyze - successful URL analysis', () => {
    const urlTarget: AnalysisTarget = { type: 'url', value: 'https://example.com' };

    it('should return complete structured result with score, metadata and summary', async () => {
      const result = await adapter.analyze(urlTarget);

      expect(result.success).toBe(true);
      expect(result.tool).toBe('lighthouse');
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
      expect(result.duration).toBeGreaterThanOrEqual(0);

      const summary = result.summary as typeof result.summary & { accessibilityScore?: number };
      expect(summary.accessibilityScore).toBe(85);
      expect(summary.byPrinciple).toBeDefined();
      expect(summary.byRule).toBeDefined();

      const totalBySeverity = Object.values(result.summary.bySeverity).reduce((a, b) => a + b, 0);
      expect(totalBySeverity).toBe(result.summary.total);

      expect(result.metadata?.toolVersion).toBe('13.0.0');
      expect(result.metadata?.browserInfo).toBe('HeadlessChrome/120.0.6099.71');
    });

    it('should call lighthouse with correct flags', async () => {
      await adapter.analyze(urlTarget);

      expect(mockLighthouseFn).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ port: 9222, onlyCategories: ['accessibility'], output: 'json' })
      );
    });

    it('should pass viewport and timeout options to lighthouse', async () => {
      const target: AnalysisTarget = {
        type: 'url',
        value: 'https://example.com',
        options: { viewport: { width: 375, height: 812 }, timeout: 15000 },
      };

      await adapter.analyze(target);

      expect(mockLighthouseFn).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({
          screenEmulation: { width: 375, height: 812, deviceScaleFactor: 1, mobile: false, disabled: false },
          maxWaitForLoad: 15000,
        })
      );
    });
  });

  describe('analyze - result transformation', () => {
    const urlTarget: AnalysisTarget = { type: 'url', value: 'https://example.com' };

    it('should skip passing, manual and not-applicable audits', async () => {
      const result = await adapter.analyze(urlTarget);
      const ruleIds = result.issues.map((i) => i.ruleId);

      expect(ruleIds).not.toContain('passing-audit');
      expect(ruleIds).not.toContain('manual-audit');
      expect(ruleIds).not.toContain('na-audit');
    });

    it('should create one issue per node item and one for empty-items audits', async () => {
      const result = await adapter.analyze(urlTarget);

      expect(result.issues.filter((i) => i.ruleId === 'image-alt')).toHaveLength(2);
      expect(result.issues.filter((i) => i.ruleId === 'document-title')).toHaveLength(1);
    });

    it('should map severity based on audit score', async () => {
      const result = await adapter.analyze(urlTarget);

      const imageAlt = result.issues.find((i) => i.ruleId === 'image-alt');
      expect(imageAlt?.severity).toBe('critical'); // score 0

      const contrast = result.issues.find((i) => i.ruleId === 'color-contrast');
      expect(contrast?.severity).toBe('serious'); // score 0.3
    });

    it('should map moderate and minor severity levels', async () => {
      mockLighthouseFn.mockResolvedValueOnce(createMockLighthouseResult({
        audits: {
          'mod': { id: 'mod', title: 'Mod', description: 'T', score: 0.6, scoreDisplayMode: 'binary', details: { items: [{ node: { selector: 'a' } }] } },
          'min': { id: 'min', title: 'Min', description: 'T', score: 0.9, scoreDisplayMode: 'binary', details: { items: [{ node: { selector: 'b' } }] } },
        },
        categories: { accessibility: { score: 0.8, auditRefs: [{ id: 'mod', weight: 5 }, { id: 'min', weight: 5 }] } },
      }));

      const result = await adapter.analyze(urlTarget);
      expect(result.issues.find((i) => i.ruleId === 'mod')?.severity).toBe('moderate');
      expect(result.issues.find((i) => i.ruleId === 'min')?.severity).toBe('minor');
    });

    it('should map WCAG references for known audits and undefined for unknown', async () => {
      const result = await adapter.analyze(urlTarget);

      const imageAlt = result.issues.find((i) => i.ruleId === 'image-alt');
      expect(imageAlt?.wcag).toEqual(
        expect.objectContaining({ criterion: '1.1.1', level: 'A', principle: 'perceivable', version: '2.1' })
      );

      const contrast = result.issues.find((i) => i.ruleId === 'color-contrast');
      expect(contrast?.wcag?.criterion).toBe('1.4.3');
    });

    it('should populate issue fields correctly (location, affectedUsers, confidence, humanContext, suggestedActions)', async () => {
      const result = await adapter.analyze(urlTarget);

      const heroImage = result.issues.find((i) => i.ruleId === 'image-alt' && i.location.selector === 'img.hero');
      expect(heroImage?.id).toMatch(/^lighthouse-/);
      expect(heroImage?.tool).toBe('lighthouse');
      expect(heroImage?.location.snippet).toContain('<img');
      expect(heroImage?.affectedUsers).toContain('screen-reader');
      expect(heroImage?.confidence).toBe(1); // 1 - score(0)
      expect(heroImage?.humanContext).not.toContain('[');
      expect(heroImage?.humanContext).not.toContain('](');
      expect(heroImage?.suggestedActions).toContain('Fix: add alt attribute');
      expect(heroImage?.rawResult).toBeDefined();

      const titleIssue = result.issues.find((i) => i.ruleId === 'document-title');
      expect(titleIssue?.location).toEqual({});
      expect(titleIssue?.affectedUsers).toContain('cognitive');

      const contrastIssue = result.issues.find((i) => i.ruleId === 'color-contrast');
      expect(contrastIssue?.affectedUsers).toContain('low-vision');
      expect(contrastIssue?.affectedUsers).toContain('color-blind');
      expect(contrastIssue?.confidence).toBeCloseTo(0.7, 5);
    });
  });

  describe('analyze - error handling', () => {
    const urlTarget: AnalysisTarget = { type: 'url', value: 'https://example.com' };

    it('should return error result when lighthouse returns null or throws', async () => {
      for (const mockValue of [
        () => mockLighthouseFn.mockResolvedValueOnce(null),
        () => mockLighthouseFn.mockResolvedValueOnce({ lhr: undefined }),
        () => mockLighthouseFn.mockRejectedValueOnce(new Error('Navigation timeout')),
      ]) {
        mockValue();
        const result = await adapter.analyze(urlTarget);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.tool).toBe('lighthouse');
        expect(result.issues).toEqual([]);
        expect(result.duration).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle non-Error throws', async () => {
      mockLighthouseFn.mockRejectedValueOnce('string error');
      const result = await adapter.analyze(urlTarget);
      expect(result.error).toBe('string error');
    });
  });

  describe('analyze - edge cases', () => {
    const urlTarget: AnalysisTarget = { type: 'url', value: 'https://example.com' };

    it('should handle missing accessibility category score', async () => {
      mockLighthouseFn.mockResolvedValueOnce({
        lhr: { categories: { accessibility: { score: null, auditRefs: [] } }, audits: {}, lighthouseVersion: '13.0.0' },
      });

      const result = await adapter.analyze(urlTarget);
      expect(result.success).toBe(true);
      expect(result.issues).toEqual([]);

      const summary = result.summary as typeof result.summary & { accessibilityScore?: number };
      expect(summary.accessibilityScore).toBe(0);
    });

    it('should truncate long snippets to 500 characters', async () => {
      mockLighthouseFn.mockResolvedValueOnce(createMockLighthouseResult({
        audits: {
          'long': { id: 'long', title: 'T', description: 'D', score: 0, scoreDisplayMode: 'binary',
            details: { items: [{ node: { selector: 'div', snippet: '<div>' + 'a'.repeat(600) + '</div>' } }] } },
        },
        categories: { accessibility: { score: 0.5, auditRefs: [{ id: 'long', weight: 5 }] } },
      }));

      const result = await adapter.analyze(urlTarget);
      expect(result.issues[0]?.location.snippet?.length).toBeLessThanOrEqual(500);
    });

    it('should handle items without node property', async () => {
      mockLighthouseFn.mockResolvedValueOnce(createMockLighthouseResult({
        audits: {
          'no-node': { id: 'no-node', title: 'T', description: 'D', score: 0, scoreDisplayMode: 'binary',
            details: { items: [{ someOtherProp: 'value' }] } },
        },
        categories: { accessibility: { score: 0.5, auditRefs: [{ id: 'no-node', weight: 5 }] } },
      }));

      const result = await adapter.analyze(urlTarget);
      expect(result.issues[0]?.location).toEqual({});
    });
  });

  describe('dispose', () => {
    it('should close browser and allow reinitialization', async () => {
      const localAdapter = new LighthouseAdapter({ headless: true });
      expect(await localAdapter.isAvailable()).toBe(true);

      await localAdapter.dispose();
      expect(mockBrowser.close).toHaveBeenCalled();

      mockBrowser.connected = false;
      expect(await localAdapter.isAvailable()).toBe(true);

      await localAdapter.dispose();
    });
  });

  it('createLighthouseAdapter should return a valid adapter', () => {
    const a = createLighthouseAdapter({ headless: true });
    expect(a.name).toBe('lighthouse');
  });
});
