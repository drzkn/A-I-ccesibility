# Create Resource

Crea un nuevo recurso MCP siguiendo la estructura definida en el proyecto.

## Nombre del recurso

{{resourceName}}

> Para la función de registro (ej. `registerWcagResources`) usa PascalCase en **resourceName** si hace falta (ej. `Wcag`). **resourceNameLower** debe ser kebab-case para la carpeta y archivos (ej. `wcag`, `my-resource`).

---

## Instrucciones

Crea un nuevo recurso llamado **{{resourceName}}** siguiendo la estructura modular del proyecto AccessibilityHub.

### Estructura a crear

Crea la siguiente estructura de carpetas y archivos en `src/resources/{{resourceNameLower}}/`:

```
{{resourceNameLower}}/
├── index.ts
├── {{resourceNameLower}}.resources.ts
└── {{resourceNameLower}}.data.ts
```

> **Nota:** `{{resourceNameLower}}` es el nombre del recurso en minúsculas y kebab-case (ej: `Wcag` → `wcag`, `MyResource` → `my-resource`).

### Convención de archivos

- Usar `resourcename.resources.ts` para el registro en el servidor MCP
- Usar `resourcename.data.ts` para datos estáticos o funciones de obtención de datos (si el recurso solo expone datos dinámicos o URIs con plantilla, el archivo `.data.ts` puede contener solo tipos o estar vacío inicialmente)
- `index.ts` solo re-exporta, nunca contiene lógica

### Contenido de cada archivo

#### `index.ts` (punto de entrada)

```typescript
export { register{{resourceName}}Resources } from './{{resourceNameLower}}.resources.js';
export * from './{{resourceNameLower}}.data.js';
```

Ajusta el segundo export según lo que expongas en `.data.ts` (funciones, tipos); si no hay nada público, omite esa línea.

#### `{{resourceNameLower}}.resources.ts`

```typescript
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function register{{resourceName}}Resources(server: McpServer): void {
  server.registerResource(
    '{{resourceNameLower}}-unique-id',
    '{{resourceNameLower}}://path',
    {
      description: 'Descripción del recurso',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: '{{resourceNameLower}}://path',
        mimeType: 'application/json',
        text: JSON.stringify({ }, null, 2)
      }]
    })
  );
}
```

Para recursos con URI con variables usa `ResourceTemplate` (ver `src/resources/wcag/wcag.resources.ts`). Para recursos estáticos sin parámetros sigue el patrón de `src/resources/contrast/contrast.resources.ts`.

#### `{{resourceNameLower}}.data.ts`

```typescript
export function getData(): unknown {
  return { };
}
```

Define aquí los datos estáticos y las funciones que consumirá `.resources.ts`. Si no hay datos, exporta tipos o deja funciones vacías hasta implementar.

### Pasos adicionales

1. Crea todos los archivos y carpetas indicados
2. Añade en `src/resources/index.ts` la línea: `export { register{{resourceName}}Resources } from './{{resourceNameLower}}/index.js';`
3. En `src/server.ts`, importa `register{{resourceName}}Resources` desde `@/resources/index.js`, llámalo dentro de `registerResources()` y añade un `logger.info('Registered {{resourceNameLower}} resources');`
4. Verifica que la estructura sigue las convenciones (carpeta en kebab-case, archivos `resourcename.resources.ts` y `resourcename.data.ts`)
5. Muestra un resumen de los archivos creados y los puntos de registro tocados

### Referencia

- Recurso con URIs estáticas: `src/resources/contrast/`
- Recurso con plantillas de URI (ResourceTemplate): `src/resources/wcag/`
- Tipos compartidos: `src/resources/types/resource.types.ts`
