# Resources

MCP Resources provide **read-only data** that clients can query directly. Unlike tools (which perform actions) and prompts (which generate structured messages), resources expose static reference data that can be used for lookup, validation, or educational purposes.

## Available Resources

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| [WCAG Criteria](./wcag-criteria.md) | `wcag://criteria/*` | Complete WCAG 2.1 success criteria database |
| [Contrast Thresholds](./contrast-thresholds.md) | `contrast://thresholds/*` | Color contrast requirements by algorithm |
| [Lighthouse Audits](./lighthouse-audits.md) | `lighthouse://audits/*` | Lighthouse accessibility audit catalog with WCAG mappings |

## How to Access Resources

### In Claude Desktop

1. Resources are automatically available to the LLM for context
2. You can ask Claude to "look up WCAG criterion 1.4.3" and it will access the resource
3. Resources provide authoritative data the LLM can reference

**Example:**

```
Using the WCAG criteria resource, explain criterion 1.4.3 and why it matters
```

### In Cursor

1. Access resources via the MCP resources panel
2. Or ask the assistant to query specific resource URIs
3. Resources can be used to validate analysis results

**Example:**

```
What are the contrast thresholds for WCAG AA compliance?
```

### Programmatic Access

MCP clients can fetch resources directly:

```typescript
const resources = await client.listResources();

const wcagCriteria = await client.readResource({ 
  uri: 'wcag://criteria/1.4.3' 
});

const contrastThresholds = await client.readResource({ 
  uri: 'contrast://thresholds/wcag21' 
});

const lighthouseAudits = await client.readResource({ 
  uri: 'lighthouse://audits' 
});

const lighthouseAudit = await client.readResource({ 
  uri: 'lighthouse://audits/color-contrast' 
});
```

## Use Cases

| Use Case | Resource | Example URI |
|----------|----------|-------------|
| Learn about a specific WCAG criterion | WCAG Criteria | `wcag://criteria/1.4.3` |
| Find all perceivable requirements | WCAG Criteria | `wcag://criteria/principle/perceivable` |
| Get all Level AA criteria | WCAG Criteria | `wcag://criteria/level/AA` |
| Check contrast ratio requirements | Contrast Thresholds | `contrast://thresholds/wcag21` |
| Understand APCA vs WCAG21 differences | Contrast Thresholds | `contrast://algorithms` |
| Validate color combinations | Contrast Thresholds | `contrast://thresholds/apca` |
| Browse all Lighthouse audits | Lighthouse Audits | `lighthouse://audits` |
| Look up a specific Lighthouse audit | Lighthouse Audits | `lighthouse://audits/color-contrast` |
| Find Lighthouse audits by WCAG level | Lighthouse Audits | `lighthouse://audits/level/AA` |
| Find Lighthouse audits by principle | Lighthouse Audits | `lighthouse://audits/principle/perceivable` |

## Resources vs Tools vs Prompts

| Aspect | Resources | Tools | Prompts |
|--------|-----------|-------|---------|
| **Purpose** | Reference data lookup | Perform analysis | Structured workflows |
| **Invocation** | Client queries URI | LLM executes automatically | User selects template |
| **Input required** | None (read-only) | URL, options, etc. | Arguments like URL |
| **Output** | Static data | Analysis results | Guided output format |
| **Example** | `wcag://criteria/1.4.3` | `analyze-with-axe` | `full-accessibility-audit` |

## When to Use Resources

- **Understanding WCAG requirements**: Look up what a specific criterion means
- **Checking thresholds**: Verify the contrast ratio required for AA or AAA
- **Educational purposes**: Learn about accessibility principles
- **Building custom reports**: Combine resource data with tool outputs
- **Validating results**: Cross-reference analysis results with official criteria
- **Understanding Lighthouse audits**: Look up what each Lighthouse audit checks and its WCAG mapping
