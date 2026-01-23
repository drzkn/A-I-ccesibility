import { z } from 'zod';

export const AnalysisTargetTypeSchema = z.enum(['url', 'html', 'file']);
export type AnalysisTargetType = z.infer<typeof AnalysisTargetTypeSchema>;

export const AnalysisTargetSchema = z.object({
  type: AnalysisTargetTypeSchema,
  value: z.string(),
  options: z
    .object({
      waitForSelector: z.string().optional(),
      timeout: z.number().positive().optional(),
      viewport: z
        .object({
          width: z.number().positive(),
          height: z.number().positive(),
        })
        .optional(),
      ignoreHTTPSErrors: z.boolean().optional(),
    })
    .optional(),
});
export type AnalysisTarget = z.infer<typeof AnalysisTargetSchema>;

export const AnalysisOptionsSchema = z.object({
  includeWarnings: z.boolean().optional().default(true),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional().default('AA'),
  rules: z.array(z.string()).optional(),
  excludeRules: z.array(z.string()).optional(),
});
export type AnalysisOptions = z.infer<typeof AnalysisOptionsSchema>;
