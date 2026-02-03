import { z } from 'zod';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';
import type { AccessibilityIssue, AnalysisResult, CombinedAnalysisResult } from '@/shared/types/accessibility.js';
import { BaseToolInputSchema, BrowserOptionsSchema } from '@/tools/Base/types/base.types.js';

export const CombinedAnalysisInputSchema = BaseToolInputSchema.extend({
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
