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
    'Comprehensive accessibility audit using axe-core, Pa11y, and Lighthouse with detailed remediation guidance',

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

Step 1: Use the analyze-mixed tool with these parameters:
- url: "${url}"
- tools: ["axe-core", "pa11y"]
- options:
  - wcagLevel: "${wcagLevel}"
  - deduplicateResults: true

Step 2: Use the analyze-with-lighthouse tool with these parameters:
- url: "${url}"
- options:
  - wcagLevel: "${wcagLevel}"

After both analyses complete, provide a detailed report that includes:

1. **Executive Summary**
   - **Lighthouse Accessibility Score** (0-100) with a qualitative assessment (Poor < 50, Needs Improvement 50-89, Good 90-100)
   - Total number of unique issues found across all tools
   - Breakdown by severity (critical, serious, moderate, minor)
   - Overall WCAG ${wcagLevel} conformance assessment

2. **Issues by WCAG Principle**
   Group all issues (from axe-core, Pa11y, and Lighthouse) under the four WCAG principles:
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
   - Which tool(s) detected it (axe-core, Pa11y, Lighthouse)

4. **Prioritized Remediation Plan**
   Order fixes by:
   - Severity (critical first)
   - Impact on Lighthouse score (fixes that most improve the score first)
   - User impact (most affected users first)
   - Effort required (quick wins vs. larger refactors)

5. **Code Examples**
   Provide before/after code snippets for the top issues.

6. **Score Improvement Projection**
   Estimate how much the Lighthouse accessibility score could improve after fixing the critical and serious issues identified.`
              }
            }
          ]
        };
      }
    );
  }
};
