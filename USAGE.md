# Usage Guide - AccesibilityHub

This guide provides practical examples of how to use the accessibility tools from Cursor or Claude Desktop.

## Contents

- [Common Use Cases](#common-use-cases)
- [Examples by Tool](#examples-by-tool)
- [Effective Prompts](#effective-prompts)
- [Interpreting Results](#interpreting-results)
- [Recommended Workflows](#recommended-workflows)

---

## Common Use Cases

### 1. Quick Page Audit

**Prompt:**
```
Analyze the accessibility of https://my-site.com using all available tools
```

**Which tool will be used?**  
→ `analyze-mixed` (axe-core + Pa11y in parallel)

**Expected result:**
- Combined and deduplicated issues
- Grouped by WCAG criterion
- With enriched human context

---

### 2. Deep Analysis with a Specific Tool

**Prompt:**
```
Use only axe-core to analyze https://my-site.com and give me a detailed report
```

**Which tool will be used?**  
→ `analyze-with-axe`

**Advantage:**  
Faster results, axe-core specific metadata.

---

### 3. Local or Development HTML Analysis

**Prompt:**
```
Check this HTML for accessibility issues:
<form>
  <input type="text" placeholder="Name">
  <button>Submit</button>
</form>
```

**Which tool will be used?**  
→ `analyze-mixed` or `analyze-with-axe`

**Typical issues it will find:**
- Missing `<label>` associated with input (WCAG 1.3.1)
- Button without explicit `type="submit"`

---

### 4. Tool Comparison

**Prompt:**
```
Compare the results of axe-core and Pa11y on https://example.com
What differences do they find?
```

**Which tool will be used?**  
→ `analyze-mixed` with `individualResults` field

**Useful for:**
- Validating false positives
- Understanding differences between tools
- Decisions about which tool to use in CI/CD

---

### 5. Color Contrast Analysis

**Prompt:**
```
Check if the text colors on https://my-site.com comply with WCAG AA
```

**Which tool will be used?**  
→ `analyze-contrast`

**Expected result:**
- Current contrast ratio vs required
- Color suggestions that comply with WCAG
- Statistics by text type (normal/large)

---

### 6. APCA Analysis (WCAG 3.0 Draft)

**Prompt:**
```
Analyze the contrast of https://my-site.com using the APCA algorithm
```

**Which tool will be used?**  
→ `analyze-contrast` with `contrastAlgorithm: "APCA"`

**Expected result:**
- Lightness contrast (Lc) instead of ratios
- Thresholds: 75Lc (body text), 60Lc (large text), 45Lc (non-text)
- Color suggestions optimized for visual perception

---

## Examples by Tool

### `analyze-with-axe`

#### Example 1: Basic analysis
```
Analyze with axe-core: https://example.com
```

#### Example 2: WCAG AA criteria only
```
Analyze https://example.com with axe-core, WCAG AA level only
```

#### Example 3: Wait for dynamic content to load
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

---

### `analyze-with-pa11y`

#### Example 1: Analysis with warnings
```
Analyze https://example.com with Pa11y including warnings
```

#### Example 2: Critical errors only
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

---

### `analyze-contrast`

#### Example 1: Basic contrast analysis
```
Check the color contrast of https://example.com
```

#### Example 2: Analysis with AAA level
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

#### Example 3: Specific section analysis
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

#### Example 4: Include passing elements
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

#### Example 5: APCA analysis
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

**Note:** APCA uses lightness values (Lc) instead of ratios. Thresholds are:
- Body text: 75Lc
- Large text: 60Lc
- Non-text elements: 45Lc

---

### `analyze-mixed`

#### Example 1: Complete analysis
```
Do a complete accessibility analysis of https://my-landing.com
```

#### Example 2: Without deduplication
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

---

## Effective Prompts

### ✅ Good Prompts

#### Specific with context
```
Analyze the checkout page at https://store.com/checkout 
and prioritize issues affecting screen reader users
```

#### With clear constraints
```
Give me only critical issues (severity: critical) from https://example.com
that have low remediation effort (remediationEffort: low)
```

#### Request interpretation
```
Analyze https://form.com and explain which are the 3 most
urgent problems to solve and why
```

#### With business objectives
```
We're launching the web in 2 days. Analyze https://pre-prod.com 
and tell me which issues I MUST fix before launch
```

---

### ❌ Prompts That Can Be Improved

#### Too vague
```
Is my site accessible?
```
**Better:** Specify the URL and what aspects concern you.

#### No action context
```
Analyze https://example.com
```
**Better:** Add what you want to do with the results.

#### Mixing analysis types
```
Analyze https://example.com and also src/components/*.vue
```
**Better:** Do two separate analyses (web vs source code).

---

## Interpreting Results

### Key Fields in Issues

```json
{
  "ruleId": "image-alt",
  "severity": "serious",
  "wcag": {
    "criterion": "1.1.1",
    "level": "A",
    "principle": "perceivable"
  },
  "priority": "critical",
  "remediationEffort": "low",
  "affectedUsers": ["screen-reader", "low-vision"]
}
```

### How to Prioritize

#### Prioritization Matrix

| Priority | Effort | Action |
|----------|--------|--------|
| **Critical** | **Low** | 🔥 **Fix immediately** |
| **Critical** | Medium/High | 📅 Plan for next sprint |
| **High** | **Low** | ✅ Quick wins - do soon |
| Medium/Low | High | 📝 Backlog - evaluate vs impact |

#### Triage Example

**Prompt:**
```
From the previous analysis, show me:
1. Critical issues with low effort (fix today)
2. High issues with low effort (fix this week)
3. The rest grouped by WCAG principle
```

---

## Recommended Workflows

### Workflow 1: Pre-Deploy Check

```
1. Analyze https://staging.my-app.com with all tools
2. Filter only critical and high impact issues
3. If there are critical issues → block deploy
4. If only medium/low issues → log in backlog and deploy
```

**Suggested prompt:**
```
Analyze staging.my-app.com and tell me if there are any critical issues 
that justify delaying the deploy
```

---

### Workflow 2: Periodic Audit

```
1. Each sprint, analyze the production website
2. Compare with previous analysis
3. Identify regressions (new issues)
4. Prioritize fixes for next sprint
```

**Suggested prompt:**
```
Analyze https://production.com and compare with last 
month's analysis. Have we introduced new problems?
```

---

### Workflow 3: Team Training

```
1. Analyze a page with varied issues
2. Review the humanContext field of each issue
3. Understand real-world examples
4. Apply suggested solutions (suggestedActions)
```

**Suggested prompt:**
```
Analyze https://demo.com and explain in detail 
the WCAG 1.1.1 issue (Non-text content):
- Which users it affects
- Real example of how it impacts them
- How to fix it step by step
```

---

## Advanced Tips

### 1. SPA Analysis with Lazy Loading

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

### 2. Mobile Viewport

```json
{
  "url": "https://responsive-site.com",
  "options": {
    "browser": {
      "viewport": {
        "width": 375,
        "height": 667
      }
    }
  }
}
```

### 3. Exclude Specific Rules

Useful if you have a known false positive:

```json
{
  "url": "https://example.com",
  "options": {
    "excludeRules": ["color-contrast"]
  }
}
```

### 4. Contrast Analysis with AAA Level

For projects requiring maximum accessibility:

```json
{
  "url": "https://example.com",
  "options": {
    "wcagLevel": "AAA",
    "suggestFixes": true
  }
}
```

**Required ratios:**
- **AA:** 4.5:1 (normal text), 3:1 (large text)
- **AAA:** 7:1 (normal text), 4.5:1 (large text)

### 5. Specific Section Contrast

Analyze only the contrast of a part of the page:

```json
{
  "url": "https://example.com",
  "options": {
    "selector": ".hero-section",
    "includePassingElements": false
  }
}
```

### 6. APCA Analysis (WCAG 3.0 Draft)

For projects wanting to prepare for WCAG 3.0:

```json
{
  "url": "https://example.com",
  "options": {
    "contrastAlgorithm": "APCA",
    "suggestFixes": true
  }
}
```

**APCA vs WCAG21 differences:**
- **APCA** measures "lightness contrast" (Lc), more perceptually accurate
- **APCA** considers polarity (light text on dark vs dark text on light)
- **APCA** is experimental (WCAG 3.0 draft)
- **WCAG21** remains the current legal/regulatory standard

---

## Frequently Asked Questions

### Which tool to use in CI/CD?

- **For deployed web:** `analyze-mixed` (maximum coverage)
- **For color verification:** `analyze-contrast` (with fix suggestions)

### How to handle false positives?

1. Verify with second tool
2. Check `confidence` score (< 0.8 may be false positive)
3. Use `excludeRules` if confirmed false positive

### Can I analyze sites with login?

Currently no. The tools analyze the public page. For authenticated analysis, consider:
- Configuring a shared browser with cookies
- Using HTML captured post-login

---

## Typical Response Examples

### Response with Enriched Context

```json
{
  "ruleId": "image-alt",
  "message": "Images must have alternate text",
  "humanContext": "**Non-text content (WCAG 1.1.1 - Level A)**\n\nAll non-text content must have a text alternative that serves the same purpose.\n\n**Impact on users:**\nScreen reader users cannot access information conveyed by images...",
  "suggestedActions": [
    "Add descriptive alt attribute to images",
    "Use aria-label for decorative icons with function"
  ],
  "affectedUsers": ["screen-reader", "low-vision"],
  "priority": "critical",
  "remediationEffort": "low"
}
```

### Issues Grouped by WCAG

```json
{
  "issuesByWCAG": {
    "1.1.1": [
      { "ruleId": "image-alt", ... },
      { "ruleId": "input-image-alt", ... }
    ],
    "2.1.1": [
      { "ruleId": "button-name", ... }
    ]
  }
}
```

---

## Additional Resources

- **WCAG Quick Reference:** https://www.w3.org/WAI/WCAG21/quickref/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **WAI-ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/

---

Have questions? Check the [README.md](./README.md) or open an issue in the repository.
