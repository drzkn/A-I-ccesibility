# Lighthouse Audits Resource

Reference data for Lighthouse accessibility audits, providing the complete catalog of audits with their WCAG mappings, descriptions, and filtering by level or principle.

## URI Patterns

| URI | Description |
|-----|-------------|
| `lighthouse://audits` | Complete catalog of all Lighthouse accessibility audits |
| `lighthouse://audits/{auditId}` | Specific audit detail (e.g., `lighthouse://audits/color-contrast`) |
| `lighthouse://audits/level/{level}` | Audits filtered by WCAG level: `A`, `AA`, or `AAA` |
| `lighthouse://audits/principle/{principle}` | Audits filtered by POUR principle |

## Available Principles

| Principle | URI | Description |
|-----------|-----|-------------|
| Perceivable | `lighthouse://audits/principle/perceivable` | Content must be presentable to users |
| Operable | `lighthouse://audits/principle/operable` | UI components must be operable |
| Understandable | `lighthouse://audits/principle/understandable` | Information and UI must be understandable |
| Robust | `lighthouse://audits/principle/robust` | Content must work with assistive technologies |

## Response Format

Each audit returns a structured object:

```json
{
  "auditId": "color-contrast",
  "title": "Contraste de color",
  "description": "Los colores de fondo y primer plano no tienen una relación de contraste suficiente.",
  "wcagCriterion": "1.4.3",
  "wcagLevel": "AA",
  "wcagPrinciple": "perceivable"
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `auditId` | string | Lighthouse audit identifier (e.g., `"color-contrast"`) |
| `title` | string | Human-readable audit title |
| `description` | string | Explanation of what the audit checks |
| `wcagCriterion` | string | Related WCAG criterion ID (e.g., `"1.4.3"`) |
| `wcagLevel` | string | WCAG conformance level: `A`, `AA`, or `AAA` |
| `wcagPrinciple` | string | POUR principle: `perceivable`, `operable`, `understandable`, `robust` |

## Examples

### Get the Full Audit Catalog

```
Resource: lighthouse://audits
```

Returns an array of all 40+ Lighthouse accessibility audits with their WCAG mappings.

### Get a Specific Audit

```
Resource: lighthouse://audits/image-alt
```

**Response:**

```json
{
  "auditId": "image-alt",
  "title": "Texto alternativo en imágenes",
  "description": "Los elementos <img> deben tener un atributo alt con texto descriptivo.",
  "wcagCriterion": "1.1.1",
  "wcagLevel": "A",
  "wcagPrinciple": "perceivable"
}
```

### Get All Level A Audits

```
Resource: lighthouse://audits/level/A
```

Returns all audits that map to WCAG Level A criteria — the most fundamental accessibility requirements.

### Get All Perceivable Audits

```
Resource: lighthouse://audits/principle/perceivable
```

Returns all audits related to the Perceivable principle (content alternatives, adaptable content, distinguishable elements).

## Common Audits Quick Reference

### Perceivable

| Audit ID | Title | WCAG | Level |
|----------|-------|------|-------|
| `color-contrast` | Contraste de color | 1.4.3 | AA |
| `image-alt` | Texto alternativo en imágenes | 1.1.1 | A |
| `input-image-alt` | Texto alternativo en input de imagen | 1.1.1 | A |
| `object-alt` | Texto alternativo en objetos | 1.1.1 | A |
| `video-caption` | Subtítulos en video | 1.2.2 | A |
| `video-description` | Audiodescripción en video | 1.2.5 | AA |
| `meta-viewport` | Meta viewport | 1.4.4 | AA |

### Operable

| Audit ID | Title | WCAG | Level |
|----------|-------|------|-------|
| `bypass` | Saltar bloques de contenido | 2.4.1 | A |
| `link-name` | Nombre accesible de enlaces | 2.4.4 | A |
| `heading-order` | Orden de encabezados | 2.4.6 | AA |
| `tabindex` | Uso de tabindex | 2.4.3 | A |
| `accesskeys` | Teclas de acceso únicas | 2.4.1 | A |
| `meta-refresh` | Meta refresh | 2.2.1 | A |
| `tap-targets` | Tamaño de áreas táctiles | 2.5.5 | AAA |

### Understandable

| Audit ID | Title | WCAG | Level |
|----------|-------|------|-------|
| `document-title` | Título del documento | 2.4.2 | A |
| `html-has-lang` | Atributo lang en HTML | 3.1.1 | A |
| `html-lang-valid` | Valor válido de lang | 3.1.1 | A |
| `valid-lang` | Atributos lang válidos | 3.1.2 | AA |
| `label` | Etiquetas de formularios | 3.3.2 | A |

### Robust

| Audit ID | Title | WCAG | Level |
|----------|-------|------|-------|
| `aria-allowed-attr` | Atributos ARIA permitidos | 4.1.2 | A |
| `aria-required-attr` | Atributos ARIA requeridos | 4.1.2 | A |
| `aria-roles` | Roles ARIA válidos | 4.1.2 | A |
| `aria-valid-attr` | Atributos ARIA válidos | 4.1.2 | A |
| `aria-valid-attr-value` | Valores ARIA válidos | 4.1.2 | A |
| `aria-hidden-body` | ARIA hidden en body | 4.1.2 | A |
| `duplicate-id-active` | IDs duplicados en elementos activos | 4.1.1 | A |
| `duplicate-id-aria` | IDs duplicados en referencias ARIA | 4.1.1 | A |

## Lighthouse vs WCAG Resources

The Lighthouse audits resource answers a different question than the WCAG criteria resource:

| Resource | Question it answers | Example |
|----------|-------------------|---------|
| `lighthouse://audits` | What can Lighthouse detect? | "Does Lighthouse check for missing alt text?" |
| `wcag://criteria` | What does WCAG require? | "What does criterion 1.1.1 say?" |

Use both together for full context: look up the Lighthouse audit to understand what was tested, then look up the WCAG criterion for the full requirement and remediation guidance.

## Programmatic Access

```typescript
const allAudits = await client.readResource({
  uri: 'lighthouse://audits'
});

const colorContrast = await client.readResource({
  uri: 'lighthouse://audits/color-contrast'
});

const levelAA = await client.readResource({
  uri: 'lighthouse://audits/level/AA'
});

const perceivable = await client.readResource({
  uri: 'lighthouse://audits/principle/perceivable'
});
```

## Use with Tools

Lighthouse audit resources complement the analysis tools:

1. **Run analysis**: Use `analyze-with-lighthouse` to get the score and failing audits
2. **Look up audit**: Use `lighthouse://audits/{auditId}` to understand what the audit checks
3. **Look up WCAG criterion**: Use `wcag://criteria/{id}` for the full WCAG requirement
4. **Prioritize fixes**: Focus on audits with the highest score impact

**Example workflow:**

```
1. Analyze https://example.com with Lighthouse → score 72/100
2. Find failing audit "color-contrast"
3. Look up lighthouse://audits/color-contrast → WCAG 1.4.3, Level AA
4. Look up wcag://criteria/1.4.3 → full requirement details
5. Use analyze-contrast for detailed contrast analysis
```

## Related Resources

- [WCAG Criteria](./wcag-criteria.md) - Full WCAG criterion details
- [Contrast Thresholds](./contrast-thresholds.md) - Contrast ratio requirements
- [analyze-with-lighthouse Tool](../tools/analyze-with-lighthouse.md) - Run Lighthouse analysis
- [lighthouse-audit Prompt](../prompts/lighthouse-audit.md) - Score-focused audit workflow
