import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to analyze'),
};

type QuickCheckArgs = {
  url: string;
  language?: string | undefined;
};

export const quickAccessibilityCheckPrompt: PromptDefinition = {
  name: 'quick-accessibility-check',
  title: 'Quick Accessibility Check',
  description: 'Fast accessibility check using axe-core with summary of critical issues',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ url }: QuickCheckArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform a quick accessibility check of ${url}.

Use the axe-core tool with these parameters:
- url: "${url}"

After the analysis, provide a concise report that includes:

1. **Summary**
   - Total issues found
   - Breakdown by severity (critical, serious, moderate, minor)

2. **Critical & Serious Issues**
   For each issue:
   - Issue description
   - Affected element
   - Quick fix suggestion

3. **Next Steps**
   - Recommend running a full audit if significant issues are found
   - Highlight the most impactful quick wins`
              }
            }
          ]
        };
      }
    );
  }
};
