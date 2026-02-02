import { z } from 'zod';

export const ContrastToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  options: z
    .object({
      contrastAlgorithm: z
        .enum(['WCAG21', 'APCA'])
        .default('WCAG21')
        .describe('Contrast algorithm: WCAG21 (standard) or APCA (WCAG 3.0 draft - experimental)'),
      wcagLevel: z
        .enum(['AA', 'AAA'])
        .default('AA')
        .describe('WCAG conformance level: AA (4.5:1 normal, 3:1 large) or AAA (7:1 normal, 4.5:1 large)'),
      suggestFixes: z
        .boolean()
        .default(true)
        .describe('Suggest color corrections for failing elements'),
      includePassingElements: z
        .boolean()
        .default(false)
        .describe('Include elements that pass contrast requirements in results'),
      selector: z
        .string()
        .optional()
        .describe('CSS selector to scope analysis to specific element'),
      browser: z
        .object({
          waitForSelector: z.string().optional().describe('CSS selector to wait for'),
          waitForTimeout: z.number().int().positive().max(60000).optional(),
          viewport: z
            .object({
              width: z.number().int().positive().default(1280),
              height: z.number().int().positive().default(720),
            })
            .optional(),
          ignoreHTTPSErrors: z
            .boolean()
            .default(false)
            .describe('Ignore HTTPS certificate errors (for local dev servers with self-signed certs)'),
        })
        .optional(),
    })
    .optional(),
});
