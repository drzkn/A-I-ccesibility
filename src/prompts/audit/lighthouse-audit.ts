import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to analyze'),
  wcagLevel: z
    .enum(['A', 'AA', 'AAA'])
    .optional()
    .describe('WCAG conformance level (default: AA)'),
};

type LighthouseAuditArgs = {
  url: string;
  wcagLevel?: 'A' | 'AA' | 'AAA' | undefined;
  language?: string | undefined;
};

export const lighthouseAuditPrompt: PromptDefinition = {
  name: 'lighthouse-audit',
  title: 'Lighthouse Accessibility Audit',
  description:
    'Accessibility audit focused on the Lighthouse accessibility score with actionable recommendations to improve it',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema,
      },
      async ({ url, wcagLevel = 'AA' }: LighthouseAuditArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Run a Lighthouse accessibility audit on ${url}.

Use the analyze-with-lighthouse tool with these parameters:
- url: "${url}"
- options:
  - wcagLevel: "${wcagLevel}"

After the analysis, provide a report structured as follows:

1. **Accessibility Score**
   - Display the score prominently (0-100)
   - Qualitative rating: Poor (< 50), Needs Improvement (50-89), Good (90-100)
   - Number of passed vs failed audits

2. **Failed Audits**
   For each failed audit, ordered by impact on the score:
   - Audit name and related WCAG ${wcagLevel} criterion
   - Affected elements (selectors and snippets)
   - Why it matters for real users
   - Concrete fix with a before/after code example

3. **Audits That Need Manual Review**
   List any audits Lighthouse flagged as "not applicable" or "manual" that may still be relevant, with guidance on how to verify them.

4. **Score Improvement Roadmap**
   - Group fixes into tiers: Quick Wins (< 5 min each), Medium Effort, and Larger Refactors
   - For each tier, estimate the potential score improvement after applying all fixes in that tier
   - Provide a recommended order of implementation

5. **Summary**
   - Top 3 actions that would have the biggest positive impact on the score
   - Recommendation on whether to complement with axe-core or Pa11y for issues Lighthouse does not cover`,
              },
            },
          ],
        };
      },
    );
  },
};
