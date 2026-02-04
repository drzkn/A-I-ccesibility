# Usage Examples - AI-ccesibility

Concrete input and output examples for each MCP tool.

## Table of Contents

- [analyze-with-axe](#analyze-with-axe)
- [analyze-with-pa11y](#analyze-with-pa11y)
- [analyze-contrast](#analyze-contrast)
- [analyze-mixed](#analyze-mixed)

---

## analyze-with-axe

### Example 1: Basic URL analysis

**Input:**
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

---

### Example 2: Raw HTML analysis

**Input:**
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

---

### Example 3: With advanced options

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

---

## analyze-with-pa11y

### Example 1: Analysis with specific standard

**Input:**
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

---

## analyze-contrast

### Example 1: Basic contrast analysis

**Input:**
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

---

### Example 2: Analysis with AAA level

**Input:**
```json
{
  "url": "https://example.com",
  "options": {
    "wcagLevel": "AAA"
  }
}
```

**Output:**
```json
{
  "success": true,
  "target": "https://example.com",
  "wcagLevel": "AAA",
  "issueCount": 8,
  "issues": [
    {
      "id": "contrast-0",
      "ruleId": "color-contrast",
      "tool": "contrast-analyzer",
      "severity": "moderate",
      "wcag": {
        "criterion": "1.4.6",
        "level": "AAA",
        "principle": "perceivable",
        "version": "2.1",
        "title": "Contrast (Enhanced)"
      },
      "message": "Contrast ratio 5.2:1 does not meet AAA requirements (7:1 required for normal text)",
      "contrastData": {
        "foreground": "rgb(100, 100, 100)",
        "background": "rgb(255, 255, 255)",
        "currentRatio": 5.2,
        "requiredRatio": 7,
        "isLargeText": false
      }
    }
  ],
  "summary": {
    "total": 25,
    "passing": 17,
    "failing": 8
  },
  "duration": 1456
}
```

---

### Example 3: Analysis with APCA (WCAG 3.0 Draft)

**Input:**
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
      "tool": "contrast-analyzer",
      "severity": "serious",
      "wcag": {
        "criterion": "1.4.3",
        "level": "AA",
        "principle": "perceivable",
        "title": "Contrast (APCA - WCAG 3.0 Draft)"
      },
      "location": {
        "selector": "p.subtitle",
        "snippet": "<p class=\"subtitle\">Low contrast text</p>"
      },
      "message": "APCA lightness 52.3Lc does not meet requirements (75Lc required for body text)",
      "humanContext": "Users with low vision or color blindness may have difficulty reading this text. The current APCA lightness of 52.3Lc is below the threshold of 75Lc.",
      "suggestedActions": [
        "Increase APCA lightness to at least 75Lc",
        "Consider using #4a4a4a as the text color"
      ],
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
  ],
  "summary": {
    "total": 20,
    "passing": 18,
    "failing": 2,
    "byTextSize": {
      "normalText": { "passing": 15, "failing": 2 },
      "largeText": { "passing": 3, "failing": 0 }
    }
  },
  "duration": 1234
}
```

**Note about APCA:**
- `currentRatio` and `requiredRatio` use Lc (Lightness contrast) values instead of ratios
- Thresholds: body text (75Lc), large text (60Lc), non-text (45Lc)
- APCA is more perceptually accurate but still experimental

---

### Example 4: Specific section analysis

**Input:**
```json
{
  "url": "https://example.com",
  "options": {
    "selector": "#main-content",
    "suggestFixes": true
  }
}
```

---

### Example 5: HTML with contrast analysis

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

---

## analyze-mixed

### Example 1: Basic combined analysis

**Input:**
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

---

### Example 2: Without deduplication

**Input:**
```json
{
  "url": "https://example.com",
  "tools": ["axe-core", "pa11y"],
  "options": {
    "deduplicateResults": false
  }
}
```

**Output:**
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

**Note:** Both detected the same image without `alt`, but with different selectors.

---

### Example 3: With mobile viewport

**Input:**
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

---

## Output Comparison by Tool

### Same issue detected by different tools

**Axe-core:**
```json
{
  "tool": "axe-core",
  "ruleId": "image-alt",
  "severity": "critical",
  "location": {
    "selector": "img:nth-child(2)"
  },
  "message": "Images must have alternate text"
}
```

**Pa11y:**
```json
{
  "tool": "pa11y",
  "ruleId": "WCAG2AA.Principle1.Guideline1_1.1_1_1.H37",
  "severity": "serious",
  "location": {
    "selector": "html > body > img:nth-child(2)"
  },
  "message": "Img element missing an alt attribute..."
}
```

---

## Differences Summary

| Feature | axe-core | Pa11y | Contrast |
|---------|----------|-------|----------|
| **Target** | URL/HTML | URL/HTML | URL/HTML |
| **Selector** | Compact CSS | Full CSS | Compact CSS |
| **Severities** | 4 levels | 3 types | 4 levels |
| **Snippet** | ✅ | ✅ | ✅ |
| **Confidence** | ✅ | ✅ | Always 1 |
| **Browser** | Puppeteer | Puppeteer | Puppeteer |
| **Speed** | ~2-3s | ~2s | ~1-2s |
| **False positives** | Few | Moderate | Very few |
| **Fix suggestions** | - | - | ✅ Colors |
| **APCA (WCAG 3.0)** | - | - | ✅ Experimental |

---

## Tips for Interpreting Results

### 1. Prioritize by Matrix

```
Critical + Low effort = Fix TODAY
Critical + Medium/High effort = Plan for sprint
High + Low effort = Quick wins
Medium/Low + High effort = Backlog
```

### 2. Validate Duplicates

If `deduplicatedCount` > `issueCount`, check `individualResults` to see which tool is more reliable for that type of issue.

### 3. Review `affectedUsers`

Prioritize issues that affect screen reader and keyboard-only users (most common).

### 4. Leverage `humanContext`

Read the real-world examples to understand the actual impact on users.

---

## Next Steps

- See [USAGE.md](./USAGE.md) for complete workflows
- See [README.md](./README.md) for configuration
- See `src/shared/data/README.md` to add more WCAG criteria
