# MCP Prompts

MCP Prompts are **user-controlled templates** that generate structured messages for accessibility workflows. Unlike tools (which the LLM executes automatically), prompts are invoked directly by users and provide guided analysis with detailed output formats.

## Available Prompts

| Prompt | Description | Best For |
|--------|-------------|----------|
| [full-accessibility-audit](./full-accessibility-audit.md) | Comprehensive audit using axe-core, Pa11y, and Lighthouse | Major releases, compliance reviews |
| [quick-accessibility-check](./quick-accessibility-check.md) | Fast check with critical issues summary | Development, CI/CD pipelines |
| [contrast-check](./contrast-check.md) | Color contrast analysis with fix suggestions | Design reviews, APCA evaluation |
| [pre-deploy-check](./pre-deploy-check.md) | Verify compliance with score threshold before deployment | Deployment gates, release checklists |
| [quick-wins-report](./quick-wins-report.md) | High-impact, low-effort fixes from all three tools | Sprint planning, quick improvements |
| [explain-wcag-criterion](./explain-wcag-criterion.md) | Deep dive into any WCAG criterion | Learning, team training |
| [lighthouse-audit](./lighthouse-audit.md) | Lighthouse score-focused accessibility audit | Score tracking, Lighthouse insights |
| [lighthouse-score-improvement](./lighthouse-score-improvement.md) | Phased plan to reach a target accessibility score | Score improvement, sprint planning |

## How to Use Prompts

### In Claude Desktop

1. Click the **prompts icon** (📝) in the input area
2. Select the desired prompt from the list
3. Fill in the required arguments (URL, etc.)
4. Submit to start the analysis

### In Cursor

1. Use the **slash command** format: `/full-accessibility-audit`
2. Or access via the MCP prompts panel
3. Provide the required arguments when prompted

### Example Usage

```
Use the full-accessibility-audit prompt with:
- url: https://my-site.com
- wcagLevel: AA
```

## Prompts vs Tools: When to Use Each

| Scenario | Use Prompt | Use Tool Directly |
|----------|------------|-------------------|
| Comprehensive audit with structured report | ✅ `full-accessibility-audit` | |
| Deployment gate with GO/NO-GO decision | ✅ `pre-deploy-check` | |
| Quick check during development | ✅ `quick-accessibility-check` | |
| Focused contrast analysis with fixes | ✅ `contrast-check` | |
| Score-focused Lighthouse audit | ✅ `lighthouse-audit` | |
| Improve score toward a target | ✅ `lighthouse-score-improvement` | |
| Learning about WCAG criteria | ✅ `explain-wcag-criterion` | |
| Custom analysis with specific options | | ✅ Use tools directly |
| Automated scripts or CI/CD | | ✅ Use tools directly |
| Comparing tool outputs | | ✅ `analyze-mixed` |

### Key Differences

- **Prompts**: Pre-configured workflows with guided output, ideal for common tasks. User-controlled templates that provide structured reports.
- **Tools**: Direct access to analysis engines with full parameter control. Best for automation and custom workflows.

## Related Documentation

- [Tools Reference](../tools/README.md) - Direct tool access with full parameters
- [Workflows Guide](../guides/workflows.md) - Recommended workflows combining prompts and tools
- [Effective Prompts](../guides/effective-prompts.md) - Tips for writing better accessibility prompts
