import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ContrastAdapter } from '../../src/adapters/contrast.js';
import { fixtures } from '../fixtures/html-fixtures.js';
import {
  parseColor,
  getContrastRatio,
  getLuminance,
  meetsWCAG,
  isLargeText,
  getRequiredRatio,
  getWCAGContrastResult,
  suggestFixedColor,
} from '../../src/utils/color-analysis/index.js';
import { rgbToHex, rgbToHsl, hslToRgb } from '../../src/utils/color-analysis/converters.js';
import type { AnalysisTarget } from '../../src/types/analysis.js';
import type { RGB } from '../../src/types/color-analysis.js';

describe('Color Analysis Utilities', () => {
  describe('parseColor', () => {
    describe('hex colors', () => {
      it('should parse 6-digit hex colors', () => {
        expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('#00ff00')).toEqual({ r: 0, g: 255, b: 0 });
        expect(parseColor('#0000ff')).toEqual({ r: 0, g: 0, b: 255 });
        expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
        expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      });

      it('should parse 3-digit hex colors', () => {
        expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
        expect(parseColor('#00f')).toEqual({ r: 0, g: 0, b: 255 });
        expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
        expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
      });

      it('should parse 8-digit hex colors (with alpha)', () => {
        expect(parseColor('#ff0000ff')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('#00ff0080')).toEqual({ r: 0, g: 255, b: 0 });
      });

      it('should be case insensitive', () => {
        expect(parseColor('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('#Ff0000')).toEqual({ r: 255, g: 0, b: 0 });
      });
    });

    describe('rgb colors', () => {
      it('should parse rgb() format', () => {
        expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('rgb(0, 255, 0)')).toEqual({ r: 0, g: 255, b: 0 });
        expect(parseColor('rgb(0, 0, 255)')).toEqual({ r: 0, g: 0, b: 255 });
      });

      it('should parse rgba() format', () => {
        expect(parseColor('rgba(255, 0, 0, 1)')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('rgba(0, 128, 255, 0.5)')).toEqual({ r: 0, g: 128, b: 255 });
      });

      it('should handle various spacing', () => {
        expect(parseColor('rgb(255,0,0)')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('rgb( 255 , 0 , 0 )')).toEqual({ r: 255, g: 0, b: 0 });
      });
    });

    describe('hsl colors', () => {
      it('should parse hsl() format', () => {
        const red = parseColor('hsl(0, 100%, 50%)');
        expect(red).toBeDefined();
        expect(red!.r).toBe(255);
        expect(red!.g).toBe(0);
        expect(red!.b).toBe(0);
      });

      it('should parse hsla() format', () => {
        const result = parseColor('hsla(120, 100%, 50%, 0.5)');
        expect(result).toBeDefined();
        expect(result!.g).toBe(255);
      });
    });

    describe('named colors', () => {
      it('should parse common named colors', () => {
        expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
        expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
        expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
        expect(parseColor('blue')).toEqual({ r: 0, g: 0, b: 255 });
      });

      it('should be case insensitive', () => {
        expect(parseColor('BLACK')).toEqual({ r: 0, g: 0, b: 0 });
        expect(parseColor('White')).toEqual({ r: 255, g: 255, b: 255 });
      });
    });

    describe('invalid colors', () => {
      it('should return null for invalid formats', () => {
        expect(parseColor('')).toBeNull();
        expect(parseColor('invalid')).toBeNull();
        expect(parseColor('#gg0000')).toBeNull();
        expect(parseColor('#12345')).toBeNull();
      });

      it('should return null for null/undefined input', () => {
        expect(parseColor(null as unknown as string)).toBeNull();
        expect(parseColor(undefined as unknown as string)).toBeNull();
      });
    });
  });

  describe('getLuminance', () => {
    it('should return 1 for white', () => {
      expect(getLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
    });

    it('should return 0 for black', () => {
      expect(getLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
    });

    it('should return intermediate values for gray colors', () => {
      const gray = getLuminance({ r: 128, g: 128, b: 128 });
      expect(gray).toBeGreaterThan(0);
      expect(gray).toBeLessThan(1);
    });

    it('should weight green more heavily than red and blue', () => {
      const redLum = getLuminance({ r: 255, g: 0, b: 0 });
      const greenLum = getLuminance({ r: 0, g: 255, b: 0 });
      const blueLum = getLuminance({ r: 0, g: 0, b: 255 });

      expect(greenLum).toBeGreaterThan(redLum);
      expect(greenLum).toBeGreaterThan(blueLum);
      expect(redLum).toBeGreaterThan(blueLum);
    });
  });

  describe('getContrastRatio', () => {
    it('should return 21 for black on white', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      expect(getContrastRatio(black, white)).toBeCloseTo(21, 0);
    });

    it('should return 21 for white on black', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      expect(getContrastRatio(white, black)).toBeCloseTo(21, 0);
    });

    it('should return 1 for same colors', () => {
      const gray: RGB = { r: 128, g: 128, b: 128 };
      expect(getContrastRatio(gray, gray)).toBe(1);
    });

    it('should calculate known contrast ratios correctly', () => {
      const darkGray: RGB = { r: 85, g: 85, b: 85 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const ratio = getContrastRatio(darkGray, white);
      expect(ratio).toBeGreaterThan(4.5);
    });

    it('should be symmetric', () => {
      const color1: RGB = { r: 100, g: 50, b: 200 };
      const color2: RGB = { r: 200, g: 150, b: 50 };
      expect(getContrastRatio(color1, color2)).toBe(getContrastRatio(color2, color1));
    });
  });

  describe('meetsWCAG', () => {
    describe('AA level', () => {
      it('should require 4.5:1 for normal text', () => {
        expect(meetsWCAG(4.5, 'AA', false)).toBe(true);
        expect(meetsWCAG(4.49, 'AA', false)).toBe(false);
      });

      it('should require 3:1 for large text', () => {
        expect(meetsWCAG(3.0, 'AA', true)).toBe(true);
        expect(meetsWCAG(2.99, 'AA', true)).toBe(false);
      });
    });

    describe('AAA level', () => {
      it('should require 7:1 for normal text', () => {
        expect(meetsWCAG(7.0, 'AAA', false)).toBe(true);
        expect(meetsWCAG(6.99, 'AAA', false)).toBe(false);
      });

      it('should require 4.5:1 for large text', () => {
        expect(meetsWCAG(4.5, 'AAA', true)).toBe(true);
        expect(meetsWCAG(4.49, 'AAA', true)).toBe(false);
      });
    });
  });

  describe('isLargeText', () => {
    it('should return true for text >= 24px (normal weight)', () => {
      expect(isLargeText(24, 400)).toBe(true);
      expect(isLargeText(25, 400)).toBe(true);
      expect(isLargeText(23.9, 400)).toBe(false);
    });

    it('should return true for text >= 18.5px (bold weight)', () => {
      expect(isLargeText(18.5, 700)).toBe(true);
      expect(isLargeText(19, 700)).toBe(true);
      expect(isLargeText(18.4, 700)).toBe(false);
    });

    it('should consider weight >= 700 as bold', () => {
      expect(isLargeText(18.5, 700)).toBe(true);
      expect(isLargeText(18.5, 800)).toBe(true);
      expect(isLargeText(18.5, 699)).toBe(false);
    });

    it('should return false for regular text sizes', () => {
      expect(isLargeText(16, 400)).toBe(false);
      expect(isLargeText(14, 400)).toBe(false);
      expect(isLargeText(18, 400)).toBe(false);
    });
  });

  describe('getRequiredRatio', () => {
    it('should return correct thresholds for AA', () => {
      expect(getRequiredRatio('AA', false)).toBe(4.5);
      expect(getRequiredRatio('AA', true)).toBe(3.0);
    });

    it('should return correct thresholds for AAA', () => {
      expect(getRequiredRatio('AAA', false)).toBe(7.0);
      expect(getRequiredRatio('AAA', true)).toBe(4.5);
    });
  });

  describe('getWCAGContrastResult', () => {
    it('should return complete WCAG analysis for max contrast', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const result = getWCAGContrastResult(black, white);

      expect(result.ratio).toBeCloseTo(21, 0);
      expect(result.meetsAA).toBe(true);
      expect(result.meetsAAA).toBe(true);
      expect(result.meetsAALargeText).toBe(true);
      expect(result.meetsAAALargeText).toBe(true);
    });

    it('should return false for low contrast colors', () => {
      const lightGray: RGB = { r: 200, g: 200, b: 200 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const result = getWCAGContrastResult(lightGray, white);

      expect(result.ratio).toBeLessThan(4.5);
      expect(result.meetsAA).toBe(false);
      expect(result.meetsAAA).toBe(false);
    });
  });

  describe('suggestFixedColor', () => {
    it('should suggest a color that meets the target ratio', () => {
      const lightGray: RGB = { r: 150, g: 150, b: 150 };
      const white: RGB = { r: 255, g: 255, b: 255 };
      const targetRatio = 4.5;

      const fixed = suggestFixedColor(lightGray, white, targetRatio);
      const newRatio = getContrastRatio(fixed, white);

      expect(newRatio).toBeGreaterThanOrEqual(targetRatio - 0.1);
    });

    it('should darken light text on light background', () => {
      const lightGray: RGB = { r: 200, g: 200, b: 200 };
      const white: RGB = { r: 255, g: 255, b: 255 };

      const fixed = suggestFixedColor(lightGray, white, 4.5);
      const fixedLuminance = getLuminance(fixed);
      const originalLuminance = getLuminance(lightGray);

      expect(fixedLuminance).toBeLessThan(originalLuminance);
    });

    it('should work for colors that already meet the ratio', () => {
      const black: RGB = { r: 0, g: 0, b: 0 };
      const white: RGB = { r: 255, g: 255, b: 255 };

      const fixed = suggestFixedColor(black, white, 4.5);
      expect(fixed).toBeDefined();
    });
  });

  describe('Color Converters', () => {
    describe('rgbToHex', () => {
      it('should convert RGB to hex correctly', () => {
        expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
        expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
        expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
        expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
        expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
      });

      it('should pad single digit hex values', () => {
        expect(rgbToHex({ r: 0, g: 15, b: 0 })).toBe('#000f00');
      });
    });

    describe('rgbToHsl and hslToRgb', () => {
      it('should convert RGB to HSL and back', () => {
        const original: RGB = { r: 255, g: 0, b: 0 };
        const hsl = rgbToHsl(original);
        const back = hslToRgb(hsl);

        expect(back.r).toBeCloseTo(original.r, 0);
        expect(back.g).toBeCloseTo(original.g, 0);
        expect(back.b).toBeCloseTo(original.b, 0);
      });

      it('should handle grayscale colors', () => {
        const gray: RGB = { r: 128, g: 128, b: 128 };
        const hsl = rgbToHsl(gray);
        expect(hsl.s).toBe(0);
      });
    });
  });
});

describe('ContrastAdapter', () => {
  let adapter: ContrastAdapter;
  let browserAvailable = false;

  beforeAll(async () => {
    adapter = new ContrastAdapter({
      headless: true,
      timeout: 30000,
    });
    browserAvailable = await adapter.isAvailable();
  });

  afterAll(async () => {
    await adapter.dispose();
  });

  describe('isAvailable', () => {
    it('should return a boolean indicating browser availability', async () => {
      const available = await adapter.isAvailable();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('analyze', () => {
    describe('with valid HTML', () => {
      it('should return success with no contrast issues', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues).toBeDefined();
        expect(Array.isArray(result.issues)).toBe(true);
        expect(result.summary).toBeDefined();
        expect(result.wcagLevel).toBe('AA');
      });
    });

    describe('with low contrast HTML', () => {
      it('should detect contrast issues', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.summary.failing).toBeGreaterThan(0);

        const failingIssues = result.issues.filter(
          (i) => i.contrastData.currentRatio < i.contrastData.requiredRatio
        );
        expect(failingIssues.length).toBeGreaterThan(0);
      });

      it('should include contrast data in issues', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);
        const issue = result.issues[0];

        expect(issue).toBeDefined();
        expect(issue!.contrastData).toBeDefined();
        expect(issue!.contrastData.foreground).toBeDefined();
        expect(issue!.contrastData.background).toBeDefined();
        expect(issue!.contrastData.currentRatio).toBeDefined();
        expect(issue!.contrastData.requiredRatio).toBeDefined();
        expect(typeof issue!.contrastData.isLargeText).toBe('boolean');
      });

      it('should suggest color fixes for failing elements', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target, { suggestFixes: true });

        const failingIssues = result.issues.filter(
          (i) => i.contrastData.currentRatio < i.contrastData.requiredRatio
        );

        if (failingIssues.length > 0) {
          const issueWithFix = failingIssues.find((i) => i.contrastData.suggestedFix);
          if (issueWithFix) {
            expect(issueWithFix.contrastData.suggestedFix).toBeDefined();
            expect(issueWithFix.contrastData.suggestedFix!.foreground).toBeDefined();
            expect(issueWithFix.contrastData.suggestedFix!.newRatio).toBeGreaterThanOrEqual(
              issueWithFix.contrastData.requiredRatio
            );
          }
        }
      });
    });

    describe('with custom low contrast HTML', () => {
      const customLowContrastHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Custom Low Contrast</title>
          <style>
            .very-low { color: #ccc; background-color: #ddd; }
            .normal { color: #333; background-color: #fff; }
            .large-text { font-size: 24px; color: #888; background-color: #fff; }
            .bold-large { font-size: 18.5px; font-weight: 700; color: #888; background-color: #fff; }
          </style>
        </head>
        <body>
          <p class="very-low">This text has very low contrast</p>
          <p class="normal">This text has good contrast</p>
          <p class="large-text">This is large text with moderate contrast</p>
          <p class="bold-large">This is bold large text</p>
        </body>
        </html>
      `;

      it('should detect very low contrast text', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: customLowContrastHtml,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.summary.failing).toBeGreaterThan(0);
      });

      it('should distinguish between large and normal text', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: customLowContrastHtml,
        };

        const result = await adapter.analyze(target, { includePassingElements: true });

        const normalTextIssues = result.issues.filter((i) => !i.contrastData.isLargeText);
        const largeTextIssues = result.issues.filter((i) => i.contrastData.isLargeText);

        expect(normalTextIssues.length).toBeGreaterThan(0);
        expect(largeTextIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with WCAG level options', () => {
      const moderateContrastHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Moderate Contrast</title>
          <style>
            .moderate { color: #595959; background-color: #fff; }
          </style>
        </head>
        <body>
          <p class="moderate">This text has moderate contrast (around 5:1)</p>
        </body>
        </html>
      `;

      it('should pass AA for moderate contrast', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: moderateContrastHtml,
        };

        const result = await adapter.analyze(target, { wcagLevel: 'AA' });

        expect(result.success).toBe(true);
        expect(result.wcagLevel).toBe('AA');
      });
    });

    describe('issue structure', () => {
      it('should have correct issue structure with all required fields', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);
        const issue = result.issues[0];

        expect(issue).toBeDefined();
        expect(issue!.id).toBeDefined();
        expect(issue!.ruleId).toBe('color-contrast');
        expect(issue!.tool).toBe('contrast-analyzer');
        expect(['critical', 'serious', 'moderate', 'minor']).toContain(issue!.severity);
        expect(issue!.location).toBeDefined();
        expect(issue!.location.selector).toBeDefined();
        expect(issue!.message).toBeDefined();
      });

      it('should include WCAG reference', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);
        const issue = result.issues[0];

        expect(issue!.wcag).toBeDefined();
        expect(['1.4.3', '1.4.6']).toContain(issue!.wcag!.criterion);
        expect(['AA', 'AAA']).toContain(issue!.wcag!.level);
        expect(issue!.wcag!.principle).toBe('perceivable');
      });

      it('should include human context for failing elements', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);
        const failingIssue = result.issues.find(
          (i) => i.contrastData.currentRatio < i.contrastData.requiredRatio
        );

        if (failingIssue) {
          expect(failingIssue.humanContext).toBeDefined();
          expect(failingIssue.affectedUsers).toBeDefined();
          expect(failingIssue.affectedUsers).toContain('low-vision');
        }
      });
    });

    describe('metadata and summary', () => {
      it('should include correct metadata', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target);

        expect(result.timestamp).toBeDefined();
        expect(result.duration).toBeDefined();
        expect(result.duration).toBeGreaterThan(0);
        expect(result.target).toBeDefined();
      });

      it('should include text size statistics in summary', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.lowContrast,
        };

        const result = await adapter.analyze(target);

        expect(result.summary.total).toBeDefined();
        expect(result.summary.passing).toBeDefined();
        expect(result.summary.failing).toBeDefined();
        expect(result.summary.total).toBe(result.summary.passing + result.summary.failing);
      });
    });

    describe('error handling', () => {
      it('should handle empty HTML gracefully', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: '<html><body></body></html>',
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues).toEqual([]);
        expect(result.summary.total).toBe(0);
      });

      it('should return error result for invalid URL', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'url',
          value: 'http://localhost:99999/nonexistent',
          options: { timeout: 5000 },
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('dispose', () => {
    it('should be able to dispose and reinitialize', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const localAdapter = new ContrastAdapter({ headless: true });

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.valid,
      };

      const result1 = await localAdapter.analyze(target);
      expect(result1.success).toBe(true);

      await localAdapter.dispose();

      const result2 = await localAdapter.analyze(target);
      expect(result2.success).toBe(true);

      await localAdapter.dispose();
    });
  });
});
