# quick-accessibility-check

Fast accessibility check with critical issues summary.

## Description

This prompt performs a rapid accessibility scan of a web page, focusing on the most important issues. It provides a concise summary with quick fixes and next steps, ideal for development workflows.

**Best for:** Quick sanity checks during development or CI/CD pipelines.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to analyze |

## Example Usage

### Basic Usage

```
Use the quick-accessibility-check prompt for https://staging.my-site.com
```

### Natural Language

```
Do a quick accessibility check on https://example.com
```

## Output Includes

The prompt generates a concise report with:

- **Summary by Severity**: Quick count of issues by severity level
- **Critical & Serious Issues**: List with quick fix suggestions
- **Next Steps**: Recommendations for further analysis if needed

### Example Output Structure

```
## Quick Accessibility Check: example.com

### Summary
- ❌ Critical: 2
- ⚠️ Serious: 3
- ℹ️ Moderate: 5

### Critical Issues (Fix Immediately)

1. **Missing form labels** (2 instances)
   - Location: Contact form
   - Quick fix: Add `<label>` elements or `aria-label` attributes

2. **Images without alt text** (1 instance)
   - Location: Header logo
   - Quick fix: Add descriptive `alt` attribute

### Serious Issues

1. **Insufficient color contrast** (3 elements)
   - Quick fix: Increase contrast ratio to at least 4.5:1

### Next Steps
- Run `full-accessibility-audit` for detailed remediation plan
- Use `contrast-check` for color-specific fixes
```

## When to Use

| Scenario | Recommended |
|----------|-------------|
| During development | ✅ Yes |
| Pull request review | ✅ Yes |
| Quick sanity check | ✅ Yes |
| Compliance documentation | Use `full-accessibility-audit` instead |
| Pre-deployment gate | Use `pre-deploy-check` instead |

## Related

- [full-accessibility-audit](./full-accessibility-audit.md) - More comprehensive analysis
- [pre-deploy-check](./pre-deploy-check.md) - Deployment-focused with GO/NO-GO decision
- [quick-wins-report](./quick-wins-report.md) - Focus on easy fixes
