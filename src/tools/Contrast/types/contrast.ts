import { z } from 'zod';
import { AccessibilityIssueSchema } from '@/shared/types/accessibility.js';

const UrlSchema = z.string().url().describe('URL of the page to analyze');

const HtmlSchema = z.string().min(1).describe('Raw HTML content to analyze');

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
      .describe('Ignore HTTPS certificate errors'),
  })
  .describe('Browser behavior options');

export const ContrastWCAGLevelSchema = z
  .enum(['AA', 'AAA'])
  .describe('WCAG conformance level for contrast: AA (4.5:1 normal, 3:1 large) or AAA (7:1 normal, 4.5:1 large)');

export const SuggestedFixSchema = z
  .object({
    foreground: z.string().describe('Suggested foreground color that meets contrast requirements'),
    background: z.string().describe('Suggested background color (may remain unchanged)'),
    newRatio: z.number().positive().describe('New contrast ratio with suggested colors'),
  })
  .describe('Suggested color fix to meet WCAG contrast requirements');

export const ContrastDataSchema = z
  .object({
    foreground: z.string().describe('Foreground (text) color in CSS format'),
    background: z.string().describe('Effective background color in CSS format'),
    currentRatio: z.number().positive().describe('Current contrast ratio (1:1 to 21:1)'),
    requiredRatio: z.number().positive().describe('Required ratio for WCAG compliance'),
    isLargeText: z.boolean().describe('Whether text qualifies as large text (>=18pt or >=14pt bold)'),
    fontSize: z.number().positive().optional().describe('Font size in pixels'),
    fontWeight: z.number().int().optional().describe('Font weight (100-900)'),
    suggestedFix: SuggestedFixSchema.optional(),
  })
  .describe('Contrast-specific data for the accessibility issue');

export const ContrastIssueSchema = AccessibilityIssueSchema.extend({
  contrastData: ContrastDataSchema,
}).describe('Accessibility issue with contrast-specific data');

export const ContrastToolInputSchema = z
  .object({
    url: UrlSchema.optional(),
    html: HtmlSchema.optional(),
    options: z
      .object({
        wcagLevel: ContrastWCAGLevelSchema.default('AA').describe('WCAG conformance level to check'),
        suggestFixes: z
          .boolean()
          .default(true)
          .describe('Whether to suggest color corrections for failing elements'),
        includePassingElements: z
          .boolean()
          .default(false)
          .describe('Include elements that pass contrast requirements in results'),
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
  .describe('Input for contrast accessibility analysis');

export const ContrastAnalysisResultSchema = z
  .object({
    success: z.boolean().describe('Whether the analysis completed without errors'),
    timestamp: z.string().datetime().describe('ISO 8601 timestamp of analysis'),
    duration: z.number().int().nonnegative().optional().describe('Analysis duration in milliseconds'),
    target: z.string().describe('URL or identifier of analyzed target'),
    wcagLevel: ContrastWCAGLevelSchema,
    issues: z.array(ContrastIssueSchema).describe('List of contrast issues found'),
    summary: z
      .object({
        total: z.number().int().nonnegative().describe('Total elements analyzed'),
        passing: z.number().int().nonnegative().describe('Elements meeting contrast requirements'),
        failing: z.number().int().nonnegative().describe('Elements failing contrast requirements'),
        byTextSize: z
          .object({
            normalText: z.object({
              passing: z.number().int().nonnegative(),
              failing: z.number().int().nonnegative(),
            }),
            largeText: z.object({
              passing: z.number().int().nonnegative(),
              failing: z.number().int().nonnegative(),
            }),
          })
          .optional()
          .describe('Results grouped by text size'),
      })
      .describe('Summary statistics for contrast analysis'),
    error: z.string().optional().describe('Error message if analysis failed'),
  })
  .describe('Complete result of a contrast accessibility analysis');

export type ContrastWCAGLevel = z.infer<typeof ContrastWCAGLevelSchema>;
export type SuggestedFix = z.infer<typeof SuggestedFixSchema>;
export type ContrastData = z.infer<typeof ContrastDataSchema>;
export type ContrastIssue = z.infer<typeof ContrastIssueSchema>;
export type ContrastToolInput = z.infer<typeof ContrastToolInputSchema>;
export type ContrastAnalysisResult = z.infer<typeof ContrastAnalysisResultSchema>;
