import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AxeAdapter } from './adapters/index.js';
import { AxeToolInputSchema, type AxeToolInput } from './types/index.js';
import { buildAnalysisTarget, buildAnalysisOptions, formatOutput } from './utils/index.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from '../Base/index.js';
import { AxeToolMcpInputSchema } from './types/input.type.js';

let sharedAdapter: AxeAdapter | null = null;
let currentIgnoreHTTPS = false;

function getAdapter(ignoreHTTPSErrors = false): AxeAdapter {
  if (!sharedAdapter || currentIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedAdapter) {
      sharedAdapter.dispose().catch(() => {});
    }
    sharedAdapter = new AxeAdapter({
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

const handleAxeAnalysis = withToolContext<AxeToolInput>(
  'analyze-with-axe',
  async (input, context): Promise<ToolResponse> => {
    const ignoreHTTPSErrors = input.options?.browser?.ignoreHTTPSErrors ?? false;

    context.logger.debug('Building analysis configuration', {
      hasUrl: !!input.url,
      hasHtml: !!input.html,
      wcagLevel: input.options?.wcagLevel ?? 'AA',
      ignoreHTTPSErrors,
    });

    const adapter = getAdapter(ignoreHTTPSErrors);

    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      return createErrorResponse(
        new Error('Axe adapter is not available. Browser may have failed to launch.')
      );
    }

    const target = buildAnalysisTarget(input);
    const options = buildAnalysisOptions(input);

    context.logger.info('Starting axe-core analysis', {
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

export const analyzeWithAxeTool: ToolDefinition = {
  name: 'analyze-with-axe',
  description: `Analyze a web page or HTML content for accessibility issues using axe-core.

Returns accessibility violations and incomplete checks based on WCAG guidelines.

Input options
- url: URL of the page to analyze
- html: Raw HTML content to analyze (alternative to url)
- options.wcagLevel: WCAG level to check (A, AA, or AAA). Default: AA
- options.rules: Specific axe rule IDs to run
- options.excludeRules: Axe rule IDs to exclude
- options.includeIncomplete: Include needs-review results. Default: false
- options.browser.waitForSelector: CSS selector to wait for before analysis
- options.browser.viewport: Browser viewport dimensions
- options.browser.ignoreHTTPSErrors: Ignore SSL certificate errors (for local dev servers). Default: false

Output
- issues: Array of accessibility issues found
- summary: Issue counts by severity and WCAG principle
- metadata: Tool version and browser info`,

  register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      AxeToolMcpInputSchema.shape,
      async (input): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const validator = AxeToolInputSchema.safeParse(input);

        if (!validator.success) {
          const errors = validator.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          const response = createErrorResponse(new Error(`Invalid input: ${errors}`));
          return { content: response.content };
        }

        const response = await handleAxeAnalysis(validator.data);
        return { content: response.content };
      }
    );
  },
};

export { disposeAdapter as disposeAxeAdapter };
