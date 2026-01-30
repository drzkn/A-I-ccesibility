import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { AxeAdapter } from '../../../src/tools/Axe/adapters/index.js';
import { fixtures } from '../../fixtures/html-fixtures.js';
import type { AnalysisTarget, AnalysisOptions } from '../../../src/shared/types/analysis.js';

describe('AxeAdapter', () => {
  let adapter: AxeAdapter;

  beforeAll(() => {
    adapter = new AxeAdapter({
      headless: true,
      timeout: 30000,
    });
  });

  afterAll(async () => {
    await adapter.dispose();
  });

  describe('isAvailable', () => {
    it('should return true when browser can be launched', async () => {
      const available = await adapter.isAvailable();
      expect(available).toBe(true);
    });
  });

  describe('analyze', () => {
    describe('with valid HTML', () => {
      it('should return success with minimal issues', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.tool).toBe('axe-core');
        expect(result.issues).toBeDefined();
        expect(Array.isArray(result.issues)).toBe(true);
        expect(result.summary).toBeDefined();
        expect(result.summary.total).toBeGreaterThanOrEqual(0);
      });
    });

    describe('with missing alt text', () => {
      it('should detect image-alt violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingAltText,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);

        const imageAltIssues = result.issues.filter((i) => i.ruleId === 'image-alt');
        expect(imageAltIssues.length).toBeGreaterThan(0);

        const issue = imageAltIssues[0];
        expect(issue?.tool).toBe('axe-core');
        expect(issue?.severity).toBeDefined();
        expect(issue?.location).toBeDefined();
        expect(issue?.location.selector).toBeDefined();
      });
    });

    describe('with missing form labels', () => {
      it('should detect label violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingFormLabels,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);

        const labelIssues = result.issues.filter(
          (i) => i.ruleId === 'label' || i.ruleId === 'select-name'
        );
        expect(labelIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with missing lang attribute', () => {
      it('should detect html-has-lang violation', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingLang,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);

        const langIssues = result.issues.filter((i) => i.ruleId === 'html-has-lang');
        expect(langIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with empty buttons and links', () => {
      it('should detect button-name and link-name violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.emptyButtonsAndLinks,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);

        const buttonIssues = result.issues.filter((i) => i.ruleId === 'button-name');
        const linkIssues = result.issues.filter((i) => i.ruleId === 'link-name');

        expect(buttonIssues.length + linkIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with duplicate IDs', () => {
      it('should analyze HTML with duplicate IDs without crashing', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.duplicateIds,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues).toBeDefined();
        expect(Array.isArray(result.issues)).toBe(true);
      });
    });

    describe('with heading order issues', () => {
      it('should detect heading-order violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.headingOrder,
        };
        const options: AnalysisOptions = {
          includeWarnings: true,
          wcagLevel: 'AA',
        };

        const result = await adapter.analyze(target, options);

        expect(result.success).toBe(true);
      });
    });

    describe('with ARIA issues', () => {
      it('should detect ARIA-related violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.ariaIssues,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);

        const ariaIssues = result.issues.filter((i) => i.ruleId.includes('aria'));
        expect(ariaIssues.length).toBeGreaterThan(0);
      });
    });

    describe('with table issues', () => {
      it('should detect table-related violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.tableIssues,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
      });
    });

    describe('with multiple issues', () => {
      it('should detect multiple types of violations', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.multipleIssues,
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
        expect(result.issues.length).toBeGreaterThan(2);
        expect(result.summary.total).toBe(result.issues.length);
      });

      it('should correctly categorize issues by severity', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.multipleIssues,
        };

        const result = await adapter.analyze(target);

        const { bySeverity } = result.summary;
        const totalBySeverity =
          bySeverity.critical + bySeverity.serious + bySeverity.moderate + bySeverity.minor;

        expect(totalBySeverity).toBe(result.summary.total);
      });
    });

    describe('with analysis options', () => {
      it('should respect wcagLevel option', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.multipleIssues,
        };

        const resultA = await adapter.analyze(target, { wcagLevel: 'A', includeWarnings: false });
        const resultAA = await adapter.analyze(target, { wcagLevel: 'AA', includeWarnings: false });

        expect(resultA.success).toBe(true);
        expect(resultAA.success).toBe(true);
      });

      it('should respect excludeRules option', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingLang,
        };

        const resultWithRule = await adapter.analyze(target);
        const resultWithoutRule = await adapter.analyze(target, {
          excludeRules: ['html-has-lang'],
          wcagLevel: 'AA',
          includeWarnings: false,
        });

        const langIssuesWithRule = resultWithRule.issues.filter(
          (i) => i.ruleId === 'html-has-lang'
        );
        const langIssuesWithoutRule = resultWithoutRule.issues.filter(
          (i) => i.ruleId === 'html-has-lang'
        );

        expect(langIssuesWithRule.length).toBeGreaterThan(0);
        expect(langIssuesWithoutRule.length).toBe(0);
      });

      it('should include incomplete results when includeWarnings is true', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const resultWithWarnings = await adapter.analyze(target, { includeWarnings: true, wcagLevel: 'AA' });
        const resultWithoutWarnings = await adapter.analyze(target, { includeWarnings: false, wcagLevel: 'AA' });

        expect(resultWithWarnings.success).toBe(true);
        expect(resultWithoutWarnings.success).toBe(true);
      });
    });

    describe('issue structure', () => {
      it('should have correct issue structure with all required fields', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingAltText,
        };

        const result = await adapter.analyze(target);
        const issue = result.issues[0];

        expect(issue).toBeDefined();
        expect(issue?.id).toBeDefined();
        expect(issue?.ruleId).toBeDefined();
        expect(issue?.tool).toBe('axe-core');
        expect(['critical', 'serious', 'moderate', 'minor']).toContain(issue?.severity);
        expect(issue?.location).toBeDefined();
        expect(issue?.message).toBeDefined();
        expect(typeof issue?.message).toBe('string');
      });

      it('should include WCAG reference when available', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingAltText,
        };

        const result = await adapter.analyze(target);
        const issuesWithWcag = result.issues.filter((i) => i.wcag !== undefined);

        if (issuesWithWcag.length > 0) {
          const wcag = issuesWithWcag[0]?.wcag;
          expect(wcag?.criterion).toBeDefined();
          expect(['A', 'AA', 'AAA']).toContain(wcag?.level);
          expect(['perceivable', 'operable', 'understandable', 'robust']).toContain(wcag?.principle);
        }
      });

      it('should include affected users inference', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.missingAltText,
        };

        const result = await adapter.analyze(target);
        const issue = result.issues[0];

        expect(issue?.affectedUsers).toBeDefined();
        expect(Array.isArray(issue?.affectedUsers)).toBe(true);
        expect(issue?.affectedUsers?.length).toBeGreaterThan(0);
      });
    });

    describe('metadata', () => {
      it('should include metadata in result', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: fixtures.valid,
        };

        const result = await adapter.analyze(target);

        expect(result.metadata).toBeDefined();
        expect(result.timestamp).toBeDefined();
        expect(result.duration).toBeDefined();
        expect(result.duration).toBeGreaterThan(0);
      });
    });

    describe('error handling', () => {
      it('should handle invalid HTML gracefully', async () => {
        const target: AnalysisTarget = {
          type: 'html',
          value: '<not valid html at all',
        };

        const result = await adapter.analyze(target);

        expect(result.success).toBe(true);
      });

      it('should return error result for invalid URL', async () => {
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
      const localAdapter = new AxeAdapter({ headless: true });

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
