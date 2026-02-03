import { z } from 'zod';
import { BaseToolInputSchema, BrowserOptionsSchema } from '@/tools/Base/types/base.types.js';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';

export const AxeToolMcpInputSchema = BaseToolInputSchema.extend({
  options: z
    .object({
      wcagLevel: WCAGLevelSchema.default('AA').describe('WCAG conformance level to check'),
      rules: z.array(z.string()).optional().describe('Specific axe rule IDs to run'),
      excludeRules: z.array(z.string()).optional().describe('Axe rule IDs to exclude'),
      includeIncomplete: z
        .boolean()
        .default(false)
        .describe('Include incomplete/needs-review results'),
      selector: z.string().optional().describe('CSS selector to scope analysis'),
      browser: BrowserOptionsSchema.optional(),
    })
    .optional(),
});
