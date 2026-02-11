import type { WCAGLevel, WCAGPrinciple } from '@/shared/types/accessibility.js';
import { AUDIT_WCAG_MAP } from '@/tools/Lighthouse/types/lighthouse.maps.js';

export interface LighthouseAuditInfo {
  auditId: string;
  title: string;
  description: string;
  wcagCriterion: string;
  wcagLevel: WCAGLevel;
  wcagPrinciple: WCAGPrinciple;
}

const AUDIT_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  'color-contrast': {
    title: 'Contraste de color',
    description: 'Los colores de fondo y primer plano no tienen una relación de contraste suficiente.',
  },
  'image-alt': {
    title: 'Texto alternativo en imágenes',
    description: 'Los elementos <img> deben tener un atributo alt con texto descriptivo.',
  },
  'input-image-alt': {
    title: 'Texto alternativo en input de imagen',
    description: 'Los elementos <input type="image"> deben tener texto alternativo.',
  },
  'area-alt': {
    title: 'Texto alternativo en áreas',
    description: 'Los elementos <area> de mapas de imagen deben tener texto alternativo.',
  },
  'object-alt': {
    title: 'Texto alternativo en objetos',
    description: 'Los elementos <object> deben tener texto alternativo.',
  },
  'document-title': {
    title: 'Título del documento',
    description: 'El documento debe tener un elemento <title> con contenido descriptivo.',
  },
  'html-has-lang': {
    title: 'Atributo lang en HTML',
    description: 'El elemento <html> debe tener un atributo lang válido.',
  },
  'html-lang-valid': {
    title: 'Valor válido de lang',
    description: 'El atributo lang del elemento <html> debe contener un código de idioma válido.',
  },
  'valid-lang': {
    title: 'Atributos lang válidos',
    description: 'Los atributos lang en elementos individuales deben contener códigos de idioma válidos.',
  },
  'meta-viewport': {
    title: 'Meta viewport',
    description: 'El meta viewport no debe deshabilitar el zoom del usuario con maximum-scale o user-scalable=no.',
  },
  'meta-refresh': {
    title: 'Meta refresh',
    description: 'El documento no debe usar <meta http-equiv="refresh"> para redirección temporizada.',
  },
  'bypass': {
    title: 'Saltar bloques de contenido',
    description: 'La página debe proporcionar mecanismos para saltar bloques de contenido repetido (skip links, landmarks).',
  },
  'link-name': {
    title: 'Nombre accesible de enlaces',
    description: 'Los enlaces deben tener texto discernible que describa su propósito.',
  },
  'button-name': {
    title: 'Nombre accesible de botones',
    description: 'Los botones deben tener texto accesible que describa su función.',
  },
  'frame-title': {
    title: 'Título de frames',
    description: 'Los elementos <frame> e <iframe> deben tener un atributo title descriptivo.',
  },
  'label': {
    title: 'Etiquetas de formularios',
    description: 'Los campos de formulario deben tener etiquetas <label> asociadas.',
  },
  'form-field-multiple-labels': {
    title: 'Múltiples etiquetas en campo',
    description: 'Los campos de formulario no deben tener múltiples etiquetas <label> asociadas.',
  },
  'list': {
    title: 'Estructura de listas',
    description: 'Los elementos <ul> y <ol> solo deben contener elementos <li>, <script> o <template>.',
  },
  'listitem': {
    title: 'Elementos de lista',
    description: 'Los elementos <li> deben estar contenidos dentro de <ul> o <ol>.',
  },
  'definition-list': {
    title: 'Listas de definición',
    description: 'Los elementos <dl> solo deben contener <dt>, <dd>, <div>, <script> o <template>.',
  },
  'dlitem': {
    title: 'Elementos de definición',
    description: 'Los elementos <dt> y <dd> deben estar contenidos dentro de un <dl>.',
  },
  'td-headers-attr': {
    title: 'Atributos headers en celdas',
    description: 'Las celdas con atributo headers deben referenciar celdas de encabezado existentes en la misma tabla.',
  },
  'th-has-data-cells': {
    title: 'Encabezados con celdas de datos',
    description: 'Los elementos <th> en tablas de datos deben tener celdas de datos asociadas.',
  },
  'heading-order': {
    title: 'Orden de encabezados',
    description: 'Los encabezados deben seguir un orden jerárquico secuencial sin saltar niveles.',
  },
  'tabindex': {
    title: 'Uso de tabindex',
    description: 'Ningún elemento debe tener un tabindex mayor que 0 para no alterar el orden natural de navegación.',
  },
  'accesskeys': {
    title: 'Teclas de acceso únicas',
    description: 'Los valores del atributo accesskey deben ser únicos para evitar conflictos de navegación.',
  },
  'duplicate-id-active': {
    title: 'IDs duplicados en elementos activos',
    description: 'Los elementos activos (focusables) no deben compartir el mismo atributo id.',
  },
  'duplicate-id-aria': {
    title: 'IDs duplicados en referencias ARIA',
    description: 'Los IDs referenciados por atributos ARIA deben ser únicos.',
  },
  'aria-allowed-attr': {
    title: 'Atributos ARIA permitidos',
    description: 'Los atributos ARIA deben ser válidos para el rol del elemento.',
  },
  'aria-required-attr': {
    title: 'Atributos ARIA requeridos',
    description: 'Los elementos con roles ARIA deben tener todos los atributos requeridos por ese rol.',
  },
  'aria-required-children': {
    title: 'Hijos ARIA requeridos',
    description: 'Los elementos con roles ARIA que requieren hijos específicos deben contenerlos.',
  },
  'aria-required-parent': {
    title: 'Padre ARIA requerido',
    description: 'Los elementos con roles ARIA que requieren un padre específico deben estar contenidos en él.',
  },
  'aria-roles': {
    title: 'Roles ARIA válidos',
    description: 'Los valores del atributo role deben ser roles ARIA válidos.',
  },
  'aria-valid-attr': {
    title: 'Atributos ARIA válidos',
    description: 'Los atributos ARIA deben ser atributos válidos y no estar mal escritos.',
  },
  'aria-valid-attr-value': {
    title: 'Valores ARIA válidos',
    description: 'Los atributos ARIA deben tener valores válidos según su especificación.',
  },
  'aria-hidden-body': {
    title: 'ARIA hidden en body',
    description: 'El elemento <body> no debe tener aria-hidden="true", ya que oculta todo el contenido.',
  },
  'aria-hidden-focus': {
    title: 'Foco en elementos ARIA hidden',
    description: 'Los elementos con aria-hidden="true" no deben contener elementos focusables.',
  },
  'font-size': {
    title: 'Tamaño de fuente legible',
    description: 'El documento debe usar tamaños de fuente legibles (al menos 12px para texto principal).',
  },
  'tap-targets': {
    title: 'Tamaño de áreas táctiles',
    description: 'Los elementos interactivos deben tener un tamaño suficiente para interacción táctil.',
  },
  'video-caption': {
    title: 'Subtítulos en video',
    description: 'Los elementos <video> deben tener un track de subtítulos.',
  },
  'video-description': {
    title: 'Audiodescripción en video',
    description: 'Los elementos <video> deben tener un track de audiodescripción.',
  },
};

