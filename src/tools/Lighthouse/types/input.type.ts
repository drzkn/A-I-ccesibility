import { z } from 'zod';
import { BrowserOptionsSchema } from '@/tools/Base/types/base.types.js';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';

export const LighthouseToolMcpInputSchema = z.object({
  url: z.string().url().describe('URL of the page to analyze'),
  options: z
    .object({
      wcagLevel: WCAGLevelSchema.default('AA').describe('WCAG conformance level to check'),
      browser: BrowserOptionsSchema.optional(),
    })
    .optional(),
});
