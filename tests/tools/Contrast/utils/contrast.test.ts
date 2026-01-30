import { describe, it, expect } from 'vitest';
import {
  getLuminance,
  getContrastRatio,
  meetsWCAG,
  isLargeText,
  getRequiredRatio,
  suggestFixedColor,
} from '../../../../src/tools/Contrast/utils/contrast.js';
import type { RGB } from '../../../../src/tools/Contrast/types/color-analysis.js';

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