function buildAuditCatalog(): Record<string, LighthouseAuditInfo> {
  const catalog: Record<string, LighthouseAuditInfo> = {};

  for (const [auditId, mapping] of Object.entries(AUDIT_WCAG_MAP)) {
    const meta = AUDIT_DESCRIPTIONS[auditId];
    catalog[auditId] = {
      auditId,
      title: meta?.title ?? auditId,
      description: meta?.description ?? '',
      wcagCriterion: mapping.wcagCriterion,
      wcagLevel: mapping.wcagLevel,
      wcagPrinciple: mapping.wcagPrinciple,
    };
  }

  return catalog;
}

const LIGHTHOUSE_AUDIT_CATALOG = buildAuditCatalog();

export function getAllAudits(): LighthouseAuditInfo[] {
  return Object.values(LIGHTHOUSE_AUDIT_CATALOG);
}

export function getAuditById(auditId: string): LighthouseAuditInfo | undefined {
  return LIGHTHOUSE_AUDIT_CATALOG[auditId];
}

export function getAuditsByLevel(level: WCAGLevel): LighthouseAuditInfo[] {
  return Object.values(LIGHTHOUSE_AUDIT_CATALOG).filter(
    (audit) => audit.wcagLevel === level
  );
}

export function getAuditsByPrinciple(principle: WCAGPrinciple): LighthouseAuditInfo[] {
  return Object.values(LIGHTHOUSE_AUDIT_CATALOG).filter(
    (audit) => audit.wcagPrinciple === principle
  );
}

export function getAllAuditIds(): string[] {
  return Object.keys(LIGHTHOUSE_AUDIT_CATALOG);
}
