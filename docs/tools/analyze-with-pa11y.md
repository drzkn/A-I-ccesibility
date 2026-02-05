# analyze-with-pa11y

Accessibility testing using [Pa11y](https://pa11y.org/), a popular automated accessibility testing tool powered by HTML CodeSniffer.

## Description

Analyzes web pages or raw HTML for accessibility issues using Pa11y. Supports multiple WCAG standards and provides detailed violation reports with enriched human context. Pa11y uses HTML CodeSniffer under the hood, which provides thorough standards-based testing.

**Best for:**
- WCAG 2.1 AA or AAA level validation
- Standards-based testing (Section508, WCAG2A, WCAG2AA, WCAG2AAA)
- HTML CodeSniffer-based analysis
- Catching issues that axe-core might miss

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes* | - | URL of the page to analyze |
| `html` | string | Yes* | - | Raw HTML content to analyze (alternative to URL) |
| `options.standard` | string | No | `"WCAG21AA"` | Standard to test against: `"WCAG2A"`, `"WCAG2AA"`, `"WCAG2AAA"`, `"WCAG21A"`, `"WCAG21AA"`, `"WCAG21AAA"`, `"Section508"` |
| `options.includeWarnings` | boolean | No | `true` | Include warning-level issues |
| `options.includeNotices` | boolean | No | `false` | Include notice-level issues |
| `options.browser.waitForSelector` | string | No | - | CSS selector to wait for before analysis |
| `options.browser.waitForTimeout` | number | No | - | Milliseconds to wait before analysis |
| `options.browser.viewport.width` | number | No | `1280` | Viewport width in pixels |
| `options.browser.viewport.height` | number | No | `720` | Viewport height in pixels |

\* Either `url` or `html` is required, but not both.

## Basic Example

**Prompt:**
```
Analyze https://example.com with Pa11y
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
  "issueCount": 3,
  "issues": [
    {
      "id": "pa11y:WCAG2AA.Principle1.Guideline1_1.1_1_1.H37:8f3a2b",
      "ruleId": "WCAG2AA.Principle1.Guideline1_1.1_1_1.H37",
      "tool": "pa11y",
      "severity": "serious",
      "wcag": {
        "criterion": "1.1.1",
        "level": "AA",
        "principle": "perceivable",
        "version": "2.1"
      },
      "location": {
        "selector": "html > body > img:nth-child(3)",
        "snippet": "<img src=\"banner.jpg\">"
      },
      "message": "Img element missing an alt attribute. Use the alt attribute to specify a short text alternative.",
      "humanContext": "**Non-text content (WCAG 1.1.1 - Level A)**...",
      "affectedUsers": ["screen-reader", "low-vision"],
      "priority": "critical",
      "remediationEffort": "low",
      "confidence": 1
    }
  ],
  "summary": {
    "total": 3,
    "bySeverity": {
      "critical": 0,
      "serious": 2,
      "moderate": 1,
      "minor": 0
    }
  },
  "metadata": {
    "toolVersion": "9.0.1",
    "pageTitle": "Example Domain"
  },
  "duration": 1890
}
```

## Advanced Examples

### Analysis with warnings

**Prompt:**
```
Analyze https://example.com with Pa11y including warnings
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "standard": "WCAG21AA",
    "includeWarnings": true,
    "includeNotices": false
  }
}
```

### Critical errors only

**Prompt:**
```
Use Pa11y to analyze https://example.com excluding warnings and notices
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "standard": "WCAG21AA",
    "includeWarnings": false,
    "includeNotices": false
  }
}
```

### WCAG AAA level validation

**Prompt:**
```
Analyze https://example.com with Pa11y at WCAG 2.1 AAA level
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "standard": "WCAG21AAA",
    "includeWarnings": true
  }
}
```

### Section 508 compliance

**Prompt:**
```
Check https://government-site.gov for Section 508 compliance using Pa11y
```

**Equivalent input:**
```json
{
  "url": "https://government-site.gov",
  "options": {
    "standard": "Section508"
  }
}
```

## Output Structure

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the analysis completed successfully |
| `target` | string | The analyzed URL or `"[html content]"` |
| `issueCount` | number | Total number of issues found |
| `issues` | array | List of accessibility issues |
| `issues[].id` | string | Unique issue identifier |
| `issues[].ruleId` | string | Pa11y/HTML CodeSniffer rule identifier |
| `issues[].tool` | string | Always `"pa11y"` |
| `issues[].severity` | string | `"critical"`, `"serious"`, `"moderate"`, or `"minor"` |
| `issues[].wcag` | object | WCAG criterion details |
| `issues[].wcag.version` | string | WCAG version (e.g., `"2.1"`) |
| `issues[].location` | object | Element selector and HTML snippet |
| `issues[].message` | string | Human-readable issue description |
| `issues[].humanContext` | string | Enriched context with real-world impact |
| `issues[].affectedUsers` | array | User groups affected |
| `issues[].priority` | string | `"critical"`, `"high"`, `"medium"`, or `"low"` |
| `issues[].remediationEffort` | string | `"low"`, `"medium"`, or `"high"` |
| `issues[].confidence` | number | Confidence score (0-1) |
| `summary` | object | Aggregated statistics |
| `metadata` | object | Tool version and page metadata |
| `duration` | number | Analysis duration in milliseconds |

## Differences from axe-core

| Feature | axe-core | Pa11y |
|---------|----------|-------|
| **Engine** | Deque axe-core | HTML CodeSniffer |
| **Selector format** | Compact CSS | Full CSS path |
| **False positives** | Few | Moderate |
| **Speed** | ~2-3s | ~2s |
| **Standards** | WCAG 2.0/2.1 | WCAG 2.0/2.1, Section 508 |

## Related

- [analyze-with-axe](./analyze-with-axe.md) - Alternative engine with low false positive rate
- [analyze-mixed](./analyze-mixed.md) - Run Pa11y and axe-core together
- [quick-accessibility-check prompt](../prompts/quick-accessibility-check.md) - Fast sanity check workflow
