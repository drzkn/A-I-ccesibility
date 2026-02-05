# pre-deploy-check

Verify accessibility compliance before deployment.

## Description

This prompt performs a deployment-focused accessibility check, providing a clear GO/NO-GO decision based on critical issues. It identifies blocking vs non-blocking issues and provides a risk assessment for deployment.

**Best for:** Deployment gates, release checklists, and compliance verification.

## Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `url` | string | ✅ | - | URL of the staging/pre-production page |

## Example Usage

### Basic Usage

```
Use the pre-deploy-check prompt for https://staging.my-app.com
```

### Natural Language

```
Check if https://staging.my-site.com is ready to deploy from an accessibility standpoint
```

## Output Includes

The prompt generates a deployment-focused report with:

- **GO/NO-GO Decision**: Clear deployment recommendation
- **Blocking Issues**: Critical problems that must be fixed before deployment
- **Non-Blocking Issues**: Issues to track but don't block deployment
- **WCAG Compliance Status**: Level AA conformance assessment
- **Risk Assessment**: Potential impact of deploying with current issues
- **Action Items**: Specific steps before deployment

### Decision Categories

| Decision | Meaning |
|----------|---------|
| ✅ **GO** | No critical issues, safe to deploy |
| ⚠️ **GO WITH CAUTION** | Minor issues exist, document and track them |
| ❌ **NO-GO** | Critical issues must be fixed before deployment |

### Example Output Structure

```
## Pre-Deploy Accessibility Check

### 🚦 Deployment Decision: ⚠️ GO WITH CAUTION

---

### Summary
- **Critical Issues**: 0
- **Serious Issues**: 2
- **Moderate Issues**: 4

### Blocking Issues
None - no critical accessibility violations detected.

### Non-Blocking Issues (Track in Backlog)

#### Serious (2)
1. **Insufficient contrast on footer links**
   - Impact: Low-vision users may struggle to read
   - Risk: Low - affects non-critical content
   - Track as: JIRA-1234

2. **Missing skip-to-content link**
   - Impact: Keyboard users must tab through navigation
   - Risk: Medium - affects keyboard navigation
   - Track as: JIRA-1235

### WCAG 2.1 Level AA Compliance
- **Perceivable**: ⚠️ 2 issues
- **Operable**: ✅ Pass
- **Understandable**: ✅ Pass
- **Robust**: ✅ Pass

### Risk Assessment
**Low Risk** - Issues are non-critical and affect limited user segments.
Recommend deploying with issues tracked in backlog for next sprint.

### Action Items Before Deploy
1. ✅ Review and accept non-blocking issues
2. ✅ Create tickets for backlog items
3. ✅ Document known accessibility limitations
```

## Workflow Integration

### CI/CD Pipeline

```yaml
# Example GitHub Actions step
- name: Accessibility Check
  run: |
    # Use pre-deploy-check prompt via MCP client
    # Fail pipeline if NO-GO decision
```

### Release Checklist

1. Run `pre-deploy-check` on staging URL
2. Review GO/NO-GO decision
3. If NO-GO: Fix blocking issues and re-run
4. If GO WITH CAUTION: Create backlog tickets
5. If GO: Proceed with deployment

## When to Use

| Scenario | Recommended |
|----------|-------------|
| Before production deployment | ✅ Yes |
| Release gate check | ✅ Yes |
| Staging environment review | ✅ Yes |
| During development | Use `quick-accessibility-check` instead |
| Comprehensive audit | Use `full-accessibility-audit` instead |

## Related

- [quick-accessibility-check](./quick-accessibility-check.md) - Faster check for development
- [full-accessibility-audit](./full-accessibility-audit.md) - Comprehensive audit with remediation
- [Workflows Guide](../guides/workflows.md) - Pre-deploy workflow details
