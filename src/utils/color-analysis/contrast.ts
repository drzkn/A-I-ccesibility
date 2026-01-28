/**
 * @fileoverview Funciones de análisis de contraste según WCAG 2.1.
 * @module color-analysis/contrast
 */

import { type RGB, type WCAGContrastResult, WCAG_THRESHOLDS } from '../../types/color-analysis.js';
import { rgbToHsl, hslToRgb } from './converters.js';

/**
 * Aplica la corrección gamma inversa (linearización) a un componente de color.
 * Convierte valores sRGB a valores lineales para cálculos de luminancia.
 * @param value - Valor del componente de color (0-255)
 * @returns Valor linealizado (0-1)
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function linearize(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

/**
 * Calcula la luminancia relativa de un color según WCAG 2.1.
 * La luminancia relativa es un valor entre 0 (negro) y 1 (blanco).
 *
 * @param rgb - Color en formato RGB
 * @returns Luminancia relativa (0-1)
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 *
 * @example
 * getLuminance({ r: 255, g: 255, b: 255 }) // 1 (blanco)
 * getLuminance({ r: 0, g: 0, b: 0 })       // 0 (negro)
 */
export function getLuminance(rgb: RGB): number {
  const rLin = linearize(rgb.r);
  const gLin = linearize(rgb.g);
  const bLin = linearize(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Calcula el ratio de contraste entre dos colores según WCAG 2.1.
 * El ratio va de 1:1 (sin contraste) a 21:1 (máximo contraste, blanco sobre negro).
 *
 * @param fg - Color del primer plano (foreground) en formato RGB
 * @param bg - Color del fondo (background) en formato RGB
 * @returns Ratio de contraste (1 a 21)
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 *
 * @example
 * getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }) // 21
 */
export function getContrastRatio(fg: RGB, bg: RGB): number {
  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);

  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Verifica si un ratio de contraste cumple con un nivel WCAG específico.
 *
 * @param ratio - Ratio de contraste a verificar
 * @param level - Nivel WCAG a verificar ('AA' o 'AAA')
 * @param isLargeText - Indica si se aplican los criterios de texto grande
 * @returns true si cumple con el nivel especificado
 *
 * @example
 * meetsWCAG(4.5, 'AA', false) // true (cumple AA para texto normal)
 * meetsWCAG(4.5, 'AAA', false) // false (no cumple AAA para texto normal, requiere 7:1)
 */
export function meetsWCAG(ratio: number, level: 'AA' | 'AAA', isLargeText: boolean): boolean {
  if (level === 'AA') {
    return isLargeText ? ratio >= WCAG_THRESHOLDS.AA_LARGE : ratio >= WCAG_THRESHOLDS.AA_NORMAL;
  }
  return isLargeText ? ratio >= WCAG_THRESHOLDS.AAA_LARGE : ratio >= WCAG_THRESHOLDS.AAA_NORMAL;
}

/**
 * Verifica si un ratio de contraste cumple con el criterio WCAG para elementos no textuales.
 * Los elementos no textuales (iconos, bordes, controles) requieren un contraste mínimo de 3:1.
 *
 * @param ratio - Ratio de contraste a verificar
 * @returns true si cumple con el requisito de 3:1
 * @see https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
 */
export function meetsWCAGNonText(ratio: number): boolean {
  return ratio >= WCAG_THRESHOLDS.NON_TEXT;
}

/**
 * Determina si un texto se considera "texto grande" según WCAG.
 * El texto grande tiene requisitos de contraste menos estrictos.
 *
 * Criterios WCAG para texto grande:
 * - Texto de 18pt (24px) o mayor
 * - Texto en negrita de 14pt (18.5px) o mayor
 *
 * @param fontSize - Tamaño de fuente en píxeles
 * @param fontWeight - Peso de la fuente (400 = normal, 700 = bold)
 * @returns true si el texto se considera grande según WCAG
 *
 * @example
 * isLargeText(24, 400) // true (24px normal)
 * isLargeText(18.5, 700) // true (18.5px bold)
 * isLargeText(16, 400) // false (16px normal)
 */
export function isLargeText(fontSize: number, fontWeight: number): boolean {
  const isBold = fontWeight >= 700;
  if (isBold) {
    return fontSize >= 18.5;
  }
  return fontSize >= 24;
}

/**
 * Obtiene un análisis completo de contraste WCAG entre dos colores.
 * Retorna el ratio y el cumplimiento para todos los niveles y tamaños de texto.
 *
 * @param fg - Color del primer plano en formato RGB
 * @param bg - Color del fondo en formato RGB
 * @returns Objeto con ratio y cumplimiento de cada nivel WCAG
 *
 * @example
 * getWCAGContrastResult({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })
 * // { ratio: 21, meetsAA: true, meetsAAA: true, meetsAALargeText: true, meetsAAALargeText: true }
 */
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

/**
 * Obtiene el ratio de contraste mínimo requerido para un nivel WCAG específico.
 *
 * @param level - Nivel WCAG ('AA' o 'AAA')
 * @param isLargeText - Indica si se aplican los criterios de texto grande
 * @returns Ratio mínimo requerido
 *
 * @example
 * getRequiredRatio('AA', false)  // 4.5
 * getRequiredRatio('AA', true)   // 3.0
 * getRequiredRatio('AAA', false) // 7.0
 */
export function getRequiredRatio(level: 'AA' | 'AAA', isLargeText: boolean): number {
  if (level === 'AA') {
    return isLargeText ? WCAG_THRESHOLDS.AA_LARGE : WCAG_THRESHOLDS.AA_NORMAL;
  }
  return isLargeText ? WCAG_THRESHOLDS.AAA_LARGE : WCAG_THRESHOLDS.AAA_NORMAL;
}

/**
 * Sugiere un color alternativo que cumpla con el ratio de contraste objetivo.
 * Mantiene el tono (hue) y la saturación del color original, ajustando solo la luminosidad.
 * Utiliza búsqueda binaria para encontrar la luminosidad óptima.
 *
 * @param fg - Color del primer plano original en formato RGB
 * @param bg - Color del fondo en formato RGB
 * @param targetRatio - Ratio de contraste objetivo a alcanzar
 * @returns Color RGB ajustado que cumple con el ratio objetivo
 *
 * @example
 * const grisClaro = { r: 150, g: 150, b: 150 };
 * const blanco = { r: 255, g: 255, b: 255 };
 * suggestFixedColor(grisClaro, blanco, 4.5)
 * // Retorna un gris más oscuro que cumple con el ratio 4.5:1
 */
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
