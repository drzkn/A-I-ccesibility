# Create Tool

Crea una nueva herramienta de accesibilidad siguiendo la estructura definida en el proyecto.

## Nombre de la herramienta

{{toolName}}

---

## Instrucciones

Crea una nueva tool llamada **{{toolName}}** siguiendo la estructura modular del proyecto AccessibilityHub.

### Estructura a crear

Crea la siguiente estructura de carpetas y archivos en `src/tools/{{toolName}}/`:

```
{{toolName}}/
├── index.ts
├── main.ts
├── adapters/
│   ├── {{toolNameLower}}.adapter.ts
│   └── index.ts
├── normalizers/
│   ├── {{toolNameLower}}.normalizer.ts
│   └── index.ts
├── types/
│   ├── {{toolNameLower}}.types.ts
│   └── index.ts
└── utils/
    ├── {{toolNameLower}}.utils.ts
    └── index.ts
```

> **Nota:** `{{toolNameLower}}` es el nombre de la tool en minúsculas y kebab-case (ej: `AnalyzeMixed` → `analyze-mixed`).

### Convención de archivos

- Usar `toolname.categoria.ts` (punto como separador entre nombre y categoría)
- `index.ts` solo re-exporta, nunca contiene lógica
- Si se necesitan múltiples archivos en una subcarpeta, usar nombres descriptivos (ej: `color-analysis.ts`, `contrast.ts`)

### Contenido de cada archivo

#### `index.ts` (punto de entrada)

```typescript
export * from './main.js';
export * from './types/index.js';
```

#### `main.ts` (lógica principal)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function register{{toolName}}Tool(server: McpServer): void {
}
```

#### `adapters/{{toolNameLower}}.adapter.ts`

```typescript
```

#### `adapters/index.ts`

```typescript
export * from './{{toolNameLower}}.adapter.js';
```

#### `normalizers/{{toolNameLower}}.normalizer.ts`

```typescript
```

#### `normalizers/index.ts`

```typescript
export * from './{{toolNameLower}}.normalizer.js';
```

#### `types/{{toolNameLower}}.types.ts`

```typescript
```

#### `types/index.ts`

```typescript
export * from './{{toolNameLower}}.types.js';
```

#### `utils/{{toolNameLower}}.utils.ts`

```typescript
```

#### `utils/index.ts`

```typescript
export * from './{{toolNameLower}}.utils.js';
```

### Pasos adicionales

1. Crea todos los archivos y carpetas indicados
2. Verifica que la estructura sigue las convenciones de nomenclatura (carpeta en PascalCase, archivos en kebab-case)
3. Confirma que cada `index.ts` solo re-exporta y no contiene lógica
4. Muestra un resumen de los archivos creados

### Referencia

Sigue la regla definida en `.cursor/rules/tools_structure.md` para mantener la consistencia del proyecto.
