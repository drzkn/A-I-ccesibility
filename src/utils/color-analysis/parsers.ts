/**
 * @fileoverview Funciones de parsing de colores CSS.
 * @module color-analysis/parsers
 */

import { type RGB, NAMED_COLORS } from '../../types/color-analysis.js';
import { hslToRgb } from './converters.js';

/**
 * Parsea un color en formato hexadecimal a RGB.
 * Soporta formatos de 3, 6 y 8 caracteres (con o sin #).
 * @param hex - Color en formato hexadecimal (ej: "#fff", "#ffffff", "#ffffffff")
 * @returns Objeto RGB o null si el formato es inválido
 */
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

/**
 * Parsea un color en formato rgb() o rgba() a RGB.
 * @param color - Color en formato CSS rgb/rgba (ej: "rgb(255, 0, 0)", "rgba(255, 0, 0, 0.5)")
 * @returns Objeto RGB o null si el formato es inválido
 */
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

/**
 * Parsea un color en formato hsl() o hsla() a RGB.
 * @param color - Color en formato CSS hsl/hsla (ej: "hsl(0, 100%, 50%)", "hsla(0, 100%, 50%, 0.5)")
 * @returns Objeto RGB o null si el formato es inválido
 */
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

/**
 * Parsea cualquier formato de color CSS soportado a RGB.
 * Soporta: colores con nombre, hexadecimal, rgb(), rgba(), hsl(), hsla().
 *
 * @param color - Color en cualquier formato CSS soportado
 * @returns Objeto RGB o null si el formato no es reconocido o es inválido
 *
 * @example
 * parseColor("#ff0000")        // { r: 255, g: 0, b: 0 }
 * parseColor("rgb(255, 0, 0)") // { r: 255, g: 0, b: 0 }
 * parseColor("red")            // { r: 255, g: 0, b: 0 }
 * parseColor("hsl(0, 100%, 50%)") // { r: 255, g: 0, b: 0 }
 */
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
