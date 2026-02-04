import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { PromptDefinition, PromptResult } from '../types/index.js';

const argsSchema = {
  url: z.string().url().describe('URL of the page to analyze'),
  selector: z
    .string()
    .optional()
    .describe('CSS selector to scope the analysis to specific elements'),
  algorithm: z
    .enum(['WCAG21', 'APCA'])
    .optional()
    .describe('Contrast algorithm: WCAG21 (standard) or APCA (WCAG 3.0 draft, experimental)'),
  wcagLevel: z
    .enum(['AA', 'AAA'])
    .optional()
    .describe('WCAG conformance level for contrast requirements (default: AA)'),
  language: z
    .string()
    .optional()
    .describe('Language for the output report (e.g., "Spanish", "English", "French")')
};

type ContrastCheckArgs = {
  url: string;
  selector?: string | undefined;
  algorithm?: 'WCAG21' | 'APCA' | undefined;
  wcagLevel?: 'AA' | 'AAA' | undefined;
  language?: string | undefined;
};

export const contrastCheckPrompt: PromptDefinition = {
  name: 'contrast-check',
  title: 'Contrast Check',
  description:
    'Analyze color contrast accessibility issues using WCAG 2.1 or APCA algorithms with fix suggestions',

  register(server: McpServer): void {
    server.registerPrompt(
      this.name,
      {
        title: this.title,
        description: this.description,
        argsSchema
      },
      async ({
        url,
        selector,
        algorithm = 'WCAG21',
        wcagLevel = 'AA',
        language
      }: ContrastCheckArgs): Promise<PromptResult> => {
        const languageInstruction = language
          ? `\n\n**Important:** Provide the entire report in ${language}.`
          : '';

        const selectorInstruction = selector
          ? `\n- options.selector: "${selector}"`
          : '';

        const algorithmDescription =
          algorithm === 'APCA'
            ? 'APCA (Accessible Perceptual Contrast Algorithm - WCAG 3.0 draft)'
            : 'WCAG 2.1 standard luminance-based contrast';

        const thresholdInfo =
          algorithm === 'APCA'
            ? `
APCA Thresholds:
- Body text: Lc 75 minimum
- Large text: Lc 60 minimum
- Non-text elements: Lc 45 minimum`
            : `
WCAG ${wcagLevel} Thresholds:
- Normal text: ${wcagLevel === 'AAA' ? '7:1' : '4.5:1'} minimum
- Large text: ${wcagLevel === 'AAA' ? '4.5:1' : '3:1'} minimum`;

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Perform a color contrast accessibility analysis of ${url}.${languageInstruction}

Use the analyze-contrast tool with these parameters:
- url: "${url}"
- options:
  - contrastAlgorithm: "${algorithm}"
  - wcagLevel: "${wcagLevel}"
  - suggestFixes: true
  - includePassingElements: false${selectorInstruction}

Algorithm: ${algorithmDescription}
${thresholdInfo}

After the analysis, provide a detailed report that includes:

1. **Contrast Analysis Summary**
   - Total elements analyzed
   - Number of passing vs failing elements
   - Breakdown by text size (normal text vs large text)
   - Overall compliance percentage

2. **Failing Elements**
   For each contrast failure:
   - Element description and location (CSS selector)
   - Current foreground and background colors
   - Current contrast ratio vs required ratio
   - Text size classification (normal/large)
   - Which WCAG criterion is violated (1.4.3 or 1.4.6)

3. **Suggested Color Fixes**
   For each failing element, provide:
   - Recommended foreground color adjustment
   - Recommended background color adjustment
   - The resulting contrast ratio after the fix
   - Visual preview if possible (hex colors)

4. **Implementation Guide**
   - CSS code snippets for applying the fixes
   - Best practices for maintaining contrast across the site
   - Considerations for dark mode/theme variations

5. **Priority Recommendations**
   Order fixes by:
   - User impact (primary content first)
   - Visibility (navigation, headings, key CTAs)
   - Effort required (simple color change vs design system update)`
              }
            }
          ]
        };
      }
    );
  }
};
