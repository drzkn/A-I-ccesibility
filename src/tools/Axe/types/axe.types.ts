import { z } from 'zod';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';

const ViewportSchema = z
  .object({
    width: z.number().int().positive().default(1280).describe('Viewport width in pixels'),
    height: z.number().int().positive().default(720).describe('Viewport height in pixels'),
  })
  .describe('Browser viewport dimensions');

const BrowserOptionsSchema = z
  .object({
    waitForSelector: z.string().optional().describe('CSS selector to wait for before analysis'),
    waitForTimeout: z
      .number()
      .int()
      .positive()
      .max(60000)
      .optional()
      .describe('Time to wait in ms before analysis (max 60s)'),
    viewport: ViewportSchema.optional(),
    ignoreHTTPSErrors: z
      .boolean()
      .optional()
      .describe('Ignore HTTPS certificate errors (useful for local dev servers with self-signed certs)'),
  })
  .describe('Browser behavior options');

export const AxeToolInputSchema = z
  .object({
    url: z.string().url().optional().describe('URL of the page to analyze'),
    html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
    options: z
      .object({
        wcagLevel: WCAGLevelSchema.default('AA').describe('WCAG conformance level to check'),
        rules: z.array(z.string()).optional().describe('Specific axe rule IDs to run'),
        excludeRules: z.array(z.string()).optional().describe('Axe rule IDs to exclude'),
        includeIncomplete: z
          .boolean()
          .default(false)
          .describe('Include incomplete/needs-review results'),
        selector: z
          .string()
          .optional()
          .describe('CSS selector to scope analysis to specific element'),
        browser: BrowserOptionsSchema.optional(),
      })
      .optional(),
  })
  .refine((data) => data.url !== undefined || data.html !== undefined, {
    message: 'Either url or html must be provided',
  })
  .refine((data) => !(data.url !== undefined && data.html !== undefined), {
    message: 'Provide either url or html, not both',
  })
  .describe('Input for axe-core accessibility analysis');

export type AxeToolInput = z.infer<typeof AxeToolInputSchema>;

export interface AxeToolOutput {
  success: boolean;
  target: string;
  issueCount: number;
  issues: AnalysisResult['issues'];
  summary: AnalysisResult['summary'];
  metadata?: AnalysisResult['metadata'] | undefined;
  duration?: number | undefined;
  error?: string | undefined;
}
