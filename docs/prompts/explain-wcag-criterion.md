# explain-wcag-criterion

Deep dive into any WCAG criterion.

## Description

This prompt provides comprehensive education about a specific WCAG criterion, including its purpose, impact on users, code examples, testing strategies, and common mistakes. Perfect for learning, documentation, and team training.

**Best for:** Learning, documentation, team training, understanding specific WCAG requirements.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `criterion` | string | ✅ | - | WCAG criterion ID (e.g., `1.1.1`, `2.4.4`, `1.4.3`) |

## Example Usage

### Basic Usage

```
Use the explain-wcag-criterion prompt with criterion: 1.4.3
```

### Natural Language

```
Explain WCAG criterion 1.1.1 in detail
```

### Common Criteria to Explore

```
Explain WCAG 2.4.4 (Link Purpose)
```

```
Help me understand WCAG 1.3.1 (Info and Relationships)
```

## Output Includes

The prompt generates an educational deep dive with:

- **Criterion Overview**: Name, level, and principle
- **What It Means**: Plain language explanation
- **Why It Matters**: Real-world impact on users with disabilities
- **Code Examples**: Before/after implementations
- **Testing Strategies**: Manual and automated testing approaches
- **Common Mistakes**: Frequent errors and how to avoid them
- **Official Resources**: Links to WCAG documentation

### Example Output Structure

```
## WCAG 1.4.3: Contrast (Minimum)

### Overview
- **Level**: AA
- **Principle**: Perceivable
- **Guideline**: 1.4 Distinguishable

### What It Means

Text and images of text must have a contrast ratio of at least:
- **4.5:1** for normal text (< 18pt or < 14pt bold)
- **3:1** for large text (≥ 18pt or ≥ 14pt bold)

### Why It Matters

**Affected Users:**
- Low vision users (estimated 246 million worldwide)
- Color blind users (8% of men, 0.5% of women)
- Users in bright environments (outdoor, sunny rooms)
- Older adults with age-related vision changes

**Real-World Impact:**
> "When text has poor contrast, I have to zoom in 400% and still struggle
> to read. It gives me headaches and makes simple tasks exhausting."
> — User with low vision

### Code Examples

#### ❌ Failing Example

```html
<p style="color: #777777; background: #ffffff;">
  This gray text on white fails contrast (ratio: 4.48:1)
</p>
```

#### ✅ Passing Example

```html
<p style="color: #767676; background: #ffffff;">
  This darker gray passes AA (ratio: 4.54:1)
</p>
```

#### ✅ Better Example

```html
<p style="color: #595959; background: #ffffff;">
  This even darker gray provides comfortable reading (ratio: 7.0:1)
</p>
```

### Testing Strategies

#### Manual Testing
1. Use browser DevTools color picker to check contrast
2. Test with high contrast mode enabled
3. View page in grayscale to spot issues
4. Check in bright light conditions

#### Automated Testing
- AccesibilityHub: `analyze-contrast` tool
- Browser extensions: axe DevTools, WAVE
- Design tools: Figma contrast plugins

#### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [APCA Contrast Calculator](https://www.myndex.com/APCA/)

### Common Mistakes

1. **Relying only on color to convey info**
   - Fix: Add text labels, icons, or patterns

2. **Placeholder text as labels**
   - Placeholders often have low contrast by default

3. **Focus states with poor contrast**
   - Focus indicators need 3:1 contrast too

4. **Text over images without overlay**
   - Add semi-transparent background behind text

5. **Forgetting disabled state contrast**
   - Disabled elements are exempt but should still be visible

### Official Resources

- [WCAG 2.1 Understanding 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [WCAG 2.1 Technique G18](https://www.w3.org/WAI/WCAG21/Techniques/general/G18)
- [W3C Contrast Ratio Definition](https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio)
```

## Popular WCAG Criteria

| Criterion | Name | Common Issues |
|-----------|------|---------------|
| 1.1.1 | Non-text Content | Missing alt text |
| 1.3.1 | Info and Relationships | Form labels, headings |
| 1.4.3 | Contrast Minimum | Low contrast text |
| 2.1.1 | Keyboard | Non-keyboard accessible |
| 2.4.4 | Link Purpose | Vague link text |
| 4.1.2 | Name, Role, Value | ARIA issues |

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Learning WCAG | ✅ Yes |
| Team training | ✅ Yes |
| Understanding specific issue | ✅ Yes |
| Documentation | ✅ Yes |
| Fixing specific violations | Check first, then use appropriate tool |

## Related

- [wcag-criteria](../resources/wcag-criteria.md) - WCAG criteria reference data
- [full-accessibility-audit](./full-accessibility-audit.md) - Identify which criteria are violated
- [Interpreting Results](../guides/interpreting-results.md) - Understanding issue priorities
