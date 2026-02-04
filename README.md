# AccesibilityHub

MCP Server for orchestrating web accessibility tools (axe-core, Pa11y).

## 📑 Table of Contents

- [📚 Documentation](#-documentation)
- [Available Tools](#available-tools)
  - [analyze-with-axe](#analyze-with-axe)
  - [analyze-with-pa11y](#analyze-with-pa11y)
  - [analyze-contrast](#analyze-contrast)
  - [analyze-mixed ⭐](#analyze-mixed-)
- [Available Prompts](#available-prompts)
  - [full-accessibility-audit](#full-accessibility-audit)
  - [quick-accessibility-check](#quick-accessibility-check)
  - [contrast-check](#contrast-check)
  - [pre-deploy-check](#pre-deploy-check)
  - [quick-wins-report](#quick-wins-report)
  - [explain-wcag-criterion](#explain-wcag-criterion)
- [Available Resources](#available-resources)
  - [WCAG Resources](#wcag-resources)
  - [Contrast Resources](#contrast-resources)
- [Enriched Human Context ✨](#enriched-human-context-)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Installation](#installation)
- [MCP Client Configuration](#mcp-client-configuration)
  - [Claude Desktop](#claude-desktop)
  - [Cursor](#cursor)
  - [Windsurf](#windsurf)
  - [Claude Code](#claude-code)
- [Usage](#usage)
  - [Local Development](#local-development)
- [Configuration](#configuration)
- [Requirements](#requirements)
- [Main Dependencies](#main-dependencies)
- [Support Me](#support-me)

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/theraaskin)
[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/raskreation)

## 📚 Documentation

- **[USAGE.md](./USAGE.md)** - Complete usage guide, workflows and effective prompts
- **[EXAMPLES.md](./EXAMPLES.md)** - Concrete input/output examples for each tool



## Available Tools

### `analyze-with-axe`

Analyzes a web page or HTML content to detect accessibility issues using axe-core.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | url or html | URL of the page to analyze |
| `html` | string | url or html | Raw HTML content to analyze |
| `options.wcagLevel` | "A" \| "AA" \| "AAA" | No | WCAG level to verify (default: AA) |
| `options.rules` | string[] | No | Specific axe rule IDs to run |
| `options.excludeRules` | string[] | No | Axe rule IDs to exclude |
| `options.includeIncomplete` | boolean | No | Include "needs-review" results (default: false) |
| `options.browser.waitForSelector` | string | No | CSS selector to wait for before analysis |
| `options.browser.viewport` | object | No | Viewport dimensions |

**Response example:**

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

Analyzes a web page or HTML content using Pa11y.

**Parameters similar to axe**, with `options.standard` to choose the WCAG standard (WCAG2AA, WCAG21AA, etc.).

### `analyze-contrast`

Analyzes a web page or HTML content to detect color contrast issues according to WCAG 2.1. Supports the standard WCAG 2.1 algorithm and the new APCA (WCAG 3.0 draft).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | url or html | URL of the page to analyze |
| `html` | string | url or html | Raw HTML content to analyze |
| `options.contrastAlgorithm` | "WCAG21" \| "APCA" | No | Contrast algorithm: WCAG21 (standard) or APCA (WCAG 3.0 draft - experimental). Default: WCAG21 |
| `options.wcagLevel` | "AA" \| "AAA" | No | WCAG level: AA (4.5:1 normal, 3:1 large) or AAA (7:1 normal, 4.5:1 large). Default: AA |
| `options.suggestFixes` | boolean | No | Suggest color fixes (default: true) |
| `options.includePassingElements` | boolean | No | Include passing elements in results (default: false) |
| `options.selector` | string | No | CSS selector to limit analysis to a specific element |
| `options.browser.waitForSelector` | string | No | CSS selector to wait for before analysis |
| `options.browser.viewport` | object | No | Viewport dimensions |
| `options.browser.ignoreHTTPSErrors` | boolean | No | Ignore SSL certificate errors (default: false) |

**Contrast algorithms:**

| Algorithm | Description | Thresholds |
|-----------|-------------|----------|
| **WCAG21** | Current standard. Uses relative luminance ratios. | AA: 4.5:1 (normal), 3:1 (large). AAA: 7:1 (normal), 4.5:1 (large) |
| **APCA** | WCAG 3.0 draft. Uses perceptual lightness (Lc). More accurate for text. | Body text: 75Lc, large text: 60Lc, non-text elements: 45Lc |

**Response example (WCAG21):**

```json
{
  "success": true,
  "target": "https://example.com",
  "wcagLevel": "AA",
  "issueCount": 2,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "tool": "contrast-analyzer",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "principle": "perceivable"
      },
      "location": {
        "selector": "p.subtitle",
        "snippet": "<p class=\"subtitle\">Sample text</p>"
      },
      "message": "Contrast ratio 3.2:1 does not meet AA requirements (4.5:1 required for normal text)",
      "contrastData": {
        "foreground": "rgb(150, 150, 150)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 3.2,
        "requiredRatio": 4.5,
        "isLargeText": false,
        "fontSize": 16,
        "fontWeight": 400,
        "suggestedFix": {
          "foreground": "#767676",
          "background": "#ffffff",
          "newRatio": 4.54
        }
      },
      "affectedUsers": ["low-vision", "color-blind"]
    }
  ],
  "summary": {
    "total": 15,
    "passing": 13,
    "failing": 2,
    "byTextSize": {
      "normalText": { "passing": 10, "failing": 2 },
      "largeText": { "passing": 3, "failing": 0 }
    }
  },
  "duration": 1543
}
```

**Response example (APCA):**

```json
{
  "success": true,
  "target": "https://example.com",
  "wcagLevel": "AA",
  "issueCount": 1,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "tool": "contrast-analyzer",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "principle": "perceivable",
        "title": "Contrast (APCA - WCAG 3.0 Draft)"
      },
      "location": {
        "selector": "p.subtitle",
        "snippet": "<p class=\"subtitle\">Sample text</p>"
      },
      "message": "APCA lightness 45.2Lc does not meet requirements (75Lc required for body text)",
      "contrastData": {
        "foreground": "rgb(150, 150, 150)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 45.2,
        "requiredRatio": 75,
        "isLargeText": false,
        "fontSize": 16,
        "fontWeight": 400,
        "suggestedFix": {
          "foreground": "#5a5a5a",
          "background": "#ffffff",
          "newRatio": 75.1
        }
      },
      "affectedUsers": ["low-vision", "color-blind"]
    }
  ],
  "summary": {
    "total": 15,
    "passing": 14,
    "failing": 1
  },
  "duration": 1234
}
```

**WCAG Criteria:**
- 1.4.3 Contrast (Minimum) - Level AA
- 1.4.6 Contrast (Enhanced) - Level AAA

**APCA (Accessible Perceptual Contrast Algorithm):**
- More accurate perceptual algorithm, part of the WCAG 3.0 draft
- Measures "lightness contrast" (Lc) instead of ratios
- Considers contrast direction (light text on dark vs dark text on light)
- Experimental: not yet an official standard

### `analyze-mixed` ⭐

**Synthesis tool for web analysis** that runs axe-core and Pa11y in parallel and combines the results.

**Parameters:**
- `url` or `html`: Web target to analyze (required)
- `tools`: Array of tools to run (default: `['axe-core', 'pa11y']`)
- `options.deduplicateResults`: Remove duplicate issues (default: `true`)
- `options.wcagLevel`: WCAG level (default: `'AA'`)

**Response includes:**
- `issues`: Combined and deduplicated issues
- `issuesByWCAG`: Issues grouped by WCAG criterion
- `summary.byTool`: Issue count by tool
- `individualResults`: Complete results from each tool
- `deduplicatedCount`: Number of duplicates removed

## Available Prompts

MCP Prompts are user-controlled templates that generate structured messages for accessibility workflows. Unlike tools (which the LLM executes), prompts are invoked directly by users from clients like Claude Desktop or Cursor.

### `full-accessibility-audit`

Comprehensive accessibility audit using axe-core and Pa11y with detailed remediation guidance.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to analyze |
| `wcagLevel` | "A" \| "AA" \| "AAA" | No | WCAG conformance level (default: AA) |

**What it provides:**
- Executive summary with issue breakdown by severity
- Issues grouped by WCAG principle (Perceivable, Operable, Understandable, Robust)
- Critical issues with real-world impact analysis
- Prioritized remediation plan with code examples

---

### `quick-accessibility-check`

Fast accessibility check using axe-core with summary of critical issues.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to analyze |

**What it provides:**
- Quick summary of total issues by severity
- Critical and serious issues with quick fix suggestions
- Recommendations for next steps

---

### `contrast-check`

Analyze color contrast accessibility issues using WCAG 2.1 or APCA algorithms with fix suggestions.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to analyze |
| `selector` | string | No | CSS selector to scope the analysis |
| `algorithm` | "WCAG21" \| "APCA" | No | Contrast algorithm (default: WCAG21) |
| `wcagLevel` | "AA" \| "AAA" | No | WCAG level for contrast requirements (default: AA) |
| `language` | string | No | Language for the output report |

**What it provides:**
- Contrast analysis summary with pass/fail statistics
- Detailed failing elements with current vs required ratios
- Suggested color fixes with CSS code snippets
- Implementation guide with best practices

---

### `pre-deploy-check`

Verify accessibility compliance before deploying to production.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to verify |

**What it provides:**
- Clear GO/NO-GO deployment decision
- Blocking issues that must be fixed before deployment
- Non-blocking issues for post-deployment
- WCAG 2.1 Level AA compliance summary
- Risk assessment and recommended actions

---

### `quick-wins-report`

Identify high-impact accessibility issues that require minimal effort to fix.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to analyze |

**What it provides:**
- Priority-ordered list of quick wins
- Impact and effort estimates for each issue
- Before/after code examples
- Copyable implementation checklist
- Estimated accessibility improvement after fixes

---

### `explain-wcag-criterion`

Get detailed explanation of a WCAG criterion with examples and remediation guidance.

**Arguments:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `criterion` | string | Yes | WCAG criterion ID (e.g., 1.1.1, 2.4.4, 1.4.3) |

**What it provides:**
- Deep dive into the criterion meaning and importance
- Code examples (before/after)
- Testing strategies (manual and automated)
- Common mistakes and how to avoid them
- Links to official WCAG documentation

---

## Available Resources

MCP Resources provide read-only data that clients can query directly. These are ideal for static reference information like WCAG criteria and contrast thresholds.

### WCAG Resources

| URI | Type | Description |
|-----|------|-------------|
| `wcag://criteria` | Static | List of all available WCAG 2.1 criteria |
| `wcag://criteria/{id}` | Template | Specific criterion by ID (e.g., `1.4.3`) |
| `wcag://criteria/level/{level}` | Template | Criteria by conformance level (A, AA, AAA) |
| `wcag://criteria/principle/{principle}` | Template | Criteria by POUR principle (perceivable, operable, understandable, robust) |

**Example response from `wcag://criteria/1.4.3`:**

```json
{
  "id": "1.4.3",
  "title": "Contrast (Minimum)",
  "level": "AA",
  "principle": "perceivable",
  "guideline": "1.4",
  "description": "The visual presentation of text and images of text has a contrast ratio of at least 4.5:1",
  "affectedUsers": ["low-vision", "color-blind"],
  "suggestedActions": ["Ensure text has sufficient contrast against background"]
}
```

### Contrast Resources

| URI | Type | Description |
|-----|------|-------------|
| `contrast://thresholds/wcag21` | Static | WCAG 2.1 contrast ratio thresholds |
| `contrast://thresholds/apca` | Static | APCA contrast thresholds (WCAG 3.0 draft) |
| `contrast://algorithms` | Static | Supported contrast algorithms with descriptions |

**Example response from `contrast://thresholds/wcag21`:**

```json
{
  "AA_NORMAL": { "ratio": 4.5, "description": "Normal text (< 18pt or < 14pt bold)" },
  "AA_LARGE": { "ratio": 3.0, "description": "Large text (>= 18pt or >= 14pt bold)" },
  "AAA_NORMAL": { "ratio": 7.0, "description": "Enhanced contrast for normal text" },
  "AAA_LARGE": { "ratio": 4.5, "description": "Enhanced contrast for large text" },
  "NON_TEXT": { "ratio": 3.0, "description": "UI components and graphical objects" }
}
```

**Example response from `contrast://algorithms`:**

```json
[
  {
    "id": "WCAG21",
    "name": "WCAG 2.1 Contrast Ratio",
    "description": "Standard contrast ratio algorithm defined in WCAG 2.1",
    "standard": "WCAG 2.1 Success Criterion 1.4.3 / 1.4.6",
    "thresholdUri": "contrast://thresholds/wcag21"
  },
  {
    "id": "APCA",
    "name": "Advanced Perceptual Contrast Algorithm",
    "description": "Advanced algorithm considering human visual perception more accurately",
    "standard": "WCAG 3.0 (Draft)",
    "thresholdUri": "contrast://thresholds/apca"
  }
]
```

---

## Enriched Human Context ✨

All issues automatically include:

- **Expanded description** of the violated WCAG criterion
- **Impact on real users** with concrete examples
- **Affected users** (screen-reader, keyboard-only, low-vision, etc.)
- **Remediation priority** (critical, high, medium, low)
- **Fix effort** (low, medium, high)
- **Suggested solutions** step by step

Enriched issue example:
```json
{
  "ruleId": "image-alt",
  "severity": "serious",
  "humanContext": "**Non-text content (WCAG 1.1.1 - Level A)**\n\nScreen reader users...",
  "suggestedActions": ["Add descriptive alt attribute to images", ...],
  "affectedUsers": ["screen-reader", "low-vision"],
  "priority": "critical",
  "remediationEffort": "low"
}
```

WCAG data is maintained in `src/shared/data/wcag-criteria.json` and is easily updatable.

## Project Structure

```
src/
├── server.ts              # MCP entry point
├── prompts/               # MCP Prompts (user-controlled templates)
│   ├── index.ts           # Re-exports of all prompts
│   ├── types/             # PromptDefinition, PromptResult
│   ├── audit/             # Audit prompts
│   │   ├── full-accessibility-audit.ts
│   │   └── quick-accessibility-check.ts
│   ├── contrast/          # Contrast prompts
│   │   └── contrast-check.ts
│   ├── workflows/         # Workflow prompts
│   │   ├── pre-deploy-check.ts
│   │   └── quick-wins-report.ts
│   └── educational/       # Educational prompts
│       └── explain-wcag-criterion.ts
├── resources/             # MCP Resources (read-only data)
│   ├── index.ts           # Re-exports of all resources
│   ├── types/             # ResourceDefinition types
│   ├── wcag/              # WCAG criteria resources
│   │   ├── wcag.resources.ts    # Resource registration
│   │   └── wcag.data.ts         # Data access functions
│   └── contrast/          # Contrast threshold resources
│       ├── contrast.resources.ts
│       └── contrast.data.ts
├── shared/                # Shared resources between tools
│   ├── adapters/          # Base adapter class
│   ├── data/              # WCAG knowledge base
│   │   └── wcag-criteria.json
│   ├── types/             # Shared types (accessibility, analysis)
│   └── utils/             # Common utilities
│       ├── logger.ts      # Structured logging
│       └── wcag-context.ts
└── tools/                 # MCP Tools (modular structure)
    ├── index.ts           # Re-exports of all tools
    ├── Base/              # Base utilities for tools
    │   ├── types/         # ToolDefinition, ToolResponse
    │   └── utils/         # createTextResponse, withToolContext
    ├── Axe/               # analyze-with-axe tool
    │   ├── adapters/      # AxeAdapter (puppeteer + axe-core)
    │   ├── types/         # Input/output schemas
    │   ├── utils/         # Specific utilities
    │   └── main.ts        # Tool definition
    ├── Pa11y/             # analyze-with-pa11y tool
    │   ├── adapters/      # Pa11yAdapter
    │   ├── normalizers/   # Results transformation
    │   ├── types/
    │   └── main.ts
    ├── Contrast/          # analyze-contrast tool
    │   ├── adapters/      # ContrastAdapter
    │   ├── types/         # Color and contrast types
    │   ├── utils/         # Contrast calculation, parsers, converters
    │   └── main.ts
    └── AnalyzeMixed/      # analyze-mixed tool (multi-tool)
        ├── types/
        ├── utils/         # Deduplication, WCAG grouping
        └── main.ts

tests/
├── fixtures/              # HTML with known accessibility issues
├── helpers/               # Test utilities (mock server, etc.)
├── setup.ts               # Global test configuration
├── resources/             # Resource tests
│   ├── wcag/
│   │   └── wcag.resources.test.ts
│   └── contrast/
│       └── contrast.resources.test.ts
└── tools/                 # Tests organized by tool
    ├── Axe/
    │   ├── adapters.test.ts
    │   └── main.test.ts
    └── Contrast/
        ├── adapters.test.ts
        └── utils/         # Color utility tests
```

## Scripts

```bash
pnpm build          # Compile to dist/
pnpm dev            # Watch mode
pnpm typecheck      # Type checking
pnpm start          # Start server
pnpm format         # Format code with Prettier
pnpm format:check   # Check formatting
pnpm test           # Run tests
pnpm test:watch     # Tests in watch mode
pnpm test:coverage  # Tests with coverage report
pnpm inspect        # Launch MCP inspector for debugging MCP tools
```

## Installation

```bash
npm install -g AccesibilityHub
```

Or with pnpm:

```bash
pnpm add -g AccesibilityHub
```

## MCP Client Configuration

### Claude Desktop

1. Open the configuration file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "AccesibilityHub": {
      "command": "npx",
      "args": ["-y", "AccesibilityHub"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Restart Claude Desktop

### Cursor

#### One-click quick installation

[<img src="https://cursor.com/deeplink/mcp-install-dark.svg" alt="Install in Cursor">](https://cursor.com/en/install-mcp?name=accessibility-hub&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImFjY2Vzc2liaWxpdHktaHViIl19)

#### Manual installation

1. Create or edit the `.cursor/mcp.json` file in your working directory

2. Add the configuration:

```json
{
  "mcpServers": {
    "AccesibilityHub": {
      "command": "npx",
      "args": ["-y", "AccesibilityHub"]
    }
  }
}
```

3. Restart Cursor

### Windsurf

1. Open the configuration file:
   - **macOS**: `~/Library/Application Support/Windsurf/mcp_config.json`
   - **Windows**: `%APPDATA%\Windsurf\mcp_config.json`
   - **Linux**: `~/.config/Windsurf/mcp_config.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "AccesibilityHub": {
      "command": "npx",
      "args": ["-y", "AccesibilityHub"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Restart Windsurf

### Claude Code

1. Open the configuration file:
   - **macOS**: `~/Library/Application Support/Code/User/globalStorage/anthropic.claude-code/settings/cline_mcp_settings.json`
   - **Windows**: `%APPDATA%\Code\User\globalStorage\anthropic.claude-code\settings\cline_mcp_settings.json`
   - **Linux**: `~/.config/Code/User/globalStorage/anthropic.claude-code/settings/cline_mcp_settings.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "AccesibilityHub": {
      "command": "npx",
      "args": ["-y", "AccesibilityHub"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

3. Restart VS Code or reload the window (Cmd/Ctrl + Shift + P → "Developer: Reload Window")

## Usage

Once configured, you can use prompts like:

- "Analyze the accessibility of https://example.com with axe-core and Pa11y"
- "Check this HTML for accessibility issues: `<img src='photo.jpg'>`"
- "Compare the results of axe-core and Pa11y on my landing page" (uses analyze-mixed)
- "Check the color contrast of my web page" (uses analyze-contrast)
- "Analyze if text colors comply with WCAG AAA" (uses analyze-contrast with wcagLevel: AAA)
- "Analyze contrast using the APCA algorithm" (uses analyze-contrast with contrastAlgorithm: APCA)

### Local Development

If you're developing or contributing to the project, you can use local paths instead of npx:

**Claude Desktop / Windsurf / Claude Code**:
```json
{
  "mcpServers": {
    "AccesibilityHub": {
      "command": "node",
      "args": ["<PROJECT_PATH>/dist/server.js"],
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
    "AccesibilityHub": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "<PROJECT_PATH>"
    }
  }
}
```

> 💡 **Tip**: Remember to run `pnpm build` each time you make code changes for them to be reflected in the server.

## Configuration

| Variable    | Default | Description                      |
|-------------|---------|----------------------------------|
| `LOG_LEVEL` | `info`  | `debug`, `info`, `warn`, `error` |

## Requirements

- Node.js ≥ 20
- pnpm
- Chrome/Chromium (automatically downloaded by Puppeteer)

## Main Dependencies

- `@modelcontextprotocol/sdk` - SDK for MCP servers
- `puppeteer` - Headless browser control
- `@axe-core/puppeteer` - axe-core integration with Puppeteer
- `axe-core` - Accessibility analysis engine
- `pa11y` - Accessibility testing tool
- `colorjs.io` - Color library with WCAG 2.1 and APCA support
- `zod` - Schema validation
- `pino` - Structured logging
