import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  meetsWCAG,
  isLargeText,
  getRequiredRatio,
  suggestFixedColor,
  parseColor,
  rgbToHex,
  getAPCAContrast,
  meetsAPCA,
  getRequiredAPCALightness,
  suggestFixedColorForAPCA,
} from '../../../../src/tools/Contrast/utils/contrast.js';
import type { RGB } from '../../../../src/tools/Contrast/types/colorAnalysis.type.js';

function getAverageRgb(rgb: RGB): number {
  return (rgb.r + rgb.g + rgb.b) / 3;
}

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

    expect(getAverageRgb(fixed)).toBeLessThan(getAverageRgb(lightGray));
  });

  it('should work for colors that already meet the ratio', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    const fixed = suggestFixedColor(black, white, 4.5);
    expect(fixed).toBeDefined();
  });
});

describe('parseColor', () => {
  it('should parse hex colors', () => {
    expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse short hex colors', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse rgb colors', () => {
    expect(parseColor('rgb(255, 255, 255)')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse named colors', () => {
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0 });
    expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('should parse hsl colors', () => {
    const white = parseColor('hsl(0, 0%, 100%)');
    expect(white).toEqual({ r: 255, g: 255, b: 255 });

    const black = parseColor('hsl(0, 0%, 0%)');
    expect(black).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('should return null for invalid colors', () => {
    expect(parseColor('invalid')).toBeNull();
    expect(parseColor('not-a-color')).toBeNull();
  });
});

describe('rgbToHex', () => {
  it('should convert RGB to hex', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#ffffff');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
    expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00ff00');
    expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000ff');
  });

  it('should pad single digit hex values', () => {
    expect(rgbToHex({ r: 0, g: 15, b: 8 })).toBe('#000f08');
  });

  it('should clamp values to valid range', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 256 })).toBe('#ff00ff');
  });
});

describe('getAPCAContrast', () => {
  it('should return high absolute value for black on white', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };
    const contrast = getAPCAContrast(black, white);
    expect(Math.abs(contrast)).toBeGreaterThan(100);
  });

  it('should return high absolute value for white on black', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };
    const contrast = getAPCAContrast(white, black);
    expect(Math.abs(contrast)).toBeGreaterThan(100);
  });

  it('should have opposite signs for dark-on-light vs light-on-dark', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };
    const blackOnWhite = getAPCAContrast(black, white);
    const whiteOnBlack = getAPCAContrast(white, black);
    expect(blackOnWhite * whiteOnBlack).toBeLessThan(0);
  });

  it('should return close to 0 for same colors', () => {
    const gray: RGB = { r: 128, g: 128, b: 128 };
    const contrast = getAPCAContrast(gray, gray);
    expect(Math.abs(contrast)).toBeLessThan(1);
  });

  it('should not be symmetric (unlike WCAG)', () => {
    const darkGray: RGB = { r: 50, g: 50, b: 50 };
    const lightGray: RGB = { r: 200, g: 200, b: 200 };
    const darkOnLight = getAPCAContrast(darkGray, lightGray);
    const lightOnDark = getAPCAContrast(lightGray, darkGray);
    expect(Math.abs(darkOnLight)).not.toBe(Math.abs(lightOnDark));
  });
});

describe('meetsAPCA', () => {
  describe('body text (requires Lc >= 75)', () => {
    it('should return true for high contrast', () => {
      expect(meetsAPCA(75, 'body')).toBe(true);
      expect(meetsAPCA(80, 'body')).toBe(true);
      expect(meetsAPCA(-75, 'body')).toBe(true);
      expect(meetsAPCA(-80, 'body')).toBe(true);
    });

    it('should return false for low contrast', () => {
      expect(meetsAPCA(74, 'body')).toBe(false);
      expect(meetsAPCA(50, 'body')).toBe(false);
      expect(meetsAPCA(-74, 'body')).toBe(false);
    });
  });

  describe('large text (requires Lc >= 60)', () => {
    it('should return true for adequate contrast', () => {
      expect(meetsAPCA(60, 'large')).toBe(true);
      expect(meetsAPCA(75, 'large')).toBe(true);
      expect(meetsAPCA(-60, 'large')).toBe(true);
    });

    it('should return false for low contrast', () => {
      expect(meetsAPCA(59, 'large')).toBe(false);
      expect(meetsAPCA(-59, 'large')).toBe(false);
    });
  });

  describe('non-text (requires Lc >= 45)', () => {
    it('should return true for adequate contrast', () => {
      expect(meetsAPCA(45, 'nonText')).toBe(true);
      expect(meetsAPCA(60, 'nonText')).toBe(true);
      expect(meetsAPCA(-45, 'nonText')).toBe(true);
    });

    it('should return false for low contrast', () => {
      expect(meetsAPCA(44, 'nonText')).toBe(false);
      expect(meetsAPCA(-44, 'nonText')).toBe(false);
    });
  });
});

