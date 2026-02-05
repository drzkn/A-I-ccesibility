# analyze-mixed

Combined accessibility analysis using multiple engines in parallel, with intelligent deduplication of results.

## Description

Runs multiple accessibility analysis tools (axe-core and Pa11y) in parallel on the same target and combines the results. Issues are deduplicated based on WCAG criterion and element location, providing maximum coverage while avoiding duplicate reports.

**Best for:**
- Complete accessibility overview
- Cross-validation between multiple engines
- Maximum issue coverage
- Comparing tool outputs for the same page

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes* | - | URL of the page to analyze |
| `html` | string | Yes* | - | Raw HTML content to analyze (alternative to URL) |
| `tools` | array | No | `["axe-core", "pa11y"]` | Tools to run: `"axe-core"`, `"pa11y"` |
| `options.wcagLevel` | string | No | `"AA"` | WCAG conformance level: `"A"`, `"AA"`, or `"AAA"` |
| `options.deduplicateResults` | boolean | No | `true` | Remove duplicate issues found by multiple tools |
| `options.browser.waitForSelector` | string | No | - | CSS selector to wait for before analysis |
| `options.browser.waitForTimeout` | number | No | - | Milliseconds to wait before analysis |
| `options.browser.viewport.width` | number | No | `1280` | Viewport width in pixels |
| `options.browser.viewport.height` | number | No | `720` | Viewport height in pixels |

\* Either `url` or `html` is required, but not both.

## Basic Example

**Prompt:**
```
Analyze the accessibility of https://example.com using all available tools
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "tools": ["axe-core", "pa11y"],
  "options": {
    "wcagLevel": "AA",
    "deduplicateResults": true
  }
}
```

**Output:**
```json
{
  "success": true,
  "target": "https://example.com",
  "toolsUsed": ["axe-core", "pa11y"],
  "issueCount": 8,
  "deduplicatedCount": 12,
  "issues": [
    {
      "id": "axe-core:image-alt:a3f8b9",
      "ruleId": "image-alt",
      "tool": "axe-core",
      "severity": "critical",
      "message": "Images must have alternate text",
      "humanContext": "**Non-text content (WCAG 1.1.1 - Level A)**...",
      "affectedUsers": ["screen-reader", "low-vision"],
      "priority": "critical",
      "remediationEffort": "low"
    }
  ],
  "issuesByWCAG": {
    "1.1.1": [
      {
        "tool": "axe-core",
        "ruleId": "image-alt"
      },
      {
        "tool": "axe-core",
        "ruleId": "input-image-alt"
      }
    ],
    "1.3.1": [
      {
        "tool": "pa11y",
        "ruleId": "WCAG2AA.Principle1.Guideline1_3..."
      }
    ],
    "2.1.1": [
      {
        "tool": "axe-core",
        "ruleId": "button-name"
      }
    ]
  },
  "summary": {
    "total": 8,
    "bySeverity": {
      "critical": 2,
      "serious": 4,
      "moderate": 2,
      "minor": 0
    },
    "byPrinciple": {
      "perceivable": 5,
      "operable": 3,
      "understandable": 0,
      "robust": 0
    },
    "byTool": {
      "axe-core": 5,
      "pa11y": 3
    }
  },
  "individualResults": [
    {
      "tool": "axe-core",
      "success": true,
      "issues": [],
      "duration": 2340
    },
    {
      "tool": "pa11y",
      "success": true,
      "issues": [],
      "duration": 1890
    }
  ],
  "duration": 2500
}
```

## Advanced Examples

### Without deduplication

**Prompt:**
```
Analyze https://example.com with axe-core and Pa11y, show me ALL issues without deduplicating
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "tools": ["axe-core", "pa11y"],
  "options": {
    "deduplicateResults": false
  }
}
```

**Output (partial):**
```json
{
  "issueCount": 12,
  "deduplicatedCount": 12,
  "issues": [
    {
      "tool": "axe-core",
      "ruleId": "image-alt",
      "location": { "selector": "img:nth-child(2)" }
    },
    {
      "tool": "pa11y",
      "ruleId": "WCAG2AA.Principle1.Guideline1_1.1_1_1.H37",
      "location": { "selector": "html > body > img:nth-child(2)" }
    }
  ]
}
```

Note: Both tools detected the same image without `alt`, but with different selectors.

### Tool comparison

**Prompt:**
```
Compare the results of axe-core and Pa11y on https://example.com
What differences do they find?
```

The `individualResults` field in the output allows you to see what each tool found separately.

### Mobile viewport

**Prompt:**
```
Do a complete accessibility analysis of https://responsive-site.com in mobile viewport
```

**Equivalent input:**
```json
{
  "url": "https://responsive-site.com",
  "tools": ["axe-core", "pa11y"],
  "options": {
    "wcagLevel": "AA",
    "browser": {
      "viewport": {
        "width": 375,
        "height": 667
      }
    }
  }
}
```

### Wait for SPA content

**Prompt:**
```
Analyze https://spa-app.com after the main content loads
```

**Equivalent input:**
```json
{
  "url": "https://spa-app.com",
  "options": {
    "browser": {
      "waitForSelector": "[data-loaded='true']",
      "waitForTimeout": 5000
    }
  }
}
```

## Output Structure

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether all analyses completed successfully |
| `target` | string | The analyzed URL or `"[html content]"` |
| `toolsUsed` | array | List of tools that were run |
| `issueCount` | number | Number of unique issues (after deduplication) |
| `deduplicatedCount` | number | Total issues before deduplication |
| `issues` | array | Combined and deduplicated issues |
| `issuesByWCAG` | object | Issues grouped by WCAG criterion |
| `summary` | object | Aggregated statistics |
| `summary.byTool` | object | Issue count per tool |
| `individualResults` | array | Raw results from each tool |
| `individualResults[].tool` | string | Tool name |
| `individualResults[].success` | boolean | Whether that tool succeeded |
| `individualResults[].issues` | array | Issues found by that tool |
| `individualResults[].duration` | number | Duration for that tool in ms |
| `duration` | number | Total analysis duration in milliseconds |

## How Deduplication Works

When `deduplicateResults: true` (default), issues are considered duplicates if they:

1. Reference the same WCAG criterion
2. Target the same or similar DOM element
3. Report the same type of violation

The tool with higher confidence or more detailed information is kept. The `deduplicatedCount` field shows how many issues were found before deduplication.

## Tool Comparison

| Feature | axe-core | Pa11y |
|---------|----------|-------|
| **Selector** | Compact CSS | Full CSS path |
| **Severities** | 4 levels | 3 types |
| **False positives** | Few | Moderate |
| **Speed** | ~2-3s | ~2s |

Using both tools together provides:
- **Validation** - Issues found by both tools are highly reliable
- **Coverage** - Each tool catches issues the other might miss
- **Confidence** - Cross-referenced findings reduce false positives

## Related

- [analyze-with-axe](./analyze-with-axe.md) - Run only axe-core
- [analyze-with-pa11y](./analyze-with-pa11y.md) - Run only Pa11y
- [full-accessibility-audit prompt](../prompts/full-accessibility-audit.md) - Comprehensive audit workflow
- [pre-deploy-check prompt](../prompts/pre-deploy-check.md) - Deployment gate workflow
