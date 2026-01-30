import { z } from 'zod';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';
import type { AccessibilityIssue, AnalysisResult, CombinedAnalysisResult } from '@/shared/types/accessibility.js';

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

export const CombinedAnalysisInputSchema = z
  .object({
    url: z.string().url().optional().describe('URL of the page to analyze'),
    html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
    tools: z
      .array(z.enum(['axe-core', 'pa11y']))
      .min(1)
      .default(['axe-core', 'pa11y'])
      .describe('Tools to run for web analysis'),
    options: z
      .object({
        wcagLevel: WCAGLevelSchema.default('AA'),
        deduplicateResults: z
          .boolean()
          .default(true)
          .describe('Merge similar issues from different tools'),
        browser: BrowserOptionsSchema.optional(),
      })
      .optional(),
  })
  .refine(
    (data) => data.url !== undefined || data.html !== undefined,
    { message: 'Provide url or html to analyze' }
  )
  .describe('Input for combined web accessibility analysis (axe-core + Pa11y)');

export type CombinedAnalysisInput = z.infer<typeof CombinedAnalysisInputSchema>;

export interface CombinedToolOutput {
  success: boolean;
  target: string;
  toolsUsed: Array<'axe-core' | 'pa11y'>;
  issueCount: number;
  deduplicatedCount: number;
  issues: AccessibilityIssue[];
  issuesByWCAG: Record<string, AccessibilityIssue[]>;
  summary: CombinedAnalysisResult['summary'];
  individualResults: AnalysisResult[];
  duration?: number | undefined;
  error?: string | undefined;
}