describe('getRequiredAPCALightness', () => {
  it('should return 60 for large text', () => {
    expect(getRequiredAPCALightness(true)).toBe(60);
  });

  it('should return 75 for normal text', () => {
    expect(getRequiredAPCALightness(false)).toBe(75);
  });
});

describe('suggestFixedColorForAPCA', () => {
  it('should suggest a color that meets the target APCA lightness', () => {
    const lightGray: RGB = { r: 150, g: 150, b: 150 };
    const white: RGB = { r: 255, g: 255, b: 255 };
    const targetLightness = 75;

    const fixed = suggestFixedColorForAPCA(lightGray, white, targetLightness);
    const newLightness = Math.abs(getAPCAContrast(fixed, white));

    expect(newLightness).toBeGreaterThanOrEqual(targetLightness - 1);
  });

  it('should darken light text on light background', () => {
    const lightGray: RGB = { r: 200, g: 200, b: 200 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    const fixed = suggestFixedColorForAPCA(lightGray, white, 75);

    expect(getAverageRgb(fixed)).toBeLessThan(getAverageRgb(lightGray));
  });

  it('should work for colors that already meet the target', () => {
    const black: RGB = { r: 0, g: 0, b: 0 };
    const white: RGB = { r: 255, g: 255, b: 255 };

    const fixed = suggestFixedColorForAPCA(black, white, 60);
    expect(fixed).toBeDefined();
    const newLightness = Math.abs(getAPCAContrast(fixed, white));
    expect(newLightness).toBeGreaterThanOrEqual(60);
  });
});

describe('formatOutput', async () => {
  const { formatOutput } = await import('../../../../src/tools/Contrast/utils/index.js');

  it('should include contrastAlgorithm in output', () => {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: 100,
      target: 'https://example.com',
      wcagLevel: 'AA' as const,
      contrastAlgorithm: 'WCAG21' as const,
      issues: [],
      summary: { total: 0, passing: 0, failing: 0 },
    };

    const output = formatOutput(result);

    expect(output.contrastAlgorithm).toBe('WCAG21');
  });

  it('should return APCA when contrastAlgorithm is APCA', () => {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: 100,
      target: 'https://example.com',
      wcagLevel: 'AA' as const,
      contrastAlgorithm: 'APCA' as const,
      issues: [],
      summary: { total: 0, passing: 0, failing: 0 },
    };

    const output = formatOutput(result);

    expect(output.contrastAlgorithm).toBe('APCA');
  });

  it('should map all required fields correctly', () => {
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: 150,
      target: 'https://example.com',
      wcagLevel: 'AAA' as const,
      contrastAlgorithm: 'WCAG21' as const,
      issues: [],
      summary: { total: 5, passing: 3, failing: 2 },
    };

    const output = formatOutput(result);

    expect(output.success).toBe(true);
    expect(output.target).toBe('https://example.com');
    expect(output.wcagLevel).toBe('AAA');
    expect(output.contrastAlgorithm).toBe('WCAG21');
    expect(output.issueCount).toBe(0);
    expect(output.summary).toEqual({ total: 5, passing: 3, failing: 2 });
    expect(output.duration).toBe(150);
  });
});

describe('buildAnalysisOptions', async () => {
  const { buildAnalysisOptions } = await import('../../../../src/tools/Contrast/utils/index.js');

  it('should default contrastAlgorithm to WCAG21', () => {
    const input = { url: 'https://example.com' };

    const options = buildAnalysisOptions(input);

    expect(options.contrastAlgorithm).toBe('WCAG21');
  });

  it('should use APCA when specified', () => {
    const input = {
      url: 'https://example.com',
      options: { contrastAlgorithm: 'APCA' as const },
    };

    const options = buildAnalysisOptions(input);

    expect(options.contrastAlgorithm).toBe('APCA');
  });

  it('should preserve WCAG21 when explicitly set', () => {
    const input = {
      url: 'https://example.com',
      options: { contrastAlgorithm: 'WCAG21' as const },
    };

    const options = buildAnalysisOptions(input);

    expect(options.contrastAlgorithm).toBe('WCAG21');
  });
});
