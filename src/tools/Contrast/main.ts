import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ContrastAdapter } from './adapters/index.js';
import { ContrastToolInputSchema, type ContrastToolInput } from './types/index.js';
import { buildAnalysisTarget, buildAnalysisOptions, formatOutput } from './utils/index.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from '../Base/index.js';
import { ContrastToolMcpInputSchema } from './types/input.type.js';

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

export const analyzeContrastTool: ToolDefinition = {
  name: 'analyze-contrast',
  description: `Analyze a web page or HTML content for color contrast accessibility issues.

Calculates contrast ratios between text and background colors, validates against WCAG 2.1 requirements, and suggests color corrections for failing elements.

Input options
- url: URL of the page to analyze
- html: Raw HTML content to analyze (alternative to url)
- options.contrastAlgorithm: Algorithm for contrast calculation. Default: WCAG21
  - WCAG21: Standard WCAG 2.1 contrast ratio (luminance-based)
  - APCA: Accessible Perceptual Contrast Algorithm (WCAG 3.0 draft, experimental)
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
- contrastAlgorithm: The algorithm used for contrast calculation (WCAG21 or APCA)

WCAG Criteria
- 1.4.3 Contrast (Minimum) - Level AA
- 1.4.6 Contrast (Enhanced) - Level AAA

APCA Thresholds (when using APCA algorithm)
- Body text: Lc 75 minimum
- Large text: Lc 60 minimum
- Non-text elements: Lc 45 minimum
Note: APCA is part of the WCAG 3.0 draft and may change in future versions.`,

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
