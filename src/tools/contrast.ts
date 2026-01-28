import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ContrastAdapter } from '@/adapters/contrast.js';
import {
  ContrastToolInputSchema,
  type ContrastToolInput,
  type ContrastAnalysisResult,
} from '@/types/contrast.js';
import type { AnalysisTarget } from '@/types/analysis.js';
import type { ContrastAdapterOptions } from '@/adapters/contrast.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from './base.js';

let sharedAdapter: ContrastAdapter | null = null;
let currentIgnoreHTTPS = false;

function getAdapter(ignoreHTTPSErrors = false): ContrastAdapter {
  if (!sharedAdapter || currentIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedAdapter) {
      sharedAdapter.dispose().catch(() => {});
    }
    sharedAdapter = new ContrastAdapter({
      headless: true,
      timeout: 30000,
      ignoreHTTPSErrors,
    });
    currentIgnoreHTTPS = ignoreHTTPSErrors;
  }
  return sharedAdapter;
}

async function disposeAdapter(): Promise<void> {
  if (sharedAdapter) {
    await sharedAdapter.dispose();
    sharedAdapter = null;
  }
}

process.on('SIGINT', () => {
  disposeAdapter().finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  disposeAdapter().finally(() => process.exit(0));
});

function buildAnalysisTarget(input: ContrastToolInput): AnalysisTarget {
  if (input.url) {
    return {
      type: 'url',
      value: input.url,
      options: {
        waitForSelector: input.options?.browser?.waitForSelector,
        timeout: input.options?.browser?.waitForTimeout,
        viewport: input.options?.browser?.viewport,
        ignoreHTTPSErrors: input.options?.browser?.ignoreHTTPSErrors,
      },
    };
  }

  return {
    type: 'html',
    value: input.html!,
    options: {
      waitForSelector: input.options?.browser?.waitForSelector,
      timeout: input.options?.browser?.waitForTimeout,
      viewport: input.options?.browser?.viewport,
      ignoreHTTPSErrors: input.options?.browser?.ignoreHTTPSErrors,
    },
  };
}

function buildAnalysisOptions(input: ContrastToolInput): ContrastAdapterOptions {
  return {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    suggestFixes: input.options?.suggestFixes ?? true,
    includePassingElements: input.options?.includePassingElements ?? false,
    selector: input.options?.selector,
  };
}

interface ContrastToolOutput {
  success: boolean;
  target: string;
  wcagLevel: string;
  issueCount: number;
  issues: ContrastAnalysisResult['issues'];
  summary: ContrastAnalysisResult['summary'];
  duration?: number | undefined;
  error?: string | undefined;
}

function formatOutput(result: ContrastAnalysisResult): ContrastToolOutput {
  return {
    success: result.success,
    target: result.target,
    wcagLevel: result.wcagLevel,
    issueCount: result.issues.length,
    issues: result.issues,
    summary: result.summary,
    duration: result.duration,
    error: result.error,
  };
}

const handleContrastAnalysis = withToolContext<ContrastToolInput>(
  'analyze-contrast',
  async (input, context): Promise<ToolResponse> => {
    const ignoreHTTPSErrors = input.options?.browser?.ignoreHTTPSErrors ?? false;

    context.logger.debug('Building analysis configuration', {
      hasUrl: !!input.url,
      hasHtml: !!input.html,
      wcagLevel: input.options?.wcagLevel ?? 'AA',
      suggestFixes: input.options?.suggestFixes ?? true,
      ignoreHTTPSErrors,
    });

    const adapter = getAdapter(ignoreHTTPSErrors);

    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      return createErrorResponse(
        new Error('Contrast adapter is not available. Browser may have failed to launch.')
      );
    }

    const target = buildAnalysisTarget(input);
    const options = buildAnalysisOptions(input);

    context.logger.info('Starting contrast analysis', {
      targetType: target.type,
      target: target.type === 'url' ? target.value : '[html content]',
      wcagLevel: options.wcagLevel,
    });

    const result = await adapter.analyze(target, options);

    if (!result.success) {
      context.logger.warn('Analysis completed with errors', {
        error: result.error,
      });
    }

    const output = formatOutput(result);
    return createJsonResponse(output, !result.success);
  }
);

const ContrastToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  options: z
    .object({
      wcagLevel: z
        .enum(['AA', 'AAA'])
        .default('AA')
        .describe('WCAG conformance level: AA (4.5:1 normal, 3:1 large) or AAA (7:1 normal, 4.5:1 large)'),
      suggestFixes: z
        .boolean()
        .default(true)
        .describe('Suggest color corrections for failing elements'),
      includePassingElements: z
        .boolean()
        .default(false)
        .describe('Include elements that pass contrast requirements in results'),
      selector: z
        .string()
        .optional()
        .describe('CSS selector to scope analysis to specific element'),
      browser: z
        .object({
          waitForSelector: z.string().optional().describe('CSS selector to wait for'),
          waitForTimeout: z.number().int().positive().max(60000).optional(),
          viewport: z
            .object({
              width: z.number().int().positive().default(1280),
              height: z.number().int().positive().default(720),
            })
            .optional(),
          ignoreHTTPSErrors: z
            .boolean()
            .default(false)
            .describe('Ignore HTTPS certificate errors (for local dev servers with self-signed certs)'),
        })
        .optional(),
    })
    .optional(),
});

export const analyzeContrastTool: ToolDefinition = {
  name: 'analyze-contrast',
  description: `Analyze a web page or HTML content for color contrast accessibility issues.

Calculates contrast ratios between text and background colors, validates against WCAG 2.1 requirements, and suggests color corrections for failing elements.

Input options
- url: URL of the page to analyze
- html: Raw HTML content to analyze (alternative to url)
- options.wcagLevel: WCAG level to check (AA or AAA). Default: AA
  - AA: 4.5:1 for normal text, 3:1 for large text
  - AAA: 7:1 for normal text, 4.5:1 for large text
- options.suggestFixes: Generate color correction suggestions. Default: true
- options.includePassingElements: Include passing elements in results. Default: false
- options.selector: CSS selector to scope analysis
- options.browser.waitForSelector: CSS selector to wait for before analysis
- options.browser.viewport: Browser viewport dimensions
- options.browser.ignoreHTTPSErrors: Ignore SSL certificate errors. Default: false

Output
- issues: Array of contrast issues with detailed data
  - contrastData: foreground/background colors, current/required ratios, suggested fixes
- summary: Statistics by text size (normal/large) and pass/fail counts
- wcagLevel: The WCAG level used for analysis

WCAG Criteria
- 1.4.3 Contrast (Minimum) - Level AA
- 1.4.6 Contrast (Enhanced) - Level AAA`,

  register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      ContrastToolMcpInputSchema.shape,
      async (input): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const parseResult = ContrastToolInputSchema.safeParse(input);

        if (!parseResult.success) {
          const errors = parseResult.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          const response = createErrorResponse(new Error(`Invalid input: ${errors}`));
          return { content: response.content };
        }

        const response = await handleContrastAnalysis(parseResult.data);
        return { content: response.content };
      }
    );
  },
};

export { disposeAdapter as disposeContrastAdapter };
