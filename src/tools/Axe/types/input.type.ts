import { z } from 'zod';

export const AxeToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  options: z
    .object({
      wcagLevel: z
        .enum(['A', 'AA', 'AAA'])
        .default('AA')
        .describe('WCAG conformance level to check'),
      rules: z.array(z.string()).optional().describe('Specific axe rule IDs to run'),
      excludeRules: z.array(z.string()).optional().describe('Axe rule IDs to exclude'),
      includeIncomplete: z
        .boolean()
        .default(false)
        .describe('Include incomplete/needs-review results'),
      selector: z.string().optional().describe('CSS selector to scope analysis'),
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
