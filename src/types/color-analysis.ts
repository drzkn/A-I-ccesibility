/**
 * @fileoverview Tipos y constantes para análisis de colores y contraste según WCAG 2.1.
 * @module types/color-analysis
 */

/**
 * Representación de un color en el espacio RGB.
 * Cada componente tiene un valor entre 0 y 255.
 */
export interface RGB {
  /** Componente rojo (0-255) */
  r: number;
  /** Componente verde (0-255) */
  g: number;
  /** Componente azul (0-255) */
  b: number;
}

/**
 * Representación de un color en el espacio HSL.
 */
export interface HSL {
  /** Tono en grados (0-360) */
  h: number;
  /** Saturación como valor decimal (0-1) */
  s: number;
  /** Luminosidad como valor decimal (0-1) */
  l: number;
}

/**
 * Resultado del análisis de contraste según los criterios WCAG 2.1.
 * Incluye verificación de cumplimiento para diferentes niveles y tamaños de texto.
 */
export interface WCAGContrastResult {
  /** Ratio de contraste calculado (1:1 a 21:1) */
  ratio: number;
  /** Cumple nivel AA para texto normal (ratio >= 4.5:1) */
  meetsAA: boolean;
  /** Cumple nivel AAA para texto normal (ratio >= 7:1) */
  meetsAAA: boolean;
  /** Cumple nivel AA para texto grande (ratio >= 3:1) */
  meetsAALargeText: boolean;
  /** Cumple nivel AAA para texto grande (ratio >= 4.5:1) */
  meetsAAALargeText: boolean;
}

/**
 * Mapa de colores CSS con nombre a sus valores RGB equivalentes.
 * @see https://www.w3.org/TR/css-color-3/#svg-color
 */
export const NAMED_COLORS: Record<string, RGB> = {
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

/**
 * Umbrales de contraste mínimo definidos por WCAG 2.1.
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html
 */
export const WCAG_THRESHOLDS = {
  /** Nivel AA para texto normal: 4.5:1 */
  AA_NORMAL: 4.5,
  /** Nivel AA para texto grande: 3:1 */
  AA_LARGE: 3.0,
  /** Nivel AAA para texto normal: 7:1 */
  AAA_NORMAL: 7.0,
  /** Nivel AAA para texto grande: 4.5:1 */
  AAA_LARGE: 4.5,
  /** Contraste para elementos no textuales: 3:1 */
  NON_TEXT: 3.0,
} as const;
