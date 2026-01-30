import { z } from 'zod';
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

export const Pa11yToolInputSchema = z
  .object({
    url: z.string().url().optional().describe('URL of the page to analyze'),
    html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
    options: z
      .object({
        standard: z
          .enum(['WCAG2A', 'WCAG2AA', 'WCAG2AAA', 'WCAG21A', 'WCAG21AA', 'WCAG21AAA'])
          .default('WCAG21AA')
          .describe('Accessibility standard to test against'),
        includeWarnings: z.boolean().default(true).describe('Include warnings in results'),
        includeNotices: z.boolean().default(false).describe('Include notices in results'),
        rootElement: z.string().optional().describe('CSS selector for root element to test'),
        hideElements: z
          .string()
          .optional()
          .describe('CSS selector for elements to hide from testing'),
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
  .describe('Input for Pa11y accessibility analysis');

export type Pa11yToolInput = z.infer<typeof Pa11yToolInputSchema>;

export interface Pa11yToolOutput {
  success: boolean;
  target: string;
  issueCount: number;
  issues: AnalysisResult['issues'];
  summary: AnalysisResult['summary'];
  metadata?: AnalysisResult['metadata'] | undefined;
  duration?: number | undefined;
  error?: string | undefined;
}

export interface Pa11yIssue {
  code: string;
  type: 'error' | 'warning' | 'notice';
  message: string;
  context: string;
  selector: string;
  typeCode: number;
  runner?: string;
  runnerExtras?: Record<string, unknown>;
}
