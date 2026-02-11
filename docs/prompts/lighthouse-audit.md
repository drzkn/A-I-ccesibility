# lighthouse-audit

Accessibility audit focused on the Lighthouse accessibility score.

## Description

This prompt runs a Lighthouse accessibility audit and provides a report centered on the accessibility score (0-100) as the primary metric. It includes a breakdown of failing audits sorted by score impact, manual review guidance, and a score improvement roadmap with effort tiers.

**Best for:** Score-focused audits, tracking accessibility metrics, understanding what Lighthouse specifically detects.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to analyze |
| `wcagLevel` | string | | `AA` | WCAG conformance level: `A`, `AA`, or `AAA` |

## Example Usage

### Basic Usage

```
Use the lighthouse-audit prompt with:
- url: https://my-site.com
```

### With WCAG Level

```
Use the lighthouse-audit prompt with:
- url: https://my-site.com
- wcagLevel: AAA
```

### Natural Language

```
Run a Lighthouse accessibility audit on https://example.com
```

## Output Includes

The prompt generates a score-focused report with:

- **Accessibility Score**: Prominent 0-100 score with qualitative rating (Poor, Needs Improvement, Good)
- **Failed Audits**: Each failing audit with WCAG mapping, affected elements, and concrete fixes with before/after code
- **Manual Review Audits**: Lighthouse audits flagged as manual or not applicable, with verification guidance
- **Score Improvement Roadmap**: Fixes grouped by effort (Quick Wins, Medium Effort, Larger Refactors) with estimated score improvement per tier
- **Summary**: Top 3 highest-impact actions and recommendations for complementary tools

### Example Output Structure

```
## Accessibility Score

**72/100** — Needs Improvement
- Passed audits: 28/35
- Failed audits: 7

---

## Failed Audits (by score impact)

### 1. color-contrast (WCAG 1.4.3 - Level AA)
- **Affected elements**: 12 elements
- **Impact**: Low-vision and color-blind users cannot read text
- **Fix**:
  ```html
  <!-- Before -->
  <p style="color: #999">Light gray text</p>

  <!-- After -->
  <p style="color: #595959">Darker gray text</p>
  ```

### 2. image-alt (WCAG 1.1.1 - Level A)
...

---

## Score Improvement Roadmap

### Quick Wins (< 5 min each) → estimated score: 82/100
1. Add lang attribute to <html>
2. Add document title

### Medium Effort → estimated score: 92/100
1. Fix color contrast on 12 elements
2. Add alt text to 5 images

### Larger Refactors → estimated score: 98/100
1. Restructure heading hierarchy
2. Add skip navigation link

---

## Summary
1. Fix color contrast issues (+8 points)
2. Add missing alt text (+5 points)
3. Add form labels (+3 points)

Consider complementing with axe-core or Pa11y for issues Lighthouse does not cover.
```

## Difference from full-accessibility-audit

| Aspect | `lighthouse-audit` | `full-accessibility-audit` |
|--------|-------------------|---------------------------|
| **Tools used** | Lighthouse only | axe-core + Pa11y + Lighthouse |
| **Focus** | Score and Lighthouse-specific audits | Comprehensive WCAG coverage |
| **Primary metric** | Accessibility score (0-100) | Issue count and severity |
| **Best for** | Score tracking, Lighthouse insights | Compliance reviews, major releases |
| **Speed** | Faster (single tool) | Slower (three tools) |

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Track accessibility score over time | ✅ Yes |
| Understand Lighthouse-specific results | ✅ Yes |
| Quick score check during development | ✅ Yes |
| Comprehensive compliance audit | Use `full-accessibility-audit` instead |
| Improve score toward a specific target | Use `lighthouse-score-improvement` instead |
| Deployment gate decision | Use `pre-deploy-check` instead |

## Related

- [lighthouse-score-improvement](./lighthouse-score-improvement.md) - Improvement plan toward a target score
- [full-accessibility-audit](./full-accessibility-audit.md) - Comprehensive audit with all three tools
- [analyze-with-lighthouse](../tools/analyze-with-lighthouse.md) - Direct Lighthouse tool access
- [Lighthouse Audits Resource](../resources/lighthouse-audits.md) - Audit catalog reference data
