export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface WCAGContrastResult {
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  meetsAALargeText: boolean;
  meetsAAALargeText: boolean;
}

const NAMED_COLORS: Record<string, RGB> = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  silver: { r: 192, g: 192, b: 192 },
  maroon: { r: 128, g: 0, b: 0 },
  olive: { r: 128, g: 128, b: 0 },
  lime: { r: 0, g: 255, b: 0 },
  aqua: { r: 0, g: 255, b: 255 },
  teal: { r: 0, g: 128, b: 128 },
  navy: { r: 0, g: 0, b: 128 },
  fuchsia: { r: 255, g: 0, b: 255 },
  purple: { r: 128, g: 0, b: 128 },
  orange: { r: 255, g: 165, b: 0 },
  transparent: { r: 0, g: 0, b: 0 },
};

const WCAG_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
  NON_TEXT: 3.0,
} as const;

function parseHex(hex: string): RGB | null {
  const cleanHex = hex.replace('#', '');

  let r: number, g: number, b: number;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0]! + cleanHex[0], 16);
    g = parseInt(cleanHex[1]! + cleanHex[1], 16);
    b = parseInt(cleanHex[2]! + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else {
    return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }

  return { r, g, b };
}

function parseRgb(color: string): RGB | null {
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]!, 10),
      g: parseInt(rgbMatch[2]!, 10),
      b: parseInt(rgbMatch[3]!, 10),
    };
  }
  return null;
}

function parseHsl(color: string): RGB | null {
  const hslMatch = color.match(/hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+)?\s*\)/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1]!, 10);
    const s = parseInt(hslMatch[2]!, 10) / 100;
    const l = parseInt(hslMatch[3]!, 10) / 100;
    return hslToRgb({ h, s, l });
  }
  return null;
}

export function parseColor(color: string): RGB | null {
  if (!color || typeof color !== 'string') {
    return null;
  }

  const normalizedColor = color.trim().toLowerCase();

  if (NAMED_COLORS[normalizedColor]) {
    return { ...NAMED_COLORS[normalizedColor]! };
  }

  if (normalizedColor.startsWith('#')) {
    return parseHex(normalizedColor);
  }

  if (normalizedColor.startsWith('rgb')) {
    return parseRgb(normalizedColor);
  }

  if (normalizedColor.startsWith('hsl')) {
    return parseHsl(normalizedColor);
  }

  return null;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    default:
      h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s, l };
}

export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const hNorm = h / 360;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tNorm = t;
    if (tNorm < 0) tNorm += 1;
    if (tNorm > 1) tNorm -= 1;
    if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
    if (tNorm < 1 / 2) return q;
    if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255),
  };
}

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

export function getWCAGContrastResult(fg: RGB, bg: RGB): WCAGContrastResult {
  const ratio = getContrastRatio(fg, bg);
  return {
    ratio: Math.round(ratio * 100) / 100,
    meetsAA: ratio >= WCAG_THRESHOLDS.AA_NORMAL,
    meetsAAA: ratio >= WCAG_THRESHOLDS.AAA_NORMAL,
    meetsAALargeText: ratio >= WCAG_THRESHOLDS.AA_LARGE,
    meetsAAALargeText: ratio >= WCAG_THRESHOLDS.AAA_LARGE,
  };
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

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToString(rgb: RGB): string {
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

export { WCAG_THRESHOLDS };
