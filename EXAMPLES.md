# Ejemplos de Uso - AI-ccesibility

Ejemplos concretos de inputs y outputs para cada herramienta MCP.

## Tabla de Contenidos

- [analyze-with-axe](#analyze-with-axe)
- [analyze-with-pa11y](#analyze-with-pa11y)
- [analyze-contrast](#analyze-contrast)
- [analyze-mixed](#analyze-mixed)

---

## analyze-with-axe

### Ejemplo 1: Análisis básico de URL

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
      "humanContext": "**Contenido no textual (WCAG 1.1.1 - Nivel A)**\n\nTodo contenido no textual debe tener una alternativa de texto...",
      "suggestedActions": [
        "Añadir atributo alt descriptivo a imágenes",
        "Usar aria-label para iconos decorativos con función",
        "Marcar imágenes decorativas con alt=\"\" vacío"
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

### Ejemplo 2: Análisis de HTML raw

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
      "humanContext": "**Información y relaciones (WCAG 1.3.1 - Nivel A)**...",
      "suggestedActions": [
        "Asociar labels con inputs correctamente",
        "Usar aria-label si label visible no es posible"
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

### Ejemplo 3: Con opciones avanzadas

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

### Ejemplo 1: Análisis con standard específico

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
      "humanContext": "**Contenido no textual (WCAG 1.1.1 - Nivel A)**...",
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

### Ejemplo 1: Análisis básico de contraste

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

### Ejemplo 2: Análisis con nivel AAA

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

### Ejemplo 3: Análisis de sección específica

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

### Ejemplo 4: HTML con análisis de contraste

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

### Ejemplo 1: Análisis combinado básico

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
      "humanContext": "**Contenido no textual (WCAG 1.1.1 - Nivel A)**...",
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

### Ejemplo 2: Sin deduplicación

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

**Nota:** Ambos detectaron la misma imagen sin `alt`, pero con diferentes selectores.

---

### Ejemplo 3: Con viewport móvil

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

## Comparación de Outputs por Herramienta

### Mismo Issue detectado por diferentes tools

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

## Resumen de Diferencias

| Característica | axe-core | Pa11y | Contrast |
|----------------|----------|-------|----------|
| **Target** | URL/HTML | URL/HTML | URL/HTML |
| **Selector** | CSS compacto | CSS completo | CSS compacto |
| **Severidades** | 4 niveles | 3 tipos | 4 niveles |
| **Snippet** | ✅ | ✅ | ✅ |
| **Confidence** | ✅ | ✅ | Siempre 1 |
| **Browser** | Puppeteer | Puppeteer | Puppeteer |
| **Velocidad** | ~2-3s | ~2s | ~1-2s |
| **Falsos positivos** | Pocos | Moderados | Muy pocos |
| **Sugerencias de fix** | - | - | ✅ Colores |

---

## Tips para Interpretar Resultados

### 1. Priorizar por Matriz

```
Critical + Low effort = Fix HOY
Critical + Medium/High effort = Planificar sprint
High + Low effort = Quick wins
Medium/Low + High effort = Backlog
```

### 2. Validar Duplicados

Si `deduplicatedCount` > `issueCount`, revisa `individualResults` para ver qué herramienta es más confiable para ese tipo de issue.

### 3. Revisar `affectedUsers`

Prioriza issues que afecten a usuarios de screen readers y keyboard-only (más comunes).

### 4. Aprovechar `humanContext`

Lee los ejemplos del mundo real para entender el impacto real en usuarios.

---

## Next Steps

- Ver [USAGE.md](./USAGE.md) para workflows completos
- Ver [README.md](./README.md) para configuración
- Ver `src/shared/data/README.md` para añadir más criterios WCAG
