import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';
import wcagCriteria from '../../shared/data/wcag-criteria.json' with { type: 'json' };

const argsSchema = {
  criterion: z
    .string()
    .describe('WCAG criterion ID (e.g., 1.1.1, 2.4.4, 1.4.3)'),
};

type ExplainWcagArgs = {
  criterion: string;
};

interface WcagCriterionData {
  criterion: string;
  level: string;
  principle: string;
  title: string;
  description: string;
  userImpact: {
    affectedUsers: string[];
    impactDescription: string;
    realWorldExample: string;
  };
  remediation: {
    effort: string;
    priority: string;
    commonSolutions: string[];
  };
  wcagUrl: string;
}

type WcagCriteriaMap = Record<string, WcagCriterionData>;

export const explainWcagCriterionPrompt: PromptDefinition = {
  name: 'explain-wcag-criterion',
  title: 'Explain WCAG Criterion',
  description:
    'Get detailed explanation of a WCAG criterion with examples and remediation guidance',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({ criterion }: ExplainWcagArgs): Promise<PromptResult> => {
        const criteriaMap = wcagCriteria as WcagCriteriaMap;
        const data = criteriaMap[criterion];

        if (!data) {
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Explain WCAG criterion ${criterion} in detail.

The criterion "${criterion}" is not in my local database. Please provide:

1. **Overview**
   - Full name and description of the criterion
   - WCAG conformance level (A, AA, or AAA)
   - Which WCAG principle it belongs to (Perceivable, Operable, Understandable, Robust)

2. **User Impact**
   - Which users are affected (screen reader users, keyboard users, users with cognitive disabilities, etc.)
   - Real-world examples of how this issue affects users

3. **Common Failures**
   - Examples of code that violates this criterion
   - How to identify violations during testing

4. **Remediation**
   - Step-by-step solutions with code examples
   - Effort level estimate (low, medium, high)
   - Priority for fixing

5. **Resources**
   - Link to the official WCAG documentation
   - Additional learning resources

Please format the response clearly with headers and code examples where appropriate.`
                }
              }
            ]
          };
        }

        const principleNames: Record<string, string> = {
          perceivable: 'Perceivable',
          operable: 'Operable',
          understandable: 'Understandable',
          robust: 'Robust'
        };

        const principleName = principleNames[data.principle] || data.principle;

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Explain WCAG criterion ${criterion} in detail using this reference data:

**${data.title}** (Level ${data.level}, Principle: ${principleName})

**Description:** ${data.description}

**User Impact:**
- Affected users: ${data.userImpact.affectedUsers.join(', ')}
- Impact: ${data.userImpact.impactDescription}
- Real-world example: ${data.userImpact.realWorldExample}

**Remediation:**
- Effort required: ${data.remediation.effort}
- Priority: ${data.remediation.priority}
- Common solutions:
${data.remediation.commonSolutions.map((s) => `  - ${s}`).join('\n')}

**Reference:** ${data.wcagUrl}

---

Based on this data, provide a comprehensive explanation that includes:

1. **Deep Dive into the Criterion**
   - Explain what this criterion means in practical terms
   - Why it's important for web accessibility
   - How it fits within the ${principleName} principle

2. **Code Examples**
   - Show "before" code that violates this criterion
   - Show "after" code that complies
   - Explain the changes made

3. **Testing Strategies**
   - How to manually test for this criterion
   - Automated tools that can detect violations
   - Edge cases to watch for

4. **Common Mistakes**
   - Typical ways developers fail this criterion
   - How to avoid these pitfalls

5. **Additional Resources**
   - The official WCAG link provided above
   - Suggest related criteria that often need attention together

Format the response in a clear, educational manner suitable for developers learning accessibility.`
              }
            }
          ]
        };
      }
    );
  }
};
