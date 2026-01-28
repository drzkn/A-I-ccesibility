import { z } from 'zod';
import { WCAGLevelSchema } from './accessibility.js';

const UrlSchema = z.string().url().describe('URL of the page to analyze');

const HtmlSchema = z.string().min(1).describe('Raw HTML content to analyze');

const FilePathSchema = z.string().min(1).describe('Path to the file to analyze');

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
    url: UrlSchema.optional(),
    html: HtmlSchema.optional(),
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

export const Pa11yToolInputSchema = z
  .object({
    url: UrlSchema.optional(),
    html: HtmlSchema.optional(),
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

export const ESLintA11yToolInputSchema = z
  .object({
    files: z.array(FilePathSchema).min(1).optional().describe('Array of file paths to lint'),
    directory: z.string().optional().describe('Directory path to lint recursively'),
    code: z.string().optional().describe('Inline Vue component code to lint'),
    options: z
      .object({
        rules: z
          .record(
            z.string(),
            z.union([z.enum(['off', 'warn', 'error']), z.number().int().min(0).max(2)])
          )
          .optional()
          .describe('Override specific rule configurations'),
        fix: z
          .literal(false)
          .default(false)
          .describe('Fix mode is disabled - MCP only reports issues'),
      })
      .optional(),
  })
  .refine(
    (data) => data.files !== undefined || data.directory !== undefined || data.code !== undefined,
    { message: 'Provide files, directory, or code to lint' }
  )
  .describe('Input for ESLint Vue.js accessibility linting');

export type ESLintA11yToolInput = z.infer<typeof ESLintA11yToolInputSchema>;

export const CombinedAnalysisInputSchema = z
  .object({
    url: UrlSchema.optional(),
    html: HtmlSchema.optional(),
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
