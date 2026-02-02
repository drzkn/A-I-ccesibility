import Color from 'colorjs.io';
import {
  type RGB,
  WCAG_THRESHOLDS,
  APCA_THRESHOLDS,
} from '../types/colorAnalysis.type.js';

function rgbToColor(rgb: RGB): Color {
  return new Color('srgb', [rgb.r / 255, rgb.g / 255, rgb.b / 255]);
}

function colorToRgb(color: Color): RGB {
  const srgb = color.to('srgb');
  return {
    r: Math.round(Math.max(0, Math.min(255, srgb.coords[0]! * 255))),
    g: Math.round(Math.max(0, Math.min(255, srgb.coords[1]! * 255))),
    b: Math.round(Math.max(0, Math.min(255, srgb.coords[2]! * 255))),
  };
}

export function parseColor(colorStr: string): RGB | null {
  try {
    const color = new Color(colorStr);
    return colorToRgb(color);
  } catch {
    return null;
  }
}

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function getContrastRatio(fg: RGB, bg: RGB): number {
  const fgColor = rgbToColor(fg);
  const bgColor = rgbToColor(bg);
  return fgColor.contrast(bgColor, 'WCAG21');
}

export function getAPCAContrast(fg: RGB, bg: RGB): number {
  const fgColor = rgbToColor(fg);
  const bgColor = rgbToColor(bg);
  return fgColor.contrast(bgColor, 'APCA');
}

export function meetsWCAG(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= WCAG_THRESHOLDS.AA_LARGE : ratio >= WCAG_THRESHOLDS.AA_NORMAL;
  }
  return isLargeText ? ratio >= WCAG_THRESHOLDS.AAA_LARGE : ratio >= WCAG_THRESHOLDS.AAA_NORMAL;
}

export function meetsAPCA(lightness: number, textType: 'body' | 'large' | 'nonText'): boolean {
  const absLightness = Math.abs(lightness);
  switch (textType) {
    case 'body':
      return absLightness >= APCA_THRESHOLDS.BODY_TEXT;
    case 'large':
      return absLightness >= APCA_THRESHOLDS.LARGE_TEXT;
    case 'nonText':
      return absLightness >= APCA_THRESHOLDS.NON_TEXT;
  }
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

export function getRequiredAPCALightness(isLargeText: boolean): number {
  return isLargeText ? APCA_THRESHOLDS.LARGE_TEXT : APCA_THRESHOLDS.BODY_TEXT;
}

export function suggestFixedColor(fg: RGB, bg: RGB, targetRatio: number): RGB {
  const fgColor = rgbToColor(fg);
  const bgColor = rgbToColor(bg);

  const fgOklch = fgColor.to('oklch');
  const bgLuminance = bgColor.luminance;
  const fgLuminance = fgColor.luminance;

  const shouldDarken = fgLuminance > bgLuminance;

  let low = 0;
  let high = 1;
  let bestL = fgOklch.coords[0]!;
  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const mid = (low + high) / 2;
    const testColor = new Color('oklch', [mid, fgOklch.coords[1]!, fgOklch.coords[2]!]);
    const testRgb = colorToRgb(testColor);
    const ratio = getContrastRatio(testRgb, bg);

    if (Math.abs(ratio - targetRatio) < 0.01) {
      bestL = mid;
      break;
    }

    const testLuminance = testColor.luminance;

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

  const resultColor = new Color('oklch', [bestL, fgOklch.coords[1]!, fgOklch.coords[2]!]);
  return colorToRgb(resultColor);
}

export function suggestFixedColorForAPCA(fg: RGB, bg: RGB, targetLightness: number): RGB {
  const fgColor = rgbToColor(fg);
  const bgColor = rgbToColor(bg);

  const fgOklch = fgColor.to('oklch');
  const bgLuminance = bgColor.luminance;
  const fgLuminance = fgColor.luminance;

  const shouldDarken = fgLuminance > bgLuminance;

  let low = 0;
  let high = 1;
  let bestL = fgOklch.coords[0]!;
  let iterations = 0;
  const maxIterations = 50;

  while (iterations < maxIterations) {
    const mid = (low + high) / 2;
    const testColor = new Color('oklch', [mid, fgOklch.coords[1]!, fgOklch.coords[2]!]);
    const testRgb = colorToRgb(testColor);
    const lightness = getAPCAContrast(testRgb, bg);
    const absLightness = Math.abs(lightness);

    if (Math.abs(absLightness - targetLightness) < 0.5) {
      bestL = mid;
      break;
    }

    const testLuminance = testColor.luminance;

    if (shouldDarken) {
      if (absLightness < targetLightness) {
        high = mid;
      } else {
        low = mid;
        bestL = mid;
      }
    } else {
      if (testLuminance > bgLuminance) {
        if (absLightness < targetLightness) {
          low = mid;
        } else {
          high = mid;
          bestL = mid;
        }
      } else {
        if (absLightness < targetLightness) {
          high = mid;
        } else {
          low = mid;
          bestL = mid;
        }
      }
    }

    iterations++;
  }

  const resultColor = new Color('oklch', [bestL, fgOklch.coords[1]!, fgOklch.coords[2]!]);
  return colorToRgb(resultColor);
}
