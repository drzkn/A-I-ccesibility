# Prompts

MCP Prompts are pre-built templates that help you perform common accessibility tasks efficiently.

## Available Prompts

| Prompt | Description | Arguments |
|--------|-------------|-----------|
| [full-accessibility-audit](./full-accessibility-audit.md) | Complete accessibility audit | `url` |
| [quick-accessibility-check](./quick-accessibility-check.md) | Fast accessibility overview | `url` |
| [contrast-check](./contrast-check.md) | Color contrast validation | `foreground`, `background`, `text_size` |
| [pre-deploy-check](./pre-deploy-check.md) | Pre-deployment accessibility checklist | `url` |
| [quick-wins-report](./quick-wins-report.md) | Easy-to-fix issues report | `url` |
| [explain-wcag-criterion](./explain-wcag-criterion.md) | WCAG criterion explanation | `criterion_id` |

## How to Use Prompts

### In Claude Desktop

1. Click the prompt icon (📝) in the chat interface
2. Select the desired prompt from the list
3. Fill in the required arguments
4. Submit to start the analysis

### In Cursor

Use the prompt by name in your conversation:

```
Use the full-accessibility-audit prompt for https://example.com
```

## Prompts vs Tools: When to Use Each

| Scenario | Use Prompt | Use Tool |
|----------|------------|----------|
| Quick accessibility check | ✅ `quick-accessibility-check` | |
| Full site audit | ✅ `full-accessibility-audit` | |
| Specific color pair check | ✅ `contrast-check` | |
| Custom analysis parameters | | ✅ `analyze-with-axe` |
| Programmatic integration | | ✅ Any tool |
| WCAG level specific testing | | ✅ `analyze-with-pa11y` |
| Learning about WCAG | ✅ `explain-wcag-criterion` | |

### Key Differences

- **Prompts**: Pre-configured workflows with guided output, ideal for common tasks
- **Tools**: Direct access to analysis engines with full parameter control
