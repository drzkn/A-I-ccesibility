export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const WCAG_THRESHOLDS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
  NON_TEXT: 3.0,
} as const;

export type ContrastAlgorithm = 'WCAG21' | 'APCA';

export const APCA_THRESHOLDS = {
  BODY_TEXT: 75,
  LARGE_TEXT: 60,
  NON_TEXT: 45,
} as const;
