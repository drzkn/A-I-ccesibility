import { z } from 'zod';
import { WCAGLevelSchema } from '@/shared/types/accessibility.js';
import type { AnalysisResult } from '@/shared/types/accessibility.js';
import type { AdapterConfig } from '@/shared/adapters/base.js';

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

export const LighthouseToolInputSchema = z
  .object({
    url: z.string().url().describe('URL of the page to analyze (required, Lighthouse does not support raw HTML)'),
    options: z
      .object({
        wcagLevel: WCAGLevelSchema.default('AA').describe('WCAG conformance level to check'),
        browser: BrowserOptionsSchema.optional(),
      })
      .optional(),
  })
  .describe('Input for Lighthouse accessibility analysis');

export type LighthouseToolInput = z.infer<typeof LighthouseToolInputSchema>;

export interface LighthouseToolOutput {
  success: boolean;
  target: string;
  accessibilityScore: number;
  issueCount: number;
  issues: AnalysisResult['issues'];
  summary: AnalysisResult['summary'];
  metadata?: AnalysisResult['metadata'] | undefined;
  duration?: number | undefined;
  error?: string | undefined;
}

export interface LighthouseAuditMapping {
  auditId: string;
  wcagCriterion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  wcagPrinciple: 'perceivable' | 'operable' | 'understandable' | 'robust';
  title: string;
}

export interface LighthouseAdapterConfig extends AdapterConfig {
  headless?: boolean;
  browserArgs?: string[];
  ignoreHTTPSErrors?: boolean;
}

export interface LighthouseAuditDetail {
  items?: Array<{
    node?: {
      selector?: string;
      snippet?: string;
      path?: string;
      explanation?: string;
    };
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode?: string;
  details?: LighthouseAuditDetail;
}

export interface LighthouseCategory {
  score: number | null;
  auditRefs: Array<{ id: string; weight: number }>;
}

export interface LighthouseRunnerResult {
  lhr: {
    categories: {
      accessibility?: LighthouseCategory;
    };
    audits: Record<string, LighthouseAudit>;
    lighthouseVersion: string;
    userAgent?: string;
    finalDisplayedUrl?: string;
    fetchTime?: string;
  };
}
