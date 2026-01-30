# Estructura de Tools - AccessibilityHub

Esta regla define la estructura modular que deben seguir todas las herramientas (tools) del proyecto.

## Estructura General del Proyecto

```
src/
├── server.ts
└── tools/
    ├── index.ts
    ├── AnalyzeAll/
    ├── Axe/
    ├── Base/
    ├── Contrast/
    └── Pa11y/
```

## Estructura Interna de Cada Tool

Cada tool debe seguir esta estructura de carpetas:

```
ToolName/
├── index.ts           # Punto de entrada que exporta la funcionalidad pública
├── main.ts            # Lógica principal de la tool (registro MCP, handlers)
├── adapters/          # Adaptadores para integración con librerías externas
│   └── index.ts
├── data/              # Datos estáticos (JSON, configuraciones)
│   └── index.ts
├── normalizers/       # Normalizadores de datos de entrada/salida
│   └── index.ts
├── types/             # Tipos e interfaces TypeScript específicos de la tool
│   └── index.ts
└── utils/             # Utilidades y helpers específicos de la tool
    └── index.ts
```

## Tools Disponibles

| Tool | Descripción |
|------|-------------|
| **AnalyzeAll** | Ejecuta análisis completo combinando múltiples herramientas |
| **Axe** | Análisis de accesibilidad usando axe-core |
| **Base** | Clase base y utilidades compartidas entre tools |
| **Contrast** | Análisis de contraste de colores |
| **Pa11y** | Análisis de accesibilidad usando Pa11y |

> **Nota**: La tool ESLint ha sido descontinuada y no debe utilizarse.

## Convenciones de Nomenclatura

### Carpetas
- Las carpetas de tools usan **PascalCase**: `AnalyzeAll`, `Axe`, `Pa11y`
- Las subcarpetas internas usan **kebab-case**: `adapters`, `normalizers`, `types`, `utils`, `data`

### Archivos
- Los archivos TypeScript usan **kebab-case**: `main.ts`, `index.ts`
- Cada subcarpeta debe tener un `index.ts` que exporte su contenido público
- Los archivos de datos JSON usan **kebab-case**: `wcag-criteria.json`

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

## Migración desde Estructura Anterior

Al migrar código existente:

1. Mover el contenido de `src/tools/[tool].ts` → `src/tools/[Tool]/main.ts`
2. Mover el contenido de `src/adapters/[tool].ts` → `src/tools/[Tool]/adapters/`
3. Mover el contenido de `src/normalizers/[tool].ts` → `src/tools/[Tool]/normalizers/`
4. Mover types relacionados de `src/types/` → `src/tools/[Tool]/types/`
5. Mover utils relacionados de `src/utils/` → `src/tools/[Tool]/utils/`
6. Mover data relacionada de `src/data/` → `src/tools/[Tool]/data/`
