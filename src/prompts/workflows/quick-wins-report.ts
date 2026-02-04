import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to analyze for quick wins'),
};

type QuickWinsReportArgs = {
  url: string;
};

export const quickWinsReportPrompt: PromptDefinition = {
  name: 'quick-wins-report',
  title: 'Accessibility Quick Wins Report',
  description:
    'Identify high-impact accessibility issues that require minimal effort to fix',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ url }: QuickWinsReportArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Analyze ${url} and identify accessibility quick wins.

Use the analyze-mixed tool with these parameters:
- url: "${url}"
- tools: ["axe-core", "pa11y"]
- options:
  - wcagLevel: "AA"
  - deduplicateResults: true

## Quick Wins Criteria

Focus on issues that are:
1. **High Impact** - Significantly improve accessibility for many users
2. **Low Effort** - Can be fixed in minutes to a few hours
3. **High Confidence** - Clear, actionable fixes with known solutions

## Required Output Format

### 1. Quick Wins Summary
Total quick wins found and estimated total time to fix all of them.

### 2. Priority Quick Wins List

For each quick win, provide:

| Priority | Issue | Impact | Effort | Fix |
|----------|-------|--------|--------|-----|
| 1 | [Issue name] | [Users affected] | [Time estimate] | [Quick fix] |

#### Detailed Quick Wins

For each issue in the table, expand with:

**[Issue Name]**
- **What**: Brief description of the issue
- **Where**: Element selector or location
- **Impact**: Who is affected and how
- **Fix**: Step-by-step fix instructions
- **Code Example**:
  \`\`\`html
  <!-- Before -->
  <problematic code>
  
  <!-- After -->
  <fixed code>
  \`\`\`
- **Time**: Estimated fix time

### 3. Common Quick Win Categories

Typically include:
- Missing alt text on images (5 min per image)
- Missing form labels (5 min per field)
- Low color contrast (10 min per element)
- Missing document language (2 min)
- Empty links or buttons (5 min each)
- Missing skip links (15 min)
- Incorrect heading hierarchy (10 min)

### 4. Issues NOT Considered Quick Wins

List issues found that require more significant effort:
- Complex JavaScript interactions
- Major layout/design changes
- Third-party component issues
- Architectural changes

These should be tracked for future sprints.

### 5. Implementation Checklist

Provide a copyable checklist:
\`\`\`markdown
## Accessibility Quick Wins Checklist for ${url}

- [ ] Quick win 1
- [ ] Quick win 2
- [ ] Quick win 3
...
\`\`\`

### 6. Impact Estimation

After implementing all quick wins:
- Estimated improvement in accessibility score
- Number of additional users who will have better access
- WCAG criteria that will be addressed`
              }
            }
          ]
        };
      }
    );
  }
};
