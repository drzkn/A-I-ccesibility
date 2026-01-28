import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Pa11yAdapter } from '@/adapters/pa11y.js';
import { Pa11yToolInputSchema, type Pa11yToolInput } from '@/types/tool-inputs.js';
import type { AnalysisTarget, AnalysisOptions } from '@/types/analysis.js';
import type { AnalysisResult } from '@/types/accessibility.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from './base.js';

let sharedAdapter: Pa11yAdapter | null = null;
let currentIgnoreHTTPS = false;

function getAdapter(ignoreHTTPSErrors = false): Pa11yAdapter {
  if (!sharedAdapter || currentIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedAdapter) {
      sharedAdapter.dispose().catch(() => {});
    }
    sharedAdapter = new Pa11yAdapter({
      timeout: 30000,
      chromeLaunchConfig: {
        ignoreHTTPSErrors,
      },
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

function buildAnalysisTarget(input: Pa11yToolInput): AnalysisTarget {
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

function buildAnalysisOptions(input: Pa11yToolInput): AnalysisOptions {
  const standardMap: Record<string, 'A' | 'AA' | 'AAA'> = {
    'WCAG2A': 'A',
    'WCAG2AA': 'AA',
    'WCAG2AAA': 'AAA',
    'WCAG21A': 'A',
    'WCAG21AA': 'AA',
    'WCAG21AAA': 'AAA'
  };

  const wcagLevel = input.options?.standard
    ? standardMap[input.options.standard] ?? 'AA'
    : 'AA';

  return {
    wcagLevel,
    includeWarnings: input.options?.includeWarnings ?? true,
  };
}

interface Pa11yToolOutput {
  success: boolean;
  target: string;
  issueCount: number;
  issues: AnalysisResult['issues'];
  summary: AnalysisResult['summary'];
  metadata?: AnalysisResult['metadata'] | undefined;
  duration?: number | undefined;
  error?: string | undefined;
}

function formatOutput(result: AnalysisResult): Pa11yToolOutput {
  return {
    success: result.success,
    target: result.target,
    issueCount: result.issues.length,
    issues: result.issues,
    summary: result.summary,
    metadata: result.metadata,
    duration: result.duration,
    error: result.error,
  };
}

const handlePa11yAnalysis = withToolContext<Pa11yToolInput>(
  'analyze-with-pa11y',
  async (input, context): Promise<ToolResponse> => {
    const ignoreHTTPSErrors = input.options?.browser?.ignoreHTTPSErrors ?? false;
    
    context.logger.debug('Building analysis configuration', {
      hasUrl: !!input.url,
      hasHtml: !!input.html,
      standard: input.options?.standard ?? 'WCAG21AA',
      ignoreHTTPSErrors,
    });

    const adapter = getAdapter(ignoreHTTPSErrors);

    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      return createErrorResponse(
        new Error('Pa11y adapter is not available. Browser may have failed to launch.')
      );
    }

    const target = buildAnalysisTarget(input);
    const options = buildAnalysisOptions(input);

    context.logger.info('Starting Pa11y analysis', {
      targetType: target.type,
      target: target.type === 'url' ? target.value : '[html content]',
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

const Pa11yToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  options: z
    .object({
      standard: z
        .enum(['WCAG2A', 'WCAG2AA', 'WCAG2AAA', 'WCAG21A', 'WCAG21AA', 'WCAG21AAA'])
        .default('WCAG21AA')
        .describe('Accessibility standard to test against'),
      includeWarnings: z
        .boolean()
        .default(true)
        .describe('Include warnings in results'),
      includeNotices: z
        .boolean()
        .default(false)
        .describe('Include notices in results'),
      rootElement: z.string().optional().describe('CSS selector for root element to test'),
      hideElements: z.string().optional().describe('CSS selector for elements to hide'),
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

export const analyzeWithPa11yTool: ToolDefinition = {
  name: 'analyze-with-pa11y',
  description: `Analyze a web page or HTML content for accessibility issues using Pa11y.

Returns accessibility violations based on WCAG guidelines.

Input options
- url: URL of the page to analyze
- html: Raw HTML content to analyze (alternative to url)
- options.standard: WCAG standard to test against (WCAG2A, WCAG2AA, WCAG2AAA, WCAG21A, WCAG21AA, WCAG21AAA). Default: WCAG21AA
- options.includeWarnings: Include warnings in results. Default: true
- options.includeNotices: Include notices in results. Default: false
- options.rootElement: CSS selector for root element to test
- options.hideElements: CSS selector for elements to hide from testing
- options.browser.waitForSelector: CSS selector to wait for before analysis
- options.browser.viewport: Browser viewport dimensions
- options.browser.ignoreHTTPSErrors: Ignore SSL certificate errors (for local dev servers). Default: false

Output:
- issues: Array of accessibility issues found
- summary: Issue counts by severity and WCAG principle
- metadata: Tool version and page info`,

  register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      Pa11yToolMcpInputSchema.shape,
      async (input): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const parseResult = Pa11yToolInputSchema.safeParse(input);

        if (!parseResult.success) {
          const errors = parseResult.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          const response = createErrorResponse(new Error(`Invalid input: ${errors}`));
          return { content: response.content };
        }

        const response = await handlePa11yAnalysis(parseResult.data);
        return { content: response.content };
      }
    );
  },
};

export { disposeAdapter as disposePa11yAdapter };
