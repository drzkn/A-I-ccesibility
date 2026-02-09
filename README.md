# AccesibilityHub

MCP Server for orchestrating web accessibility tools (axe-core, Pa11y). Analyze web pages, check color contrast, and get detailed WCAG compliance reports with enriched human context.

[![npm version](https://img.shields.io/npm/v/accessibilityhub)](https://www.npmjs.com/package/accessibility-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

```bash
npm install -g AccesibilityHub
```

Add to your MCP client configuration:

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

Then ask your AI assistant:

> "Analyze the accessibility of https://example.com"

## Available Tools

| Tool | Description | Docs |
|------|-------------|------|
| `analyze-with-axe` | Analyze accessibility using axe-core | [docs/tools/analyze-with-axe.md](docs/tools/analyze-with-axe.md) |
| `analyze-with-pa11y` | Analyze accessibility using Pa11y | [docs/tools/analyze-with-pa11y.md](docs/tools/analyze-with-pa11y.md) |
| `analyze-contrast` | Check color contrast (WCAG 2.1 / APCA) | [docs/tools/analyze-contrast.md](docs/tools/analyze-contrast.md) |
| `analyze-mixed` ⭐ | Run multiple tools in parallel and combine results | [docs/tools/analyze-mixed.md](docs/tools/analyze-mixed.md) |

## Available Prompts

| Prompt | Description | Docs |
|--------|-------------|------|
| `full-accessibility-audit` | Comprehensive audit with remediation guidance | [docs/prompts/full-accessibility-audit.md](docs/prompts/full-accessibility-audit.md) |
| `quick-accessibility-check` | Fast check with critical issues summary | [docs/prompts/quick-accessibility-check.md](docs/prompts/quick-accessibility-check.md) |
| `contrast-check` | Color contrast analysis with fix suggestions | [docs/prompts/contrast-check.md](docs/prompts/contrast-check.md) |
| `pre-deploy-check` | Verify compliance before deployment | [docs/prompts/pre-deploy-check.md](docs/prompts/pre-deploy-check.md) |
| `quick-wins-report` | High-impact, low-effort fixes | [docs/prompts/quick-wins-report.md](docs/prompts/quick-wins-report.md) |
| `explain-wcag-criterion` | Deep dive into any WCAG criterion | [docs/prompts/explain-wcag-criterion.md](docs/prompts/explain-wcag-criterion.md) |

## Available Resources

| Resource | Description | Docs |
|----------|-------------|------|
| `wcag://criteria` | WCAG 2.1 criteria reference data | [docs/resources/wcag-criteria.md](docs/resources/wcag-criteria.md) |
| `contrast://thresholds/*` | Contrast thresholds (WCAG 2.1 / APCA) | [docs/resources/contrast-thresholds.md](docs/resources/contrast-thresholds.md) |

## Enriched Human Context ✨

All accessibility issues include enriched context to help you understand and fix them:

- **WCAG criterion explanation** with real-world impact
- **Affected users** (screen-reader, keyboard-only, low-vision, etc.)
- **Remediation priority** and **fix effort** estimates
- **Step-by-step suggested solutions**

```json
{
  "ruleId": "image-alt",
  "severity": "serious",
  "humanContext": "Non-text content (WCAG 1.1.1 - Level A)...",
  "affectedUsers": ["screen-reader", "low-vision"],
  "priority": "critical",
  "remediationEffort": "low"
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Installation and MCP client configuration |
| [Tools Reference](docs/tools/README.md) | Detailed tool documentation |
| [Prompts Reference](docs/prompts/README.md) | Prompt templates and usage |
| [Resources Reference](docs/resources/README.md) | Available WCAG and contrast data |
| [Workflows Guide](docs/guides/workflows.md) | Recommended workflows |
| [Effective Prompts](docs/guides/effective-prompts.md) | Tips for better accessibility prompts |
| [Interpreting Results](docs/guides/interpreting-results.md) | How to prioritize and fix issues |
| [Contributing](CONTRIBUTING.md) | Project structure, development, and contributions |

## Requirements

- Node.js ≥ 20
- Chrome/Chromium (automatically downloaded by Puppeteer)

## Support Me

If this project helps you, consider supporting its development:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/theraaskin)
[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/raskreation)

## License

[MIT](LICENSE)
