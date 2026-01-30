import { describe, it, expect } from 'vitest';
import { rgbToHex, rgbToHsl, hslToRgb } from '../../../../src/tools/Contrast/utils/converters.js';
import type { RGB } from '../../../../src/tools/Contrast/types/color-analysis.js';

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

describe('rgbToHsl', () => {
  it('should convert primary colors correctly', () => {
    const redHsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(redHsl.h).toBeCloseTo(0, 0);
    expect(redHsl.s).toBeCloseTo(1, 2);
    expect(redHsl.l).toBeCloseTo(0.5, 2);

    const greenHsl = rgbToHsl({ r: 0, g: 255, b: 0 });
    expect(greenHsl.h).toBeCloseTo(120, 0);
    expect(greenHsl.s).toBeCloseTo(1, 2);
    expect(greenHsl.l).toBeCloseTo(0.5, 2);

    const blueHsl = rgbToHsl({ r: 0, g: 0, b: 255 });
    expect(blueHsl.h).toBeCloseTo(240, 0);
    expect(blueHsl.s).toBeCloseTo(1, 2);
    expect(blueHsl.l).toBeCloseTo(0.5, 2);
  });

  it('should handle grayscale colors', () => {
    const gray: RGB = { r: 128, g: 128, b: 128 };
    const hsl = rgbToHsl(gray);
    expect(hsl.s).toBe(0);
  });

  it('should handle white and black', () => {
    const whiteHsl = rgbToHsl({ r: 255, g: 255, b: 255 });
    expect(whiteHsl.l).toBeCloseTo(1, 2);

    const blackHsl = rgbToHsl({ r: 0, g: 0, b: 0 });
    expect(blackHsl.l).toBe(0);
  });
});

describe('hslToRgb', () => {
  it('should convert primary colors correctly', () => {
    const red = hslToRgb({ h: 0, s: 1, l: 0.5 });
    expect(red.r).toBe(255);
    expect(red.g).toBe(0);
    expect(red.b).toBe(0);

    const green = hslToRgb({ h: 120, s: 1, l: 0.5 });
    expect(green.r).toBe(0);
    expect(green.g).toBe(255);
    expect(green.b).toBe(0);

    const blue = hslToRgb({ h: 240, s: 1, l: 0.5 });
    expect(blue.r).toBe(0);
    expect(blue.g).toBe(0);
    expect(blue.b).toBe(255);
  });

  it('should handle grayscale (zero saturation)', () => {
    const gray = hslToRgb({ h: 0, s: 0, l: 0.5 });
    expect(gray.r).toBe(gray.g);
    expect(gray.g).toBe(gray.b);
  });
});

describe('rgbToHsl and hslToRgb round-trip', () => {
  it('should convert RGB to HSL and back', () => {
    const original: RGB = { r: 255, g: 0, b: 0 };
    const hsl = rgbToHsl(original);
    const back = hslToRgb(hsl);

    expect(back.r).toBeCloseTo(original.r, 0);
    expect(back.g).toBeCloseTo(original.g, 0);
    expect(back.b).toBeCloseTo(original.b, 0);
  });

  it('should preserve colors through round-trip conversion', () => {
    const colors: RGB[] = [
      { r: 128, g: 64, b: 192 },
      { r: 50, g: 150, b: 100 },
      { r: 200, g: 100, b: 50 },
    ];

    for (const original of colors) {
      const hsl = rgbToHsl(original);
      const back = hslToRgb(hsl);

      expect(back.r).toBeCloseTo(original.r, 0);
      expect(back.g).toBeCloseTo(original.g, 0);
      expect(back.b).toBeCloseTo(original.b, 0);
    }
  });
});
