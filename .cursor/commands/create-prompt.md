# Create Prompt

Crea un nuevo prompt MCP siguiendo la estructura definida en el proyecto.

## Nombre del prompt

{{promptName}}

## Categoría

{{category}}

---

## Instrucciones

Crea un nuevo prompt llamado **{{promptName}}** en la categoría **{{category}}** siguiendo la estructura del proyecto AccessibilityHub.

### Categorías existentes

- `audit` – Auditorías de accesibilidad
- `contrast` – Análisis de contraste
- `educational` – Contenido educativo (ej. criterios WCAG)
- `workflows` – Flujos de trabajo (pre-deploy, informes, etc.)

Si **{{category}}** no existe, crea la carpeta `src/prompts/{{category}}/` y un `index.ts` que exporte el nuevo prompt.

### Estructura a crear

Añade el archivo del prompt en `src/prompts/{{category}}/`:

```
{{category}}/
├── index.ts                    (actualizar: añadir export del nuevo prompt)
└── {{promptNameKebab}}.ts      (nuevo)
```

> **Nota:** `{{promptNameKebab}}` es el nombre del prompt en kebab-case (ej: `fullAccessibilityAudit` → `full-accessibility-audit`).

### Convención de archivos

- Un archivo por prompt: `nombre-del-prompt.ts`
- El nombre interno del prompt (campo `name`) debe ser kebab-case y coincidir con el nombre del archivo sin extensión
- Usar `PromptDefinition` y `PromptResult` de `../types/index.js`
- Definir argumentos con Zod en `argsSchema`

### Contenido del archivo del prompt

#### `{{promptNameKebab}}.ts`

```typescript
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to analyze'),
};

type {{promptNamePascal}}Args = {
  url: string;
  language?: string | undefined;
};

export const {{promptNameCamel}}Prompt: PromptDefinition = {
  name: '{{promptNameKebab}}',
  title: '{{promptTitle}}',
  description: '{{promptDescription}}',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async (args: {{promptNamePascal}}Args): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Instrucciones para el modelo usando los argumentos: ${JSON.stringify(args)}`
              }
            }
          ]
        };
      }
    );
  }
};
```

Ajusta `argsSchema`, `{{promptNamePascal}}Args`, `title`, `description` y el cuerpo del `text` según el propósito del prompt. Revisa `src/prompts/audit/full-accessibility-audit.ts` y `src/prompts/contrast/contrast-check.ts` como referencia.

### Exportación y registro

1. En `src/prompts/{{category}}/index.ts`, añade: `export { {{promptNameCamel}}Prompt } from './{{promptNameKebab}}.js';`
2. En `src/prompts/index.ts`, añade: `export { {{promptNameCamel}}Prompt } from './{{category}}/index.js';`
3. En `src/server.ts`, importa `{{promptNameCamel}}Prompt` desde `@/prompts/index.js`, añádelo al array `prompts` en `registerPrompts()` y al array `prompts` del log de inicio en `main()`.

### Pasos adicionales

1. Crea el archivo del prompt y actualiza los `index.ts` y `server.ts` como se indica
2. Verifica que el nombre del prompt es kebab-case y que los tipos y Zod coinciden con los argumentos usados en el handler
3. Confirma que cada `index.ts` solo re-exporta
4. Muestra un resumen de los archivos creados o modificados

### Referencia

- Prompts de auditoría: `src/prompts/audit/`
- Prompts con argumentos complejos: `src/prompts/contrast/contrast-check.ts`
- Tipos: `src/prompts/types/prompt.types.ts`
