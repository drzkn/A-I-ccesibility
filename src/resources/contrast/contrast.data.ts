import {
  WCAG_THRESHOLDS,
  APCA_THRESHOLDS,
  type ContrastAlgorithm
} from '@/tools/Contrast/types/colorAnalysis.type.js';

export interface ContrastThreshold {
  ratio: number;
  description: string;
}

export interface WCAGThresholds {
  AA_NORMAL: ContrastThreshold;
  AA_LARGE: ContrastThreshold;
  AAA_NORMAL: ContrastThreshold;
  AAA_LARGE: ContrastThreshold;
  NON_TEXT: ContrastThreshold;
}

export interface APCAThresholds {
  BODY_TEXT: ContrastThreshold;
  LARGE_TEXT: ContrastThreshold;
  NON_TEXT: ContrastThreshold;
}

export interface AlgorithmInfo {
  id: ContrastAlgorithm;
  name: string;
  description: string;
  standard: string;
  thresholdUri: string;
}

export function getWCAG21Thresholds(): WCAGThresholds {
  return {
    AA_NORMAL: {
      ratio: WCAG_THRESHOLDS.AA_NORMAL,
      description: 'Texto normal (< 18pt o < 14pt negrita)'
    },
    AA_LARGE: {
      ratio: WCAG_THRESHOLDS.AA_LARGE,
      description: 'Texto grande (>= 18pt o >= 14pt negrita)'
    },
    AAA_NORMAL: {
      ratio: WCAG_THRESHOLDS.AAA_NORMAL,
      description: 'Contraste mejorado para texto normal'
    },
    AAA_LARGE: {
      ratio: WCAG_THRESHOLDS.AAA_LARGE,
      description: 'Contraste mejorado para texto grande'
    },
    NON_TEXT: {
      ratio: WCAG_THRESHOLDS.NON_TEXT,
      description: 'Componentes de UI y objetos gráficos'
    }
  };
}

export function getAPCAThresholds(): APCAThresholds {
  return {
    BODY_TEXT: {
      ratio: APCA_THRESHOLDS.BODY_TEXT,
      description: 'Texto de cuerpo (lectura fluida)'
    },
    LARGE_TEXT: {
      ratio: APCA_THRESHOLDS.LARGE_TEXT,
      description: 'Texto grande (encabezados, títulos)'
    },
    NON_TEXT: {
      ratio: APCA_THRESHOLDS.NON_TEXT,
      description: 'Elementos no textuales (iconos, bordes)'
    }
  };
}

export function getAlgorithms(): AlgorithmInfo[] {
  return [
    {
      id: 'WCAG21',
      name: 'WCAG 2.1 Contrast Ratio',
      description: 'Algoritmo estándar de ratio de contraste definido en WCAG 2.1. Calcula la relación de luminancia relativa entre dos colores.',
      standard: 'WCAG 2.1 Success Criterion 1.4.3 / 1.4.6',
      thresholdUri: 'contrast://thresholds/wcag21'
    },
    {
      id: 'APCA',
      name: 'Advanced Perceptual Contrast Algorithm',
      description: 'Algoritmo avanzado que considera la percepción visual humana de manera más precisa. Propuesto para WCAG 3.0, tiene en cuenta la polaridad del texto y el tamaño.',
      standard: 'WCAG 3.0 (Draft)',
      thresholdUri: 'contrast://thresholds/apca'
    }
  ];
}

export function getAlgorithmById(id: ContrastAlgorithm): AlgorithmInfo | undefined {
  return getAlgorithms().find(algo => algo.id === id);
}
