import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to verify before deployment'),
};

type PreDeployCheckArgs = {
  url: string;
};

export const preDeployCheckPrompt: PromptDefinition = {
  name: 'pre-deploy-check',
  title: 'Pre-Deploy Accessibility Check',
  description:
    'Verify accessibility compliance before deploying to production',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ url }: PreDeployCheckArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform a pre-deployment accessibility verification of ${url}.

Use the analyze-mixed tool with these parameters:
- url: "${url}"
- tools: ["axe-core", "pa11y"]
- options:
  - wcagLevel: "AA"
  - deduplicateResults: true

This is a **deployment gate check**. Provide a clear GO/NO-GO decision based on accessibility findings.

## Required Output Format

### 1. Deployment Decision
Provide a clear status:
- ✅ **GO** - No critical or serious issues found
- ⚠️ **GO WITH CAUTION** - Minor issues exist but not blocking
- ❌ **NO-GO** - Critical or serious issues must be fixed before deployment

### 2. Blocking Issues (if any)
List issues that MUST be fixed before deployment:
- Critical violations that affect core functionality
- Serious issues that block user access
- Legal compliance risks (WCAG 2.1 AA failures)

For each blocking issue, provide:
- Issue description
- Affected element/selector
- Impact on users
- Quick fix recommendation

### 3. Non-Blocking Issues
Issues that should be addressed but don't block deployment:
- Minor accessibility improvements
- Enhancement opportunities
- Best practice recommendations

### 4. Compliance Summary
- WCAG 2.1 Level AA conformance status
- Key success criteria passed/failed
- Risk assessment for deployment

### 5. Recommended Actions
If NO-GO:
- List exact fixes needed with priority order
- Estimate effort for each fix
- Suggest which issues to address first

If GO:
- List post-deployment improvements to schedule
- Provide timeline recommendations for non-blocking fixes`
              }
            }
          ]
        };
      }
    );
  }
};
