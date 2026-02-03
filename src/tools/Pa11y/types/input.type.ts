import { z } from 'zod';
import { BaseToolInputSchema, BrowserOptionsSchema } from '@/tools/Base/types/base.types.js';

export const Pa11yStandardSchema = z
  .enum(['WCAG2A', 'WCAG2AA', 'WCAG2AAA', 'WCAG21A', 'WCAG21AA', 'WCAG21AAA'])
  .describe('Accessibility standard to test against');

export const Pa11yToolMcpInputSchema = BaseToolInputSchema.extend({
  options: z
    .object({
      standard: Pa11yStandardSchema.default('WCAG21AA'),
      includeWarnings: z.boolean().default(true).describe('Include warnings in results'),
      includeNotices: z.boolean().default(false).describe('Include notices in results'),
      rootElement: z.string().optional().describe('CSS selector for root element to test'),
      hideElements: z.string().optional().describe('CSS selector for elements to hide'),
      browser: BrowserOptionsSchema.optional(),
    })
    .optional(),
});
