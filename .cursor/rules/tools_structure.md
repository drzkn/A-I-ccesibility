# Estructura de Tools - AccessibilityHub

Esta regla define la estructura modular que deben seguir todas las herramientas (tools) del proyecto.

## Estructura Interna de Cada Tool

Cada tool debe seguir esta estructura de carpetas:

```
ToolName/
├── index.ts           # Punto de entrada que exporta la funcionalidad pública
├── main.ts            # Lógica principal de la tool (registro MCP, handlers)
├── adapters/          # Adaptadores para integración con librerías externas
│   ├── toolname.adapter.ts
│   └── index.ts
├── data/              # Datos estáticos (JSON, configuraciones)
│   └── index.ts
├── normalizers/       # Normalizadores de datos de entrada/salida
│   ├── toolname.normalizer.ts
│   └── index.ts
├── types/             # Tipos e interfaces TypeScript específicos de la tool
│   ├── toolname.type.ts    # o múltiples archivos descriptivos
│   └── index.ts
└── utils/             # Utilidades y helpers específicos de la tool
    ├── toolname.utils.ts    # o múltiples archivos descriptivos
    └── index.ts
```

## Tools Disponibles

| Tool | Descripción |
|------|-------------|
| **AnalyzeMixed** | Ejecuta análisis completo combinando múltiples herramientas (axe-core + Pa11y) |
| **Axe** | Análisis de accesibilidad usando axe-core |
| **Base** | Clase base y utilidades compartidas entre tools |
| **Contrast** | Análisis de contraste de colores |
| **Pa11y** | Análisis de accesibilidad usando Pa11y |

## Convenciones de Nomenclatura

### Carpetas
- Las carpetas de tools usan **PascalCase**: `AnalyzeAll`, `Axe`, `Pa11y`
- Las subcarpetas internas usan **PascalCase**: `adapters`, `normalizers`, `types`, `utils`, `data`

### Archivos
- Los archivos TypeScript usan **kebab-case**: `main.ts`, `index.ts`
- Cada subcarpeta debe tener un `index.ts` que exporte su contenido público
- Los archivos de datos JSON usan **kebab-case**: `wcag-criteria.json`

### Convención de Archivos en Subcarpetas

- Usar `toolname.categoria.ts` (punto como separador entre nombre y categoría)
  - Ejemplos: `pa11y.adapter.ts`, `axe.types.ts`, `contrast.utils.ts`
- El archivo `index.ts` **solo re-exporta**, nunca contiene lógica
  - Ejemplo: `export * from './pa11y.adapter.js';`
- Cuando hay múltiples archivos relacionados, usar nombres descriptivos
  - Ejemplo en `utils/`: `parsers.ts`, `converters.ts`, `validators.ts`

## Responsabilidades de Cada Subcarpeta

### `main.ts`
- Contiene la lógica principal de la tool
- Registra la tool en el servidor MCP
- Define los handlers para las operaciones de la tool
- Importa y coordina el resto de módulos

### `adapters/`
- Wrappers para librerías externas (axe-core, pa11y, etc.)
- Abstrae la comunicación con servicios externos
- Maneja la inicialización y configuración de dependencias

### `data/`
- Archivos JSON con datos estáticos
- Configuraciones por defecto
- Catálogos (ej: criterios WCAG)

### `normalizers/`
- Transformación de datos de entrada al formato interno
- Transformación de resultados al formato de salida estándar
- Mapeo entre formatos de diferentes herramientas

### `types/`
- Interfaces y types específicos de la tool
- Enums relacionados con la tool
- Types de validación con Zod si aplica

### `utils/`
- Funciones helper específicas de la tool
- Utilidades de formateo
- Funciones puras reutilizables dentro de la tool

## Recursos Compartidos

Los recursos que son compartidos entre múltiples tools deben ubicarse en:
- `src/tools/Base/` - Para lógica base heredable
- O crear un módulo `src/shared/` para utilidades verdaderamente transversales

## Ejemplo de Imports

```typescript
// Desde main.ts de una tool
import { ToolAdapter } from './adapters';
import { normalizeResult } from './normalizers';
import { ToolConfig } from './types';
import { formatOutput } from './utils';
import { wcagCriteria } from './data';
```
