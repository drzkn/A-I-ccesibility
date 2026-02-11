# full-accessibility-audit

Comprehensive accessibility audit using axe-core, Pa11y, and Lighthouse with detailed remediation guidance.

## Description

This prompt performs a thorough accessibility analysis of a web page using three tools (axe-core, Pa11y, and Lighthouse), providing an executive summary with the Lighthouse accessibility score, issues grouped by WCAG principle, and a prioritized remediation plan with code examples.

**Best for:** Comprehensive audits before major releases or compliance reviews.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to analyze |
| `wcagLevel` | string | | `AA` | WCAG conformance level: `A`, `AA`, or `AAA` |

## Example Usage

### Basic Usage

```
Use the full-accessibility-audit prompt with:
- url: https://my-site.com
```

### With WCAG Level

```
Use the full-accessibility-audit prompt with:
- url: https://my-site.com
- wcagLevel: AAA
```

### Natural Language

```
Run a full accessibility audit on https://example.com targeting WCAG AA compliance
```

## Output Includes

The prompt generates a comprehensive report with:

- **Executive Summary**: Lighthouse accessibility score (0-100) with qualitative assessment, total issues across all tools, severity breakdown
- **Issues by WCAG Principle**: Problems from axe-core, Pa11y, and Lighthouse grouped by Perceivable, Operable, Understandable, Robust
- **Critical Issues Analysis**: Detailed user impact for each critical issue, including which tool(s) detected it
- **Remediation Plan**: Prioritized fixes ordered by severity, score impact, user impact, and effort — with before/after code examples
- **Code Examples**: Before/after snippets for top issues
- **Score Improvement Projection**: Estimated Lighthouse score gain after fixing critical and serious issues

### Example Output Structure

```
## Executive Summary
- **Lighthouse Accessibility Score**: 72/100 — Needs Improvement
- Total unique issues: 18 (across axe-core, Pa11y, Lighthouse)
- Critical: 3 | Serious: 5 | Moderate: 6 | Minor: 4
- WCAG AA conformance: Partial

## Issues by WCAG Principle

### Perceivable (9 issues)
- 1.1.1 Non-text Content: 3 issues (axe-core, Lighthouse)
- 1.4.3 Contrast Minimum: 6 issues (axe-core, Pa11y, Lighthouse)

### Operable (5 issues)
...

## Critical Issues

### Missing alt text on hero image
- **Impact**: Screen reader users cannot understand the main visual content
- **Affected Users**: screen-reader, low-vision
- **Detected by**: axe-core, Lighthouse
- **Fix**: Add descriptive alt attribute

## Remediation Plan

### Priority 1: Fix Today (Critical + High Score Impact)
1. Add alt text to images (3 instances)
   ```html
   <!-- Before -->
   <img src="hero.jpg">
   
   <!-- After -->
   <img src="hero.jpg" alt="Team collaborating in modern office">
   ```

## Score Improvement Projection
- Fixing critical issues: 72 → ~82/100
- Fixing critical + serious: 72 → ~91/100
```

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Before major release | ✅ Yes |
| Compliance review | ✅ Yes |
| Initial accessibility assessment | ✅ Yes |
| Quick development check | Use `quick-accessibility-check` instead |
| CI/CD pipeline | Use tools directly |

## Related

- [quick-accessibility-check](./quick-accessibility-check.md) - Faster, less detailed alternative
- [lighthouse-audit](./lighthouse-audit.md) - Score-focused audit using Lighthouse only
- [pre-deploy-check](./pre-deploy-check.md) - Deployment-focused with GO/NO-GO decision
- [analyze-mixed](../tools/analyze-mixed.md) - Direct tool for programmatic access (axe-core + Pa11y)
- [analyze-with-lighthouse](../tools/analyze-with-lighthouse.md) - Direct Lighthouse tool access
