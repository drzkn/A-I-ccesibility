import { describe, it, expect } from 'vitest';
import { PRINCIPLE_MAP, AUDIT_WCAG_MAP } from '../../../../src/tools/Lighthouse/types/lighthouse.maps.js';
import { LighthouseToolInputSchema } from '../../../../src/tools/Lighthouse/types/lighthouse.type.js';
import { LighthouseToolMcpInputSchema } from '../../../../src/tools/Lighthouse/types/input.type.js';

describe('PRINCIPLE_MAP', () => {
  it('should map digits 1-4 to the four WCAG principles', () => {
    expect(PRINCIPLE_MAP).toEqual({
      '1': 'perceivable',
      '2': 'operable',
      '3': 'understandable',
      '4': 'robust',
    });
  });
});

describe('AUDIT_WCAG_MAP', () => {
  it('should map representative audits from each principle correctly', () => {
    expect(AUDIT_WCAG_MAP['image-alt']).toEqual({ wcagCriterion: '1.1.1', wcagLevel: 'A', wcagPrinciple: 'perceivable' });
    expect(AUDIT_WCAG_MAP['document-title']).toEqual({ wcagCriterion: '2.4.2', wcagLevel: 'A', wcagPrinciple: 'operable' });
    expect(AUDIT_WCAG_MAP['html-has-lang']).toEqual({ wcagCriterion: '3.1.1', wcagLevel: 'A', wcagPrinciple: 'understandable' });
    expect(AUDIT_WCAG_MAP['button-name']).toEqual({ wcagCriterion: '4.1.2', wcagLevel: 'A', wcagPrinciple: 'robust' });
    expect(AUDIT_WCAG_MAP['color-contrast']).toEqual({ wcagCriterion: '1.4.3', wcagLevel: 'AA', wcagPrinciple: 'perceivable' });
    expect(AUDIT_WCAG_MAP['tap-targets']).toEqual({ wcagCriterion: '2.5.5', wcagLevel: 'AAA', wcagPrinciple: 'operable' });
  });

  it('should return undefined for unknown audit IDs', () => {
    expect(AUDIT_WCAG_MAP['unknown-audit']).toBeUndefined();
  });

  it('should have consistent data: valid levels, criterion format, and principle matching first digit', () => {
    const validLevels = ['A', 'AA', 'AAA'];
    const criterionRegex = /^\d+\.\d+\.\d+$/;

    for (const [, mapping] of Object.entries(AUDIT_WCAG_MAP)) {
      expect(validLevels).toContain(mapping.wcagLevel);
      expect(mapping.wcagCriterion).toMatch(criterionRegex);

      const firstDigit = mapping.wcagCriterion.charAt(0);
      expect(mapping.wcagPrinciple).toBe(PRINCIPLE_MAP[firstDigit]);
    }
  });
});

describe('LighthouseToolInputSchema', () => {
  it('should accept valid URL with full options and default wcagLevel to AA', () => {
    const full = LighthouseToolInputSchema.safeParse({
      url: 'https://example.com',
      options: { wcagLevel: 'AAA', browser: { viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true, waitForSelector: '#main', waitForTimeout: 5000 } },
    });
    expect(full.success).toBe(true);

    const withDefault = LighthouseToolInputSchema.safeParse({ url: 'https://example.com', options: {} });
    expect(withDefault.success).toBe(true);
    if (withDefault.success) expect(withDefault.data.options?.wcagLevel).toBe('AA');
  });

  it('should reject invalid inputs', () => {
    expect(LighthouseToolInputSchema.safeParse({}).success).toBe(false);
    expect(LighthouseToolInputSchema.safeParse({ url: 'not-a-url' }).success).toBe(false);
    expect(LighthouseToolInputSchema.safeParse({ url: 'https://x.com', options: { wcagLevel: 'AAAA' } }).success).toBe(false);
    expect(LighthouseToolInputSchema.safeParse({ url: 'https://x.com', options: { browser: { waitForTimeout: 120000 } } }).success).toBe(false);
  });
});

describe('LighthouseToolMcpInputSchema', () => {
  it('should accept valid URL with options and reject invalid inputs', () => {
    expect(LighthouseToolMcpInputSchema.safeParse({ url: 'https://example.com' }).success).toBe(true);
    expect(LighthouseToolMcpInputSchema.safeParse({ url: 'https://example.com', options: { wcagLevel: 'A' } }).success).toBe(true);
    expect(LighthouseToolMcpInputSchema.safeParse({}).success).toBe(false);
    expect(LighthouseToolMcpInputSchema.safeParse({ url: 'invalid' }).success).toBe(false);
  });
});
