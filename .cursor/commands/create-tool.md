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
│   └── index.ts
├── data/
│   └── index.ts
├── normalizers/
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    └── index.ts
```

### Contenido de cada archivo

#### `index.ts` (punto de entrada)

```typescript
export * from './main';
export * from './types';
```

#### `main.ts` (lógica principal)

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function register{{toolName}}Tool(server: McpServer): void {
  // TODO: Implementar registro de la tool
}
```

#### `adapters/index.ts`

```typescript
// Adaptadores para integración con librerías externas
```

#### `data/index.ts`

```typescript
// Datos estáticos y configuraciones
```

#### `normalizers/index.ts`

```typescript
// Normalizadores de datos de entrada/salida
```

#### `types/index.ts`

```typescript
// Tipos e interfaces específicos de {{toolName}}
```

#### `utils/index.ts`

```typescript
// Utilidades y helpers específicos de {{toolName}}
```

### Pasos adicionales

1. Crea todos los archivos y carpetas indicados
2. Verifica que la estructura sigue las convenciones de nomenclatura (carpeta en PascalCase)
3. Confirma que el archivo `index.ts` exporta correctamente el módulo
4. Muestra un resumen de los archivos creados

### Referencia

Sigue la regla definida en `.cursor/rules/tools_structure.md` para mantener la consistencia del proyecto.
