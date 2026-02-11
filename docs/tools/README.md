# Tools

AccessibilityHub provides five analysis tools, each designed for specific accessibility testing needs.

## Available Tools

| Tool | Description | Best For |
|------|-------------|----------|
| [analyze-with-axe](./analyze-with-axe.md) | Full accessibility analysis using axe-core | Comprehensive WCAG compliance testing |
| [analyze-with-pa11y](./analyze-with-pa11y.md) | Accessibility testing using Pa11y | WCAG 2.1 AA/AAA validation |
| [analyze-with-lighthouse](./analyze-with-lighthouse.md) | Accessibility analysis using Google Lighthouse | Score tracking, deployment gates |
| [analyze-contrast](./analyze-contrast.md) | Color contrast analysis | Visual accessibility, color issues |
| [analyze-mixed](./analyze-mixed.md) | Combined analysis with multiple engines | Complete accessibility overview |

## When to Use Each Tool

### analyze-with-axe

Use when you need:
- Comprehensive WCAG 2.0/2.1 compliance checking
- Detailed violation reports with fix suggestions
- Analysis of ARIA usage and semantic HTML

### analyze-with-pa11y

Use when you need:
- WCAG 2.1 AA or AAA level validation
- Standards-based testing (Section508, WCAG2A, WCAG2AA, WCAG2AAA)
- HTML CodeSniffer-based analysis

### analyze-with-lighthouse

Use when you need:
- A quantitative accessibility score (0-100)
- Lighthouse-specific audits (font-size, tap-targets, meta-viewport)
- Score-based deployment gates with a minimum threshold
- Tracking accessibility improvements over time

### analyze-contrast

Use when you need:
- Specific color contrast analysis
- WCAG 2.1 or APCA algorithm comparison
- Text size and weight considerations

### analyze-mixed

Use when you need:
- Complete accessibility overview
- Cross-validation between multiple engines
- Maximum issue coverage

## Common Parameters

All tools share these common parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL of the page to analyze |

See individual tool documentation for tool-specific parameters.
