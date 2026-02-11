# analyze-with-lighthouse

Accessibility analysis using [Google Lighthouse](https://developer.chrome.com/docs/lighthouse), providing an accessibility score (0-100) and audit results mapped to WCAG criteria.

## Description

Analyzes web pages for accessibility issues using Google Lighthouse's accessibility category. Returns an overall accessibility score, individual audit results, and issues mapped to WCAG criteria with enriched human context.

**Best for:**
- Getting a quantitative accessibility score (0-100)
- Lighthouse-specific audits not covered by axe-core or Pa11y
- Tracking accessibility score improvements over time
- Deployment gates with minimum score thresholds

**Important:** Lighthouse requires a live URL — raw HTML content is not supported.

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes | - | URL of the page to analyze |
| `options.wcagLevel` | string | No | `"AA"` | WCAG conformance level: `"A"`, `"AA"`, or `"AAA"` |
| `options.browser.waitForSelector` | string | No | - | CSS selector to wait for before analysis |
| `options.browser.waitForTimeout` | number | No | - | Milliseconds to wait before analysis (max 60s) |
| `options.browser.viewport.width` | number | No | `1280` | Viewport width in pixels |
| `options.browser.viewport.height` | number | No | `720` | Viewport height in pixels |
| `options.browser.ignoreHTTPSErrors` | boolean | No | `false` | Ignore SSL certificate errors (for local dev servers) |

## Basic Example

**Prompt:**
```
Analyze with Lighthouse: https://example.com
```

**Equivalent input:**
```json
{
  "url": "https://example.com"
}
```

**Output:**
```json
{
  "success": true,
  "target": "https://example.com",
  "accessibilityScore": 82,
  "issueCount": 7,
  "issues": [
    {
      "id": "lighthouse:color-contrast:a1b2c3",
      "ruleId": "color-contrast",
      "tool": "lighthouse",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "principle": "perceivable"
      },
      "location": {
        "selector": ".footer-link",
        "snippet": "<a class=\"footer-link\" href=\"/about\">About</a>"
      },
      "message": "Background and foreground colors do not have a sufficient contrast ratio",
      "humanContext": "**Contrast (Minimum) (WCAG 1.4.3 - Level AA)**\n\nThe visual presentation of text must have a contrast ratio of at least 4.5:1...",
      "suggestedActions": [
        "Ensure text has sufficient contrast against background",
        "Use the analyze-contrast tool for detailed contrast analysis"
      ],
      "affectedUsers": ["low-vision", "color-blind"],
      "priority": "high",
      "remediationEffort": "low"
    }
  ],
  "summary": {
    "total": 7,
    "bySeverity": {
      "critical": 1,
      "serious": 3,
      "moderate": 2,
      "minor": 1
    },
    "byPrinciple": {
      "perceivable": 4,
      "operable": 2,
      "understandable": 1,
      "robust": 0
    }
  },
  "duration": 8500
}
```

## Advanced Examples

### With WCAG Level

**Prompt:**
```
Analyze https://example.com with Lighthouse targeting WCAG AAA
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "wcagLevel": "AAA"
  }
}
```

### Wait for Dynamic Content (SPAs)

**Prompt:**
```
Run Lighthouse on https://spa-app.com, wait for the #app-loaded selector
```

**Equivalent input:**
```json
{
  "url": "https://spa-app.com",
  "options": {
    "browser": {
      "waitForSelector": "#app-loaded"
    }
  }
}
```

### Local Development Server

**Input:**
```json
{
  "url": "https://localhost:3000",
  "options": {
    "wcagLevel": "AA",
    "browser": {
      "ignoreHTTPSErrors": true,
      "waitForTimeout": 2000
    }
  }
}
```

## Output Structure

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the analysis completed successfully |
| `target` | string | The analyzed URL |
| `accessibilityScore` | number | Lighthouse accessibility score (0-100) |
| `issueCount` | number | Total number of issues found |
| `issues` | array | List of accessibility issues |
| `issues[].id` | string | Unique issue identifier |
| `issues[].ruleId` | string | Lighthouse audit identifier |
| `issues[].tool` | string | Always `"lighthouse"` |
| `issues[].severity` | string | `"critical"`, `"serious"`, `"moderate"`, or `"minor"` |
| `issues[].wcag` | object | WCAG criterion details |
| `issues[].location` | object | Element selector and HTML snippet |
| `issues[].message` | string | Human-readable issue description |
| `issues[].humanContext` | string | Enriched context with real-world impact |
| `issues[].suggestedActions` | array | List of remediation suggestions |
| `issues[].affectedUsers` | array | User groups affected |
| `issues[].priority` | string | `"critical"`, `"high"`, `"medium"`, or `"low"` |
| `issues[].remediationEffort` | string | `"low"`, `"medium"`, or `"high"` |
| `summary` | object | Aggregated statistics |
| `duration` | number | Analysis duration in milliseconds |

## Accessibility Score

Lighthouse provides a unique accessibility score from 0 to 100:

| Range | Rating | Description |
|-------|--------|-------------|
| 90-100 | Good | Meets most accessibility requirements |
| 50-89 | Needs Improvement | Several issues need attention |
| 0-49 | Poor | Significant accessibility barriers |

The score is weighted — some audits impact it more than others. Fixing high-weight audits first yields the biggest score improvements.

## Lighthouse Audits Catalog

Lighthouse runs 40+ accessibility audits, each mapped to a WCAG criterion. Use the Lighthouse resources to explore the full catalog:

| Resource | URI |
|----------|-----|
| All audits | `lighthouse://audits` |
| Specific audit | `lighthouse://audits/{auditId}` |
| By WCAG level | `lighthouse://audits/level/{level}` |
| By POUR principle | `lighthouse://audits/principle/{principle}` |

See [Lighthouse Audits Resource](../resources/lighthouse-audits.md) for details.

## Differences from axe-core and Pa11y

| Aspect | Lighthouse | axe-core | Pa11y |
|--------|-----------|----------|-------|
| **Score** | 0-100 accessibility score | No score | No score |
| **HTML input** | URL only | URL or HTML | URL or HTML |
| **Unique audits** | `font-size`, `tap-targets`, `meta-viewport` | ARIA-specific rules | HTML CodeSniffer rules |
| **Best for** | Score tracking, deployment gates | Comprehensive WCAG testing | Standards-based validation |

For maximum coverage, use all three tools together with the [full-accessibility-audit](../prompts/full-accessibility-audit.md) prompt or [analyze-mixed](./analyze-mixed.md) tool.

## Related

- [analyze-with-axe](./analyze-with-axe.md) - Comprehensive WCAG testing with axe-core
- [analyze-with-pa11y](./analyze-with-pa11y.md) - Standards-based accessibility testing
- [analyze-mixed](./analyze-mixed.md) - Run axe-core and Pa11y together
- [lighthouse-audit prompt](../prompts/lighthouse-audit.md) - Score-focused audit workflow
- [lighthouse-score-improvement prompt](../prompts/lighthouse-score-improvement.md) - Plan to reach a target score
- [Lighthouse Audits Resource](../resources/lighthouse-audits.md) - Audit catalog reference data
