# Resources

MCP Resources provide structured data that can be used for accessibility analysis and education.

## Available Resources

| Resource | URI | Description |
|----------|-----|-------------|
| [WCAG Criteria](./wcag-criteria.md) | `wcag://criteria` | Complete WCAG 2.1 success criteria database |
| [Contrast Thresholds](./contrast-thresholds.md) | `contrast://thresholds` | Color contrast requirements by algorithm |

## How to Access Resources

### In Claude Desktop

Resources are automatically available. Reference them in your prompts:

```
Using the WCAG criteria resource, explain criterion 1.4.3
```

### In Cursor

Access resources through the MCP protocol:

```
What are the contrast thresholds for WCAG AA compliance?
```

### Programmatic Access

Resources can be accessed via the MCP protocol:

```typescript
const wcagCriteria = await client.readResource("wcag://criteria");
const contrastThresholds = await client.readResource("contrast://thresholds");
```

## Use Cases

| Use Case | Resource |
|----------|----------|
| Understanding WCAG requirements | `wcag://criteria` |
| Checking contrast ratios | `contrast://thresholds` |
| Building accessibility reports | Both |
| Educational purposes | `wcag://criteria` |
| Validating color combinations | `contrast://thresholds` |
