import { type RGB, WCAG_THRESHOLDS } from '../types/color-analysis.js';
import { rgbToHsl, hslToRgb } from './converters.js';

function linearize(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function getLuminance(rgb: RGB): number {
  const rLin = linearize(rgb.r);
  const gLin = linearize(rgb.g);
  const bLin = linearize(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

export function getContrastRatio(fg: RGB, bg: RGB): number {
  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= WCAG_THRESHOLDS.AA_LARGE : ratio >= WCAG_THRESHOLDS.AA_NORMAL;
  }
  return isLargeText ? ratio >= WCAG_THRESHOLDS.AAA_LARGE : ratio >= WCAG_THRESHOLDS.AAA_NORMAL;
}

export function meetsWCAGNonText(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.NON_TEXT;
}

export function isLargeText(fontSize: number, fontWeight: number): boolean {
  const isBold = fontWeight >= 700;
  if (isBold) {
    return fontSize >= 18.5;
  }
  return fontSize >= 24;
}

export function getRequiredRatio(level: 'AA' | 'AAA', isLargeText: boolean): number {
  if (level === 'AA') {
    return isLargeText ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA_NORMAL;
  }
  return isLargeText ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA_NORMAL;
}

export function suggestFixedColor(fg: RGB, bg: RGB, targetRatio: number): RGB {
  const bgLuminance = getLuminance(bg);
  const fgLuminance = getLuminance(fg);

  const fgHsl = rgbToHsl(fg);

  const shouldDarken = fgLuminance > bgLuminance;

  let low = 0;
  let high = 1;
  let bestL = fgHsl.l;
  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const mid = (low + high) / 2;
    const testHsl = { ...fgHsl, l: mid };
    const testRgb = hslToRgb(testHsl);
    const ratio = getContrastRatio(testRgb, bg);

    if (Math.abs(ratio - targetRatio) < 0.01) {
      bestL = mid;
      break;
    }

    const testLuminance = getLuminance(testRgb);

    if (shouldDarken) {
      if (ratio < targetRatio) {
        high = mid;
      } else {
        low = mid;
        bestL = mid;
      }
    } else {
      if (testLuminance > bgLuminance) {
        if (ratio < targetRatio) {
          low = mid;
        } else {
          high = mid;
          bestL = mid;
        }
      } else {
        if (ratio < targetRatio) {
          high = mid;
        } else {
          low = mid;
          bestL = mid;
        }
      }
    }

    iterations++;
  }

  return hslToRgb({ ...fgHsl, l: bestL });
}
