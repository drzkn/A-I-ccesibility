import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LighthouseAdapter } from './adapters/index.js';
import { LighthouseToolInputSchema, type LighthouseToolInput } from './types/index.js';
import { buildAnalysisTarget, buildAnalysisOptions, formatOutput } from './utils/index.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from '../Base/index.js';
import { LighthouseToolMcpInputSchema } from './types/input.type.js';

let sharedAdapter: LighthouseAdapter | null = null;
let currentIgnoreHTTPS = false;

function getAdapter(ignoreHTTPSErrors = false): LighthouseAdapter {
  if (!sharedAdapter || currentIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedAdapter) {
      sharedAdapter.dispose().catch(() => {});
    }
    sharedAdapter = new LighthouseAdapter({
      headless: true,
      timeout: 60000,
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

const handleLighthouseAnalysis = withToolContext<LighthouseToolInput>(
  'analyze-with-lighthouse',
  async (input, context): Promise<ToolResponse> => {
    const ignoreHTTPSErrors = input.options?.browser?.ignoreHTTPSErrors ?? false;

    context.logger.debug('Building analysis configuration', {
      hasUrl: !!input.url,
      wcagLevel: input.options?.wcagLevel ?? 'AA',
      ignoreHTTPSErrors,
    });

    const adapter = getAdapter(ignoreHTTPSErrors);

    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      return createErrorResponse(
        new Error('Lighthouse adapter is not available. Browser may have failed to launch.')
      );
    }

    const target = buildAnalysisTarget(input);
    const options = buildAnalysisOptions(input);

    context.logger.info('Starting Lighthouse accessibility analysis', {
      target: target.value,
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

export const analyzeWithLighthouseTool: ToolDefinition = {
  name: 'analyze-with-lighthouse',
  description: `Analyze a web page for accessibility issues using Google Lighthouse.

Returns accessibility violations, score, and audit results based on WCAG guidelines.

IMPORTANT: Lighthouse requires a live URL - raw HTML content is not supported.

Input options
- url: URL of the page to analyze (required)
- options.wcagLevel: WCAG level to check (A, AA, or AAA). Default: AA
- options.browser.waitForSelector: CSS selector to wait for before analysis
- options.browser.viewport: Browser viewport dimensions
- options.browser.ignoreHTTPSErrors: Ignore SSL certificate errors (for local dev servers). Default: false
- options.browser.waitForTimeout: Time to wait in ms before analysis (max 60s)

Output
- accessibilityScore: Lighthouse accessibility score (0-100)
- issues: Array of accessibility issues found
- summary: Issue counts by severity and WCAG principle
- metadata: Tool version and browser info`,

  register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      LighthouseToolMcpInputSchema.shape,
      async (input): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const validator = LighthouseToolInputSchema.safeParse(input);

        if (!validator.success) {
          const errors = validator.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          const response = createErrorResponse(new Error(`Invalid input: ${errors}`));
          return { content: response.content };
        }

        const response = await handleLighthouseAnalysis(validator.data);
        return { content: response.content };
      }
    );
  },
};

export { disposeAdapter as disposeLighthouseAdapter };
