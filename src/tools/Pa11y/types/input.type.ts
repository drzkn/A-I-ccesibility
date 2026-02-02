import { z } from 'zod';

export const Pa11yToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  options: z
    .object({
      standard: z
        .enum(['WCAG2A', 'WCAG2AA', 'WCAG2AAA', 'WCAG21A', 'WCAG21AA', 'WCAG21AAA'])
        .default('WCAG21AA')
        .describe('Accessibility standard to test against'),
      includeWarnings: z
        .boolean()
        .default(true)
        .describe('Include warnings in results'),
      includeNotices: z
        .boolean()
        .default(false)
        .describe('Include notices in results'),
      rootElement: z.string().optional().describe('CSS selector for root element to test'),
      hideElements: z.string().optional().describe('CSS selector for elements to hide'),
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
