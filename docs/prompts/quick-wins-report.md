# quick-wins-report

High-impact, low-effort accessibility fixes.

## Description

This prompt identifies accessibility issues that provide the best return on investment - high impact fixes that require minimal effort. It provides time estimates, before/after code examples, and a copyable implementation checklist.

**Best for:** Sprint planning, identifying low-hanging fruit, quick improvements.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to analyze |

## Example Usage

### Basic Usage

```
Use the quick-wins-report prompt for https://my-landing-page.com
```

### Natural Language

```
Show me the quick accessibility wins for https://example.com - what can we fix easily?
```

## Output Includes

The prompt generates a prioritized report with:

- **Priority-Ordered Fixes**: Ranked by impact/effort ratio
- **Time Estimates**: Approximate time to implement each fix
- **Before/After Code**: Ready-to-use code examples
- **Implementation Checklist**: Copyable list for task tracking
- **Score Improvement**: Estimated accessibility score impact

### Example Output Structure

```
## Quick Wins Report: example.com

### Summary
Found **8 quick wins** that can be fixed in approximately **2-3 hours**
Estimated accessibility score improvement: **+15 points**

---

### Quick Win #1: Add Missing Alt Text
**Impact**: High | **Effort**: 5 minutes | **Instances**: 4

Screen reader users cannot access image content.

**Before:**
```html
<img src="team-photo.jpg">
```

**After:**
```html
<img src="team-photo.jpg" alt="Our team of 5 developers in the office">
```

**Files to update:**
- `src/components/About.tsx` (line 45)
- `src/components/Header.tsx` (line 12)

---

### Quick Win #2: Add Form Labels
**Impact**: High | **Effort**: 10 minutes | **Instances**: 3

Form inputs are not associated with labels.

**Before:**
```html
<input type="email" placeholder="Email">
```

**After:**
```html
<label for="email">Email address</label>
<input type="email" id="email" placeholder="you@example.com">
```

---

### Quick Win #3: Fix Button Names
**Impact**: High | **Effort**: 5 minutes | **Instances**: 2

Icon buttons lack accessible names.

**Before:**
```html
<button><svg>...</svg></button>
```

**After:**
```html
<button aria-label="Close dialog"><svg>...</svg></button>
```

---

## Implementation Checklist

Copy this checklist to your task tracker:

```markdown
- [ ] Add alt text to 4 images (5 min)
- [ ] Add labels to 3 form inputs (10 min)
- [ ] Add aria-label to 2 icon buttons (5 min)
- [ ] Add skip-to-content link (15 min)
- [ ] Fix heading hierarchy (10 min)
- [ ] Add lang attribute to html (2 min)
- [ ] Add focus indicators to links (15 min)
- [ ] Fix link text "click here" → descriptive (10 min)

**Total estimated time: 72 minutes**
```

## Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Accessibility Score | 65 | ~80 |
| Critical Issues | 4 | 0 |
| WCAG AA Compliance | Partial | Improved |
```

## Prioritization Matrix

Quick wins are selected based on:

| Priority | Impact | Effort | Example |
|----------|--------|--------|---------|
| 🔥 Highest | Critical | < 10 min | Missing alt text |
| ⚡ High | Serious | < 30 min | Form labels |
| ✅ Medium | Moderate | < 1 hour | Skip links |

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Sprint planning | ✅ Yes |
| Limited time for fixes | ✅ Yes |
| Accessibility improvement roadmap | ✅ Yes |
| Compliance audit | Use `full-accessibility-audit` instead |
| Deployment decision | Use `pre-deploy-check` instead |

## Related

- [full-accessibility-audit](./full-accessibility-audit.md) - Complete audit with all issues
- [Interpreting Results](../guides/interpreting-results.md) - How to prioritize fixes
- [Workflows Guide](../guides/workflows.md) - Sprint planning workflow
