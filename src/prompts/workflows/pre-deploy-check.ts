import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to verify before deployment'),
  minScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Minimum Lighthouse accessibility score to pass (default: 90)'),
};

type PreDeployCheckArgs = {
  url: string;
  minScore?: number | undefined;
};

export const preDeployCheckPrompt: PromptDefinition = {
  name: 'pre-deploy-check',
  title: 'Pre-Deploy Accessibility Check',
  description:
    'Verify accessibility compliance before deploying to production using axe-core, Pa11y, and Lighthouse',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ url, minScore = 90 }: PreDeployCheckArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform a pre-deployment accessibility verification of ${url}.

Step 1: Use the analyze-mixed tool with these parameters:
- url: "${url}"
- tools: ["axe-core", "pa11y"]
- options:
  - wcagLevel: "AA"
  - deduplicateResults: true

Step 2: Use the analyze-with-lighthouse tool with these parameters:
- url: "${url}"
- options:
  - wcagLevel: "AA"

This is a **deployment gate check**. The minimum required Lighthouse accessibility score is **${minScore}/100**. Provide a clear GO/NO-GO decision based on both the accessibility issues found and the Lighthouse score.

## Required Output Format

### 1. Deployment Decision
Provide a clear status based on BOTH the Lighthouse score and the issues found:
- ✅ **GO** - Lighthouse score >= ${minScore} AND no critical or serious issues found
- ⚠️ **GO WITH CAUTION** - Lighthouse score >= ${minScore} BUT minor issues exist, OR score is slightly below threshold (${minScore - 5}-${minScore - 1}) with no critical issues
- ❌ **NO-GO** - Lighthouse score < ${minScore - 5} OR critical/serious issues found regardless of score

### 2. Lighthouse Score Gate
- **Score**: [0-100] — [Poor < 50 | Needs Improvement 50-89 | Good 90-100]
- **Threshold**: ${minScore}
- **Result**: PASS / FAIL
- **Key failing audits** that drag the score down (if applicable)

### 3. Blocking Issues (if any)
List issues that MUST be fixed before deployment:
- Critical violations that affect core functionality
- Serious issues that block user access
- Legal compliance risks (WCAG 2.1 AA failures)
- Lighthouse audits that significantly reduce the score

For each blocking issue, provide:
- Issue description
- Affected element/selector
- Which tool detected it (axe-core, Pa11y, Lighthouse)
- Impact on users
- Quick fix recommendation

### 4. Non-Blocking Issues
Issues that should be addressed but don't block deployment:
- Minor accessibility improvements
- Enhancement opportunities
- Best practice recommendations

### 5. Compliance Summary
- **Lighthouse Accessibility Score**: [score]/100
- WCAG 2.1 Level AA conformance status
- Key success criteria passed/failed
- Risk assessment for deployment

### 6. Recommended Actions
If NO-GO:
- List exact fixes needed with priority order
- Highlight fixes that will most improve the Lighthouse score
- Estimate effort for each fix
- Suggest which issues to address first to reach the ${minScore} score threshold

If GO:
- List post-deployment improvements to schedule
- Provide timeline recommendations for non-blocking fixes
- Suggest a target score for the next deployment cycle`
              }
            }
          ]
        };
      }
    );
  }
};
