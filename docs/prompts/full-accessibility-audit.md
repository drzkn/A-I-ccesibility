# full-accessibility-audit

Comprehensive accessibility audit with detailed remediation guidance.

## Description

This prompt performs a thorough accessibility analysis of a web page, providing an executive summary, issues grouped by WCAG principle, and a prioritized remediation plan with code examples.

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

- **Executive Summary**: Overview with severity breakdown (critical, serious, moderate, minor)
- **Issues by WCAG Principle**: Problems grouped by Perceivable, Operable, Understandable, Robust
- **Critical Issues Analysis**: Detailed user impact for each critical issue
- **Remediation Plan**: Prioritized fixes with before/after code examples
- **Compliance Status**: Overall WCAG conformance assessment

### Example Output Structure

```
## Executive Summary
- Total issues: 15
- Critical: 3 | Serious: 5 | Moderate: 4 | Minor: 3

## Issues by WCAG Principle

### Perceivable (7 issues)
- 1.1.1 Non-text Content: 3 issues
- 1.4.3 Contrast Minimum: 4 issues

### Operable (5 issues)
...

## Critical Issues

### Missing alt text on hero image
- **Impact**: Screen reader users cannot understand the main visual content
- **Affected Users**: screen-reader, low-vision
- **Fix**: Add descriptive alt attribute

## Remediation Plan

### Priority 1: Fix Today (Critical + Low Effort)
1. Add alt text to images (3 instances)
   ```html
   <!-- Before -->
   <img src="hero.jpg">
   
   <!-- After -->
   <img src="hero.jpg" alt="Team collaborating in modern office">
   ```
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
- [pre-deploy-check](./pre-deploy-check.md) - Deployment-focused with GO/NO-GO decision
- [analyze-mixed](../tools/analyze-mixed.md) - Direct tool for programmatic access
