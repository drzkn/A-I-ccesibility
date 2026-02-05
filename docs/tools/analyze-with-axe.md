# analyze-with-axe

Full accessibility analysis using [axe-core](https://github.com/dequelabs/axe-core), one of the most comprehensive and widely-used accessibility testing engines.

## Description

Analyzes web pages or raw HTML for accessibility issues using axe-core. Returns violations grouped by WCAG criteria with enriched human context, remediation suggestions, and severity classification.

**Best for:**
- Comprehensive WCAG 2.0/2.1 compliance checking
- Detailed violation reports with fix suggestions
- Analysis of ARIA usage and semantic HTML
- Low false positive rate

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes* | - | URL of the page to analyze |
| `html` | string | Yes* | - | Raw HTML content to analyze (alternative to URL) |
| `options.wcagLevel` | string | No | `"AA"` | WCAG conformance level: `"A"`, `"AA"`, or `"AAA"` |
| `options.includeIncomplete` | boolean | No | `false` | Include incomplete/needs-review issues |
| `options.browser.waitForSelector` | string | No | - | CSS selector to wait for before analysis (useful for SPAs) |
| `options.browser.waitForTimeout` | number | No | - | Milliseconds to wait before analysis |
| `options.browser.viewport.width` | number | No | `1280` | Viewport width in pixels |
| `options.browser.viewport.height` | number | No | `720` | Viewport height in pixels |

\* Either `url` or `html` is required, but not both.

## Basic Example

**Prompt:**
```
Analyze with axe-core: https://example.com
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
  "issueCount": 5,
  "issues": [
    {
      "id": "axe-core:image-alt:a3f8b9",
      "ruleId": "image-alt",
      "tool": "axe-core",
      "severity": "critical",
      "wcag": {
        "criterion": "1.1.1",
        "level": "A",
        "principle": "perceivable"
      },
      "location": {
        "selector": "img:nth-child(2)",
        "snippet": "<img src=\"logo.png\">"
      },
      "message": "Images must have alternate text",
      "humanContext": "**Non-text content (WCAG 1.1.1 - Level A)**\n\nAll non-text content must have a text alternative...",
      "suggestedActions": [
        "Add descriptive alt attribute to images",
        "Use aria-label for decorative icons with function",
        "Mark decorative images with empty alt=\"\""
      ],
      "affectedUsers": ["screen-reader", "low-vision"],
      "priority": "critical",
      "remediationEffort": "low",
      "confidence": 1
    }
  ],
  "summary": {
    "total": 5,
    "bySeverity": {
      "critical": 1,
      "serious": 2,
      "moderate": 2,
      "minor": 0
    },
    "byPrinciple": {
      "perceivable": 3,
      "operable": 2,
      "understandable": 0,
      "robust": 0
    }
  },
  "duration": 2340
}
```

## Advanced Examples

### WCAG AA criteria only

**Prompt:**
```
Analyze https://example.com with axe-core, WCAG AA level only
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "wcagLevel": "AA"
  }
}
```

### Wait for dynamic content (SPAs)

**Prompt:**
```
Analyze https://spa-app.com with axe-core, waiting for the #main-content selector to appear
```

**Equivalent input:**
```json
{
  "url": "https://spa-app.com",
  "options": {
    "wcagLevel": "AA",
    "browser": {
      "waitForSelector": "#main-content"
    }
  }
}
```

### Raw HTML analysis

**Prompt:**
```
Check this HTML for accessibility issues:
<form><input type="text" placeholder="Email"><button>Submit</button></form>
```

**Equivalent input:**
```json
{
  "html": "<html><body><form><input type=\"text\" placeholder=\"Email\"><button>Submit</button></form></body></html>",
  "options": {
    "wcagLevel": "AA"
  }
}
```

**Output:**
```json
{
  "success": true,
  "target": "[html content]",
  "issueCount": 2,
  "issues": [
    {
      "id": "axe-core:label:f3a9b2",
      "ruleId": "label",
      "tool": "axe-core",
      "severity": "serious",
      "wcag": {
        "criterion": "1.3.1",
        "level": "A",
        "principle": "perceivable"
      },
      "location": {
        "selector": "input[type=\"text\"]",
        "snippet": "<input type=\"text\" placeholder=\"Email\">"
      },
      "message": "Form elements must have labels",
      "humanContext": "**Info and Relationships (WCAG 1.3.1 - Level A)**...",
      "suggestedActions": [
        "Associate labels with inputs correctly",
        "Use aria-label if visible label is not possible"
      ],
      "affectedUsers": ["screen-reader", "cognitive"],
      "priority": "high",
      "remediationEffort": "low"
    }
  ],
  "duration": 180
}
```

### Advanced options with viewport

**Input:**
```json
{
  "url": "https://spa-app.com",
  "options": {
    "wcagLevel": "AA",
    "includeIncomplete": false,
    "browser": {
      "waitForSelector": "#app-loaded",
      "waitForTimeout": 3000,
      "viewport": {
        "width": 1280,
        "height": 720
      }
    }
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
| `issues[].ruleId` | string | Axe-core rule identifier |
| `issues[].tool` | string | Always `"axe-core"` |
| `issues[].severity` | string | `"critical"`, `"serious"`, `"moderate"`, or `"minor"` |
| `issues[].wcag` | object | WCAG criterion details |
| `issues[].location` | object | Element selector and HTML snippet |
| `issues[].message` | string | Human-readable issue description |
| `issues[].humanContext` | string | Enriched context with real-world impact |
| `issues[].suggestedActions` | array | List of remediation suggestions |
| `issues[].affectedUsers` | array | User groups affected (e.g., `"screen-reader"`, `"low-vision"`) |
| `issues[].priority` | string | `"critical"`, `"high"`, `"medium"`, or `"low"` |
| `issues[].remediationEffort` | string | `"low"`, `"medium"`, or `"high"` |
| `issues[].confidence` | number | Confidence score (0-1) |
| `summary` | object | Aggregated statistics |
| `duration` | number | Analysis duration in milliseconds |

## Related

- [analyze-with-pa11y](./analyze-with-pa11y.md) - Alternative engine for WCAG testing
- [analyze-mixed](./analyze-mixed.md) - Run axe-core and Pa11y together
- [full-accessibility-audit prompt](../prompts/full-accessibility-audit.md) - Comprehensive audit workflow
