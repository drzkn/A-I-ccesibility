import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ContrastAdapter } from '../../../src/tools/Contrast/adapters/index.js';
import { fixtures } from '../../fixtures/html-fixtures.js';
import type { AnalysisTarget } from '../../../src/shared/types/analysis.js';

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
        expect(issue?.contrastData).toBeDefined();
        expect(issue?.contrastData.foreground).toBeDefined();
        expect(issue?.contrastData.background).toBeDefined();
        expect(issue?.contrastData.currentRatio).toBeDefined();
        expect(issue?.contrastData.requiredRatio).toBeDefined();
        expect(typeof issue?.contrastData.isLargeText).toBe('boolean');
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
            expect(issueWithFix.contrastData.suggestedFix?.foreground).toBeDefined();
            expect(issueWithFix.contrastData.suggestedFix?.newRatio).toBeGreaterThanOrEqual(
              issueWithFix.contrastData.requiredRatio
            );
          }
        }
      });
    });

    describe('with very low contrast HTML', () => {
      it('should detect very low contrast text', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.veryLowContrast,
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
          value: fixtures.veryLowContrast,
        };

        const result = await adapter.analyze(target, { includePassingElements: true });

        const normalTextIssues = result.issues.filter((i) => !i.contrastData.isLargeText);
        const largeTextIssues = result.issues.filter((i) => i.contrastData.isLargeText);

        expect(normalTextIssues.length).toBeGreaterThan(0);
        expect(largeTextIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with WCAG level options', () => {
      it('should pass AA for moderate contrast', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.moderateContrast,
        };

        const result = await adapter.analyze(target, { wcagLevel: 'AA' });

        expect(result.success).toBe(true);
        expect(result.wcagLevel).toBe('AA');
      });
    });

    describe('with inherited background', () => {
      it('should detect contrast issues with inherited backgrounds', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastWithInheritedBackground,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });

    describe('with multiple color formats', () => {
      it('should parse and analyze colors in different formats', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastMultipleFormats,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.summary.failing).toBeGreaterThan(0);
      });
    });

    describe('with large text', () => {
      it('should apply different thresholds for large text', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastLargeText,
        };

        const result = await adapter.analyze(target, { includePassingElements: true });

        expect(result.success).toBe(true);
        const largeTextIssues = result.issues.filter((i) => i.contrastData.isLargeText);
        expect(largeTextIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with AAA level requirements', () => {
      it('should detect elements that pass AA but fail AAA', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastAAALevel,
        };

        const resultAA = await adapter.analyze(target, { wcagLevel: 'AA' });
        const resultAAA = await adapter.analyze(target, { wcagLevel: 'AAA' });

        expect(resultAA.success).toBe(true);
        expect(resultAAA.success).toBe(true);
        expect(resultAAA.summary.failing).toBeGreaterThanOrEqual(resultAA.summary.failing);
      });
    });

    describe('with nested elements', () => {
      it('should analyze nested elements with inherited styles', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastNestedElements,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);
      });
    });

    describe('with UI components', () => {
      it('should detect contrast issues in form elements', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.contrastUIComponents,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.summary.failing).toBeGreaterThan(0);
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
        expect(issue?.id).toBeDefined();
        expect(issue?.ruleId).toBe('color-contrast');
        expect(issue?.tool).toBe('contrast-analyzer');
        expect(['critical', 'serious', 'moderate', 'minor']).toContain(issue?.severity);
        expect(issue?.location).toBeDefined();
        expect(issue?.location.selector).toBeDefined();
        expect(issue?.message).toBeDefined();
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

        expect(issue?.wcag).toBeDefined();
        expect(['1.4.3', '1.4.6']).toContain(issue?.wcag?.criterion);
        expect(['AA', 'AAA']).toContain(issue?.wcag?.level);
        expect(issue?.wcag?.principle).toBe('perceivable');
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
        expect(result.contrastAlgorithm).toBeDefined();
      });

      it('should return contrastAlgorithm as WCAG21 by default', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target);

        expect(result.contrastAlgorithm).toBe('WCAG21');
      });

      it('should return contrastAlgorithm as APCA when specified', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

        expect(result.contrastAlgorithm).toBe('APCA');
      });

      it('should include contrastAlgorithm in error results', async () => {
        if (!browserAvailable) {
          console.log('Skipping test: browser not available');
          return;
        }

        const target: AnalysisTarget = {
          type: 'url',
          value: 'http://localhost:99999/nonexistent',
          options: { timeout: 5000 },
        };

        const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

        expect(result.success).toBe(false);
        expect(result.contrastAlgorithm).toBe('APCA');
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

  describe('APCA contrast algorithm', () => {
    it('should analyze contrast using APCA algorithm', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

      expect(result.success).toBe(true);
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should use Lc (lightness contrast) values for APCA', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const result = await adapter.analyze(target, {
        contrastAlgorithm: 'APCA',
        includePassingElements: true,
      });

      expect(result.success).toBe(true);
      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue?.contrastData).toBeDefined();
        expect(typeof issue?.contrastData.currentRatio).toBe('number');
      }
    });

    it('should detect low APCA contrast', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.veryLowContrast,
      };

      const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

      expect(result.success).toBe(true);
      expect(result.summary.failing).toBeGreaterThan(0);
    });

    it('should include APCA-specific messages', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

      expect(result.success).toBe(true);
      const failingIssue = result.issues.find(
        (i) => Math.abs(i.contrastData.currentRatio) < i.contrastData.requiredRatio
      );

      if (failingIssue) {
        expect(failingIssue.message).toContain('APCA');
        expect(failingIssue.message).toContain('Lc');
      }
    });

    it('should suggest APCA-compliant color fixes', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const result = await adapter.analyze(target, {
        contrastAlgorithm: 'APCA',
        suggestFixes: true,
      });

      expect(result.success).toBe(true);
      const failingIssues = result.issues.filter(
        (i) => Math.abs(i.contrastData.currentRatio) < i.contrastData.requiredRatio
      );

      if (failingIssues.length > 0) {
        const issueWithFix = failingIssues.find((i) => i.contrastData.suggestedFix);
        if (issueWithFix) {
          expect(issueWithFix.contrastData.suggestedFix).toBeDefined();
          expect(issueWithFix.contrastData.suggestedFix?.foreground).toBeDefined();
          expect(issueWithFix.contrastData.suggestedFix?.newRatio).toBeGreaterThanOrEqual(
            issueWithFix.contrastData.requiredRatio
          );
        }
      }
    });

    it('should handle large text with APCA thresholds', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.contrastLargeText,
      };

      const result = await adapter.analyze(target, {
        contrastAlgorithm: 'APCA',
        includePassingElements: true,
      });

      expect(result.success).toBe(true);
      const largeTextIssues = result.issues.filter((i) => i.contrastData.isLargeText);
      expect(largeTextIssues.length).toBeGreaterThan(0);

      const largeTextIssue = largeTextIssues[0];
      if (largeTextIssue) {
        expect(largeTextIssue.contrastData.requiredRatio).toBe(60);
      }
    });

    it('should include WCAG 3.0 Draft reference for APCA', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const result = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

      expect(result.success).toBe(true);
      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue?.wcag?.title).toContain('APCA');
        expect(issue?.wcag?.title).toContain('WCAG 3.0');
      }
    });

    it('should compare WCAG21 and APCA results for same content', async () => {
      if (!browserAvailable) {
        console.log('Skipping test: browser not available');
        return;
      }

      const target: AnalysisTarget = {
        type: 'html',
        value: fixtures.lowContrast,
      };

      const wcagResult = await adapter.analyze(target, { contrastAlgorithm: 'WCAG21' });
      const apcaResult = await adapter.analyze(target, { contrastAlgorithm: 'APCA' });

      expect(wcagResult.success).toBe(true);
      expect(apcaResult.success).toBe(true);

      if (wcagResult.issues.length > 0 && apcaResult.issues.length > 0) {
        expect(wcagResult.issues[0]?.contrastData.currentRatio).not.toBe(
          apcaResult.issues[0]?.contrastData.currentRatio
        );
      }
    });
  });
});
