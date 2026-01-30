import type { RGB } from '../types/color-analysis.js';
import { NAMED_COLORS } from '../types/color-analysis.js';
import { hslToRgb } from './converters.js';

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
