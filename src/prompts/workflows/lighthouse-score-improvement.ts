import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to improve'),
  targetScore: z
    .number()
    .min(0)
    .max(100)
    .optional()
    .describe('Target Lighthouse accessibility score to achieve (default: 90)'),
};

type LighthouseScoreImprovementArgs = {
  url: string;
  targetScore?: number | undefined;
};

export const lighthouseScoreImprovementPrompt: PromptDefinition = {
  name: 'lighthouse-score-improvement',
  title: 'Lighthouse Score Improvement Plan',
  description:
    'Analyze a page with Lighthouse and provide a prioritized improvement plan to reach a target accessibility score',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema,
      },
      async ({
        url,
        targetScore = 90,
      }: LighthouseScoreImprovementArgs): Promise<PromptResult> => {
        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Analyze ${url} with Lighthouse and create a plan to reach an accessibility score of ${targetScore}/100.

Use the analyze-with-lighthouse tool with these parameters:
- url: "${url}"
- options:
  - wcagLevel: "AA"

After the analysis, provide the following report:

## 1. Current State

- **Current Score**: [0-100]
- **Target Score**: ${targetScore}/100
- **Gap**: [points needed]
- **Rating**: Poor (< 50) | Needs Improvement (50-89) | Good (90-100)
- **Total failing audits**: [count]
- **Total passing audits**: [count]

## 2. Score Impact Analysis

Lighthouse weights each audit differently. List every failing audit sorted by **estimated impact on the score** (highest first):

| # | Audit | WCAG Criterion | Weight/Impact | Affected Elements | Effort |
|---|-------|---------------|---------------|-------------------|--------|
| 1 | [audit name] | [criterion] | [High/Medium/Low] | [count] | [estimate] |

For each failing audit, briefly explain what it checks and why it matters.

## 3. Improvement Plan

Organize fixes into phases that build toward the target score of ${targetScore}:

### Phase 1: Critical Fixes (estimated score after: [X]/100)
These are the audits with the highest score impact that should be fixed first.
For each fix:
- **Audit**: [name]
- **Current state**: [what's wrong]
- **Required change**: [specific fix]
- **Code example**:
  \`\`\`html
  <!-- Before -->
  <problematic code>

  <!-- After -->
  <fixed code>
  \`\`\`
- **Estimated score gain**: [points]

### Phase 2: Important Fixes (estimated score after: [X]/100)
Medium-impact audits that bring the score closer to the target.
Same detail format as Phase 1.

### Phase 3: Final Polish (estimated score after: [X]/100)
Lower-impact fixes needed to reach or exceed the ${targetScore} target.
Same detail format as Phase 1.

## 4. Audits That Need Manual Review

List audits Lighthouse flagged as requiring manual verification. For each one, describe how to test it and what to look for.

## 5. Progress Tracking

Provide a checklist to track implementation progress:

\`\`\`markdown
## Score Improvement Checklist for ${url}
Target: ${targetScore}/100

### Phase 1 — Critical Fixes
- [ ] Fix 1
- [ ] Fix 2

### Phase 2 — Important Fixes
- [ ] Fix 3
- [ ] Fix 4

### Phase 3 — Final Polish
- [ ] Fix 5
- [ ] Fix 6
\`\`\`

## 6. Beyond the Target

If the current score is already >= ${targetScore}, acknowledge the achievement and suggest further improvements to reach a perfect 100. Otherwise, after reaching ${targetScore}, recommend:
- Additional audits to address for an even higher score
- Complementary tools (axe-core, Pa11y) to catch issues Lighthouse does not cover
- Ongoing monitoring strategy to prevent score regression`,
              },
            },
          ],
        };
      },
    );
  },
};
