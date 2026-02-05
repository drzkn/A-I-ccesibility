# analyze-contrast

Dedicated color contrast analysis tool supporting both WCAG 2.1 and APCA (WCAG 3.0 draft) algorithms.

## Description

Analyzes color contrast on web pages or raw HTML to verify compliance with WCAG contrast requirements. Provides detailed contrast ratios, identifies failing elements, and suggests color fixes that meet accessibility standards.

**Best for:**
- Specific color contrast analysis
- WCAG 2.1 or APCA algorithm comparison
- Text size and weight considerations
- Getting suggested color fixes with CSS code

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `url` | string | Yes* | - | URL of the page to analyze |
| `html` | string | Yes* | - | Raw HTML content to analyze (alternative to URL) |
| `options.wcagLevel` | string | No | `"AA"` | WCAG conformance level: `"AA"` or `"AAA"` |
| `options.contrastAlgorithm` | string | No | `"WCAG21"` | Algorithm: `"WCAG21"` (standard) or `"APCA"` (experimental) |
| `options.selector` | string | No | - | CSS selector to scope analysis to specific section |
| `options.suggestFixes` | boolean | No | `true` | Include suggested color fixes |
| `options.includePassingElements` | boolean | No | `false` | Include elements that pass contrast requirements |
| `options.browser.viewport.width` | number | No | `1280` | Viewport width in pixels |
| `options.browser.viewport.height` | number | No | `720` | Viewport height in pixels |

\* Either `url` or `html` is required, but not both.

## Contrast Requirements

### WCAG 2.1 (Standard)

| Level | Normal Text | Large Text | Non-text |
|-------|-------------|------------|----------|
| **AA** | 4.5:1 | 3:1 | 3:1 |
| **AAA** | 7:1 | 4.5:1 | - |

**Large text** = 18pt+ (24px) or 14pt+ bold (18.66px)

### APCA (WCAG 3.0 Draft)

| Element Type | Required Lightness (Lc) |
|--------------|-------------------------|
| Body text | 75Lc |
| Large text | 60Lc |
| Non-text | 45Lc |

## Basic Example

**Prompt:**
```
Check the color contrast of https://example.com
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
  "wcagLevel": "AA",
  "issueCount": 3,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "tool": "contrast-analyzer",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "principle": "perceivable",
        "version": "2.1",
        "title": "Contrast (Minimum)"
      },
      "location": {
        "selector": "p.subtitle",
        "snippet": "<p class=\"subtitle\">Light gray text on white</p>"
      },
      "message": "Contrast ratio 2.5:1 does not meet AA requirements (4.5:1 required for normal text)",
      "humanContext": "Users with low vision or color blindness may have difficulty reading this text. The current contrast of 2.5:1 is below the AA threshold of 4.5:1.",
      "suggestedActions": [
        "Increase contrast ratio to at least 4.5:1",
        "Consider using #767676 as the text color"
      ],
      "affectedUsers": ["low-vision", "color-blind"],
      "contrastData": {
        "foreground": "rgb(180, 180, 180)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 2.5,
        "requiredRatio": 4.5,
        "isLargeText": false,
        "fontSize": 16,
        "fontWeight": 400,
        "suggestedFix": {
          "foreground": "#767676",
          "background": "#ffffff",
          "newRatio": 4.54
        }
      }
    }
  ],
  "summary": {
    "total": 25,
    "passing": 22,
    "failing": 3,
    "byTextSize": {
      "normalText": { "passing": 18, "failing": 3 },
      "largeText": { "passing": 4, "failing": 0 }
    }
  },
  "duration": 1234
}
```

## Advanced Examples

### Analysis with AAA level

