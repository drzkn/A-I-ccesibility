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

type FullAuditArgs = {
  url: string;
  wcagLevel?: 'A' | 'AA' | 'AAA' | undefined;
  language?: string | undefined;
};

export const fullAccessibilityAuditPrompt: PromptDefinition = {
  name: 'full-accessibility-audit',
  title: 'Full Accessibility Audit',
  description:
    'Comprehensive accessibility audit using axe-core and Pa11y with detailed remediation guidance',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ url, wcagLevel = 'AA' }: FullAuditArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform a comprehensive accessibility audit of ${url}.

Use the analyze-mixed tool with these parameters:
- url: "${url}"
- tools: ["axe-core", "pa11y"]
- options:
  - wcagLevel: "${wcagLevel}"
  - deduplicateResults: true

After the analysis, provide a detailed report that includes:

1. **Executive Summary**
   - Total number of issues found
   - Breakdown by severity (critical, serious, moderate, minor)
   - Overall WCAG ${wcagLevel} conformance assessment

2. **Issues by WCAG Principle**
   Group all issues under the four WCAG principles:
   - Perceivable: Content must be presentable to users
   - Operable: UI components must be operable
   - Understandable: Information and UI operation must be understandable
   - Robust: Content must be robust enough for assistive technologies

3. **Critical Issues Requiring Immediate Attention**
   For each critical/serious issue:
   - What the issue is
   - Where it occurs (element/selector)
   - Which users are affected (screen reader users, keyboard users, etc.)
   - Why it matters (real-world impact)

4. **Prioritized Remediation Plan**
   Order fixes by:
   - Severity (critical first)
   - User impact (most affected users first)
   - Effort required (quick wins vs. larger refactors)

5. **Code Examples**
   Provide before/after code snippets for the top issues.`
              }
            }
          ]
        };
      }
    );
  }
};
