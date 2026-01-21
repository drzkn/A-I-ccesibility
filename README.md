# AI-ccesibility

Servidor MCP para orquestación de herramientas de accesibilidad web (axe-core, Pa11y, eslint-plugin-vuejs-accessibility).

## 📑 Índice

- [📚 Documentación](#-documentación)
- [Herramientas Disponibles](#herramientas-disponibles)
  - [analyze-with-axe](#analyze-with-axe)
  - [analyze-with-pa11y](#analyze-with-pa11y)
  - [analyze-with-eslint](#analyze-with-eslint)
  - [analyze-all ⭐](#analyze-all-)
- [Contexto Humano Enriquecido ✨](#contexto-humano-enriquecido-)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts](#scripts)
- [Instalación](#instalación)
- [Configuración en Clientes MCP](#configuración-en-clientes-mcp)
  - [Claude Desktop](#claude-desktop)
  - [Cursor](#cursor)
  - [Windsurf](#windsurf)
  - [Claude Code](#claude-code)
- [Uso](#uso)
  - [Desarrollo Local](#desarrollo-local)
- [Configuración](#configuración)
- [Requisitos](#requisitos)
- [Dependencias Principales](#dependencias-principales)

## 📚 Documentación

- **[USAGE.md](./USAGE.md)** - Guía completa de uso, workflows y prompts efectivos
- **[EXAMPLES.md](./EXAMPLES.md)** - Ejemplos concretos de inputs/outputs para cada herramienta

## Herramientas Disponibles

### `analyze-with-axe`

Analiza una página web o contenido HTML para detectar problemas de accesibilidad usando axe-core.

**Parámetros:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `url` | string | url o html | URL de la página a analizar |
| `html` | string | url o html | Contenido HTML raw a analizar |
| `options.wcagLevel` | "A" \| "AA" \| "AAA" | No | Nivel WCAG a verificar (default: AA) |
| `options.rules` | string[] | No | IDs de reglas axe específicas a ejecutar |
| `options.excludeRules` | string[] | No | IDs de reglas axe a excluir |
| `options.includeIncomplete` | boolean | No | Incluir resultados "needs-review" (default: false) |
| `options.browser.waitForSelector` | string | No | Selector CSS a esperar antes del análisis |
| `options.browser.viewport` | object | No | Dimensiones del viewport |

**Ejemplo de respuesta:**

```json
{
  "success": true,
  "target": "https://example.com",
  "issueCount": 3,
  "issues": [
    {
      "id": "axe-0",
      "ruleId": "image-alt",
      "tool": "axe-core",
      "severity": "critical",
      "wcag": {
        "criterion": "1.1.1",
        "level": "A",
        "principle": "perceivable"
      },
      "location": {
        "selector": "img",
        "snippet": "<img src=\"logo.png\">"
      },
      "message": "Images must have alternate text",
      "affectedUsers": ["screen-reader"]
    }
  ],
  "summary": {
    "total": 3,
    "bySeverity": { "critical": 1, "serious": 2, "moderate": 0, "minor": 0 }
  },
  "duration": 1234
}
```

### `analyze-with-pa11y`

Analiza una página web o contenido HTML usando Pa11y.

**Parámetros similares a axe**, con `options.standard` para elegir el estándar WCAG (WCAG2AA, WCAG21AA, etc.).

### `analyze-with-eslint`

Analiza archivos Vue.js para problemas de accesibilidad mediante análisis estático.

**Parámetros:**
- `files`: Array de rutas de archivos .vue
- `directory`: Directorio a analizar recursivamente
- `code`: Código Vue inline a analizar

### `analyze-all` ⭐

**Tool de síntesis para análisis web** que ejecuta axe-core y Pa11y en paralelo y combina los resultados.

**Parámetros:**
- `url` o `html`: Target web a analizar (requerido)
- `tools`: Array de tools a ejecutar (default: `['axe-core', 'pa11y']`)
- `options.deduplicateResults`: Eliminar issues duplicados (default: `true`)
- `options.wcagLevel`: Nivel WCAG (default: `'AA'`)

**Respuesta incluye:**
- `issues`: Issues combinados y deduplicados
- `issuesByWCAG`: Issues agrupados por criterio WCAG
- `summary.byTool`: Conteo de issues por herramienta
- `individualResults`: Resultados completos de cada tool
- `deduplicatedCount`: Número de duplicados eliminados

**Nota:** Para análisis de código Vue, usa `analyze-with-eslint` por separado. Esta herramienta está especializada en análisis web dinámico.

## Contexto Humano Enriquecido ✨

Todos los issues incluyen automáticamente:

- **Descripción expandida** del criterio WCAG violado
- **Impacto en usuarios reales** con ejemplos concretos
- **Usuarios afectados** (screen-reader, keyboard-only, low-vision, etc.)
- **Prioridad de remediación** (critical, high, medium, low)
- **Esfuerzo de corrección** (low, medium, high)
- **Soluciones sugeridas** paso a paso

Ejemplo de issue enriquecido:
```json
{
  "ruleId": "image-alt",
  "severity": "serious",
  "humanContext": "**Contenido no textual (WCAG 1.1.1 - Nivel A)**\n\nLos usuarios de lectores de pantalla...",
  "suggestedActions": ["Añadir atributo alt descriptivo a imágenes", ...],
  "affectedUsers": ["screen-reader", "low-vision"],
  "priority": "critical",
  "remediationEffort": "low"
}
```

Los datos WCAG se mantienen en `src/data/wcag-criteria.json` y son fácilmente actualizables.

## Estructura del Proyecto

```
src/
├── server.ts           # Entry point MCP
├── data/
│   └── wcag-criteria.json  # Base de conocimiento WCAG (10 criterios)
├── adapters/
│   ├── base.ts         # Clase base para adaptadores
│   ├── axe.ts          # Adaptador axe-core con Puppeteer
│   ├── pa11y.ts        # Adaptador Pa11y
│   └── eslint.ts       # Adaptador ESLint Vue a11y
├── tools/
│   ├── base.ts         # Utilidades para tools MCP
│   ├── axe.ts          # Tool analyze-with-axe
│   ├── pa11y.ts        # Tool analyze-with-pa11y
│   ├── eslint.ts       # Tool analyze-with-eslint
│   └── analyze-all.ts  # Tool de síntesis multi-herramienta
├── types/              # Schemas Zod (inputs, outputs, validación)
├── normalizers/        # Transformación a formato unificado
└── utils/              # Logger, contexto WCAG

tests/
├── adapters/           # Tests unitarios de adaptadores
├── tools/              # Tests de integración de tools
├── fixtures/           # HTML con problemas de accesibilidad conocidos
└── helpers/            # Utilidades para tests (mock server, etc.)
```

## Scripts

```bash
pnpm build          # Compila a dist/
pnpm dev            # Watch mode
pnpm typecheck      # Verifica tipos
pnpm start          # Levanta servidor
pnpm format         # Formatea código con Prettier
pnpm format:check   # Verifica formato
pnpm test           # Ejecuta tests
pnpm test:watch     # Tests en modo watch
pnpm test:coverage  # Tests con reporte de cobertura
pnpm inspect.       # Lanzar el inspector de mcp para debuggear herramientas de mcp
```

## Instalación

```bash
npm install -g ai-ccesibility
```

O con pnpm:

```bash
pnpm add -g ai-ccesibility
```

## Configuración en Clientes MCP

### Claude Desktop

1. Abre el archivo de configuración:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Añade la configuración del servidor:

```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "npx",
      "args": ["-y", "ai-ccesibility"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Reinicia Claude Desktop

### Cursor

#### Instalación rápida con un clic

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=AI-ccesibility&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImFpLWNjZXNpYmlsaXR5Il19Cg%3D%3D)

#### Instalación manual

1. Crea o edita el archivo `.cursor/mcp.json` en tu directorio de trabajo

2. Añade la configuración:

```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "npx",
      "args": ["-y", "ai-ccesibility"]
    }
  }
}
```

3. Reinicia Cursor

### Windsurf

1. Abre el archivo de configuración:
   - **macOS**: `~/Library/Application Support/Windsurf/mcp_config.json`
   - **Windows**: `%APPDATA%\Windsurf\mcp_config.json`
   - **Linux**: `~/.config/Windsurf/mcp_config.json`

2. Añade la configuración del servidor:

```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "npx",
      "args": ["-y", "ai-ccesibility"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Reinicia Windsurf

### Claude Code

1. Abre el archivo de configuración:
   - **macOS**: `~/Library/Application Support/Code/User/globalStorage/anthropic.claude-code/settings/cline_mcp_settings.json`
   - **Windows**: `%APPDATA%\Code\User\globalStorage\anthropic.claude-code\settings\cline_mcp_settings.json`
   - **Linux**: `~/.config/Code/User/globalStorage/anthropic.claude-code/settings/cline_mcp_settings.json`

2. Añade la configuración del servidor:

```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "npx",
      "args": ["-y", "ai-ccesibility"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Reinicia VS Code o recarga la ventana (Cmd/Ctrl + Shift + P → "Developer: Reload Window")

## Uso

Una vez configurado, puedes usar prompts como:

- "Analiza la accesibilidad de https://example.com con axe-core y Pa11y"
- "Revisa este HTML para problemas de accesibilidad: `<img src='foto.jpg'>`"
- "Analiza los archivos Vue en src/components/ para problemas de accesibilidad" (usa analyze-with-eslint)
- "Compara los resultados de axe-core y Pa11y en mi landing page" (usa analyze-all)

### Desarrollo Local

Si estás desarrollando o contribuyendo al proyecto, puedes usar rutas locales en lugar de npx:

**Claude Desktop / Windsurf / Claude Code**:
```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "node",
      "args": ["<RUTA_AL_PROYECTO>/dist/server.js"],
      "env": {
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

**Cursor**:
```json
{
  "mcpServers": {
    "ai-ccesibility": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "<RUTA_AL_PROYECTO>"
    }
  }
}
```

> 💡 **Tip**: Recuerda ejecutar `pnpm build` cada vez que hagas cambios en el código para que se reflejen en el servidor.

## Configuración

| Variable    | Default | Descripción                      |
|-------------|---------|----------------------------------|
| `LOG_LEVEL` | `info`  | `debug`, `info`, `warn`, `error` |

## Requisitos

- Node.js ≥ 20
- pnpm
- Chrome/Chromium (descargado automáticamente por Puppeteer)

## Dependencias Principales

- `@modelcontextprotocol/sdk` - SDK para servidores MCP
- `puppeteer` - Control de navegador headless
- `@axe-core/puppeteer` - Integración axe-core con Puppeteer
- `axe-core` - Motor de análisis de accesibilidad
- `pa11y` - Herramienta de testing de accesibilidad
- `eslint` + `eslint-plugin-vuejs-accessibility` - Linting estático de Vue.js
- `zod` - Validación de schemas
- `pino` - Logging estructurado