**Prompt:**
```
Analyze the contrast of https://example.com with WCAG AAA level
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

**Output (partial):**
```json
{
  "wcagLevel": "AAA",
  "issueCount": 8,
  "issues": [
    {
      "ruleId": "color-contrast",
      "severity": "moderate",
      "wcag": {
        "criterion": "1.4.6",
        "level": "AAA",
        "title": "Contrast (Enhanced)"
      },
      "message": "Contrast ratio 5.2:1 does not meet AAA requirements (7:1 required for normal text)",
      "contrastData": {
        "currentRatio": 5.2,
        "requiredRatio": 7,
        "isLargeText": false
      }
    }
  ]
}
```

### Specific section analysis

**Prompt:**
```
Check only the header contrast of my page
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "selector": "header",
    "suggestFixes": true
  }
}
```

### APCA analysis (WCAG 3.0 Draft)

**Prompt:**
```
Analyze contrast using the APCA algorithm (more accurate for visual perception)
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "contrastAlgorithm": "APCA"
  }
}
```

**Output:**
```json
{
  "success": true,
  "target": "https://example.com",
  "wcagLevel": "AA",
  "issueCount": 2,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "title": "Contrast (APCA - WCAG 3.0 Draft)"
      },
      "message": "APCA lightness 52.3Lc does not meet requirements (75Lc required for body text)",
      "humanContext": "Users with low vision or color blindness may have difficulty reading this text. The current APCA lightness of 52.3Lc is below the threshold of 75Lc.",
      "contrastData": {
        "foreground": "rgb(140, 140, 140)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 52.3,
        "requiredRatio": 75,
        "isLargeText": false,
        "fontSize": 16,
        "fontWeight": 400,
        "suggestedFix": {
          "foreground": "#4a4a4a",
          "background": "#ffffff",
          "newRatio": 75.2
        }
      },
      "affectedUsers": ["low-vision", "color-blind"]
    }
  ]
}
```

### Include passing elements

**Prompt:**
```
Show me the contrast of all elements, including those that pass
```

**Equivalent input:**
```json
{
  "url": "https://example.com",
  "options": {
    "includePassingElements": true
  }
}
```

### HTML contrast analysis

**Input:**
```json
{
  "html": "<div style='background: #fff'><p style='color: #999'>Low contrast text</p><h1 style='color: #333'>Good contrast heading</h1></div>",
  "options": {
    "wcagLevel": "AA",
    "includePassingElements": true
  }
}
```

**Output:**
```json
{
  "success": true,
  "target": "[html content]",
  "wcagLevel": "AA",
  "issueCount": 2,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "severity": "serious",
      "message": "Contrast ratio 2.85:1 does not meet AA requirements (4.5:1 required for normal text)",
      "contrastData": {
        "foreground": "rgb(153, 153, 153)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 2.85,
        "requiredRatio": 4.5,
        "isLargeText": false,
        "suggestedFix": {
          "foreground": "#767676",
          "background": "#ffffff",
          "newRatio": 4.54
        }
      }
    },
    {
      "id": "contrast-1",
      "ruleId": "color-contrast",
      "severity": "minor",
      "message": "Contrast ratio 12.63:1 meets AA requirements (3:1 required for large text)",
      "contrastData": {
        "foreground": "rgb(51, 51, 51)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 12.63,
        "requiredRatio": 3,
        "isLargeText": true
      }
    }
  ],
  "summary": {
    "total": 2,
    "passing": 1,
    "failing": 1,
    "byTextSize": {
      "normalText": { "passing": 0, "failing": 1 },
      "largeText": { "passing": 1, "failing": 0 }
    }
  },
  "duration": 89
}
```

## Output Structure

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether the analysis completed successfully |
| `target` | string | The analyzed URL or `"[html content]"` |
| `wcagLevel` | string | WCAG level used for analysis (`"AA"` or `"AAA"`) |
| `issueCount` | number | Total number of contrast issues |
| `issues` | array | List of contrast issues |
| `issues[].contrastData` | object | Detailed contrast information |
| `issues[].contrastData.foreground` | string | Foreground (text) color |
| `issues[].contrastData.background` | string | Background color |
| `issues[].contrastData.currentRatio` | number | Current contrast ratio (or Lc for APCA) |
| `issues[].contrastData.requiredRatio` | number | Required ratio to pass |
| `issues[].contrastData.isLargeText` | boolean | Whether text qualifies as "large text" |
| `issues[].contrastData.fontSize` | number | Font size in pixels |
| `issues[].contrastData.fontWeight` | number | Font weight (400 = normal, 700 = bold) |
| `issues[].contrastData.suggestedFix` | object | Suggested colors to fix the issue |
| `summary` | object | Aggregated statistics |
| `summary.passing` | number | Number of elements that pass |
| `summary.failing` | number | Number of elements that fail |
| `summary.byTextSize` | object | Breakdown by text size |
| `duration` | number | Analysis duration in milliseconds |

## WCAG 2.1 vs APCA

| Aspect | WCAG 2.1 | APCA |
|--------|----------|------|
| **Unit** | Ratio (e.g., 4.5:1) | Lightness contrast (Lc) |
| **Polarity** | Not considered | Light-on-dark vs dark-on-light |
| **Status** | Current standard | Experimental (WCAG 3.0 draft) |
| **Legal/regulatory** | Yes | Not yet |
| **Perceptual accuracy** | Good | Better |

## Related

- [contrast-check prompt](../prompts/contrast-check.md) - Guided contrast analysis workflow
- [contrast://thresholds resource](../resources/contrast-thresholds.md) - Contrast threshold reference
- [analyze-with-axe](./analyze-with-axe.md) - Full accessibility analysis (includes basic contrast)
