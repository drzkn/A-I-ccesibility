# contrast-check

Color contrast analysis with fix suggestions.

## Description

This prompt performs focused color contrast analysis on a web page, identifying elements that don't meet WCAG requirements and suggesting specific color fixes. Supports both WCAG 2.1 standard ratios and APCA (WCAG 3.0 draft) lightness contrast.

**Best for:** Focused color contrast analysis, design reviews, or APCA evaluation.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the page to analyze |
| `selector` | string | | - | CSS selector to scope analysis (e.g., `header`, `.hero-section`) |
| `algorithm` | string | | `WCAG21` | Contrast algorithm: `WCAG21` (standard) or `APCA` (experimental) |
| `wcagLevel` | string | | `AA` | WCAG conformance level: `AA` or `AAA` |
| `language` | string | | - | Language for the report (e.g., "Spanish", "French") |

## Example Usage

### Basic Usage

```
Use the contrast-check prompt with:
- url: https://my-site.com
```

### With APCA Algorithm

```
Use the contrast-check prompt with:
- url: https://my-site.com
- algorithm: APCA
```

### Scoped to Section

```
Use the contrast-check prompt with:
- url: https://my-site.com
- selector: .main-content
```

### Full Options

```
Use the contrast-check prompt with:
- url: https://my-site.com
- algorithm: WCAG21
- wcagLevel: AAA
- selector: header
```

## Output Includes

The prompt generates a detailed contrast report with:

- **Pass/Fail Statistics**: Summary by text size (normal/large)
- **Failing Elements**: Detailed list with current vs required ratios
- **Suggested Fixes**: Specific color values that would pass
- **CSS Code Snippets**: Ready-to-use fix implementations
- **Implementation Guide**: Best practices for applying fixes

### Example Output Structure

```
## Contrast Analysis: example.com

### Statistics
| Text Type | Pass | Fail | Total |
|-----------|------|------|-------|
| Normal Text | 45 | 8 | 53 |
| Large Text | 12 | 2 | 14 |

### Failing Elements

#### 1. Navigation Links
- **Element**: `.nav-link`
- **Current**: #777777 on #FFFFFF (ratio: 4.48:1)
- **Required**: 4.5:1 (AA Normal)
- **Suggested fix**: #767676 (ratio: 4.54:1)

```css
.nav-link {
  color: #767676; /* Updated from #777777 */
}
```

#### 2. Hero Subtitle
- **Element**: `.hero p`
- **Current**: #999999 on #F5F5F5 (ratio: 2.84:1)
- **Required**: 4.5:1 (AA Normal)
- **Suggested fix**: #666666 (ratio: 5.74:1)

### APCA Note (if algorithm: APCA)
Using APCA lightness contrast (Lc) instead of WCAG 2.1 ratios:
- Body text: 75Lc minimum
- Large text: 60Lc minimum
- Non-text: 45Lc minimum
```

## WCAG 2.1 vs APCA

| Algorithm | Measurement | Normal Text | Large Text | Best For |
|-----------|-------------|-------------|------------|----------|
| **WCAG21** | Ratio (e.g., 4.5:1) | 4.5:1 (AA), 7:1 (AAA) | 3:1 (AA), 4.5:1 (AAA) | Current compliance |
| **APCA** | Lightness (e.g., 75Lc) | 75Lc | 60Lc | Future-proofing, perceptual accuracy |

**Note:** APCA is experimental (WCAG 3.0 draft). WCAG 2.1 remains the current legal/regulatory standard.

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Design review | ✅ Yes |
| Color system audit | ✅ Yes |
| Fixing contrast issues | ✅ Yes |
| APCA evaluation | ✅ Yes |
| Full accessibility audit | Use `full-accessibility-audit` instead |

## Related

- [analyze-contrast](../tools/analyze-contrast.md) - Direct tool with full parameters
- [contrast-thresholds](../resources/contrast-thresholds.md) - Reference data for thresholds
- [full-accessibility-audit](./full-accessibility-audit.md) - Comprehensive audit including contrast
