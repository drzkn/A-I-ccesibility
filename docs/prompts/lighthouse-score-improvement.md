# lighthouse-score-improvement

Prioritized improvement plan to reach a target Lighthouse accessibility score.

## Description

This prompt analyzes a page with Lighthouse and creates a phased improvement plan to reach a specific target accessibility score. It identifies the current gap, ranks failing audits by score impact, and organizes fixes into phases with estimated score gains and code examples.

**Best for:** Improving accessibility scores methodically, sprint planning around accessibility goals, tracking progress toward a target.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to improve |
| `targetScore` | number | | `90` | Target Lighthouse accessibility score to achieve (0-100) |

## Example Usage

### Basic Usage

```
Use the lighthouse-score-improvement prompt with:
- url: https://my-site.com
```

### With Custom Target

```
Use the lighthouse-score-improvement prompt with:
- url: https://my-site.com
- targetScore: 95
```

### Natural Language

```
Help me improve the accessibility score of https://example.com to 95
```

## Output Includes

The prompt generates a goal-oriented improvement plan with:

- **Current State**: Current score, target score, gap, and audit pass/fail counts
- **Score Impact Analysis**: Every failing audit ranked by estimated score impact with effort estimates
- **Phased Improvement Plan**: Fixes organized into Critical, Important, and Final Polish phases with estimated score after each phase and code examples
- **Manual Review Audits**: Audits requiring manual verification with testing guidance
- **Progress Checklist**: Copyable markdown checklist for tracking implementation

### Example Output Structure

```
## 1. Current State

- **Current Score**: 68/100
- **Target Score**: 90/100
- **Gap**: 22 points
- **Rating**: Needs Improvement
- **Failing audits**: 9
- **Passing audits**: 26

---

## 2. Score Impact Analysis

| # | Audit | WCAG Criterion | Impact | Elements | Effort |
|---|-------|---------------|--------|----------|--------|
| 1 | color-contrast | 1.4.3 | High | 15 | 30 min |
| 2 | image-alt | 1.1.1 | High | 8 | 15 min |
| 3 | label | 3.3.2 | Medium | 4 | 10 min |
| 4 | heading-order | 2.4.6 | Medium | 3 | 20 min |
| 5 | link-name | 2.4.4 | Low | 2 | 5 min |

---

## 3. Improvement Plan

### Phase 1: Critical Fixes (estimated score after: 78/100)

**color-contrast** (WCAG 1.4.3)
- Current: 15 elements fail contrast check
- Fix: Increase text contrast ratios
- ```html
  <!-- Before -->
  <p style="color: #aaa">Low contrast</p>

  <!-- After -->
  <p style="color: #595959">Sufficient contrast</p>
  ```
- Estimated gain: +6 points

### Phase 2: Important Fixes (estimated score after: 88/100)
...

### Phase 3: Final Polish (estimated score after: 93/100)
...

---

## 5. Progress Checklist

```markdown
## Score Improvement Checklist
Target: 90/100

### Phase 1 — Critical Fixes
- [ ] Fix contrast on 15 elements
- [ ] Add alt text to 8 images

### Phase 2 — Important Fixes
- [ ] Add labels to 4 form fields
- [ ] Fix heading hierarchy

### Phase 3 — Final Polish
- [ ] Add accessible names to 2 links
- [ ] Fix tabindex values
```
```

## Difference from Other Prompts

| Aspect | `lighthouse-score-improvement` | `lighthouse-audit` | `full-accessibility-audit` |
|--------|-------------------------------|-------------------|---------------------------|
| **Goal** | Reach a target score | Understand current score | Comprehensive audit |
| **Output** | Phased action plan | Score report | Full remediation plan |
| **Unique value** | Gap analysis + phases | Score breakdown | Cross-tool coverage |
| **Tracking** | Built-in checklist | No checklist | No checklist |

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Accessibility score is below target | ✅ Yes |
| Sprint planning for accessibility | ✅ Yes |
| Methodical score improvement | ✅ Yes |
| Understanding current score | Use `lighthouse-audit` instead |
| Full compliance review | Use `full-accessibility-audit` instead |
| Pre-deployment verification | Use `pre-deploy-check` instead |

## Related

- [lighthouse-audit](./lighthouse-audit.md) - Score-focused audit without improvement plan
- [full-accessibility-audit](./full-accessibility-audit.md) - Comprehensive audit with all three tools
- [quick-wins-report](./quick-wins-report.md) - Quick fixes across all tools
- [analyze-with-lighthouse](../tools/analyze-with-lighthouse.md) - Direct Lighthouse tool access
