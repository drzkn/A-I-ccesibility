import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AxeAdapter } from '@/adapters/axe.js';
import { Pa11yAdapter } from '@/adapters/pa11y.js';
import { CombinedAnalysisInputSchema, type CombinedAnalysisInput } from '@/types/tool-inputs.js';
import type { AnalysisTarget, AnalysisOptions } from '@/types/analysis.js';
import type {
  AnalysisResult,
  AccessibilityIssue,
  CombinedAnalysisResult,
  ToolSource,
  Severity,
  WCAGPrinciple
} from '@/types/accessibility.js';
import {
  type ToolDefinition,
  type ToolResponse,
  createJsonResponse,
  createErrorResponse,
  withToolContext,
} from './base.js';

let sharedAxeAdapter: AxeAdapter | null = null;
let sharedPa11yAdapter: Pa11yAdapter | null = null;
let currentAxeIgnoreHTTPS = false;
let currentPa11yIgnoreHTTPS = false;

function getAxeAdapter(ignoreHTTPSErrors = false): AxeAdapter {
  if (!sharedAxeAdapter || currentAxeIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedAxeAdapter) {
      sharedAxeAdapter.dispose().catch(() => {});
    }
    sharedAxeAdapter = new AxeAdapter({ 
      headless: true, 
      timeout: 30000,
      ignoreHTTPSErrors 
    });
    currentAxeIgnoreHTTPS = ignoreHTTPSErrors;
  }
  return sharedAxeAdapter;
}

function getPa11yAdapter(ignoreHTTPSErrors = false): Pa11yAdapter {
  if (!sharedPa11yAdapter || currentPa11yIgnoreHTTPS !== ignoreHTTPSErrors) {
    if (sharedPa11yAdapter) {
      sharedPa11yAdapter.dispose().catch(() => {});
    }
    sharedPa11yAdapter = new Pa11yAdapter({ 
      timeout: 30000,
      chromeLaunchConfig: {
        ignoreHTTPSErrors
      }
    });
    currentPa11yIgnoreHTTPS = ignoreHTTPSErrors;
  }
  return sharedPa11yAdapter;
}

async function disposeAdapters(): Promise<void> {
  await Promise.all([
    sharedAxeAdapter?.dispose(),
    sharedPa11yAdapter?.dispose()
  ]);
  sharedAxeAdapter = null;
  sharedPa11yAdapter = null;
}

function buildAnalysisTarget(input: CombinedAnalysisInput): AnalysisTarget {
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

function buildAnalysisOptions(input: CombinedAnalysisInput): AnalysisOptions {
  return {
    wcagLevel: input.options?.wcagLevel ?? 'AA',
    includeWarnings: true,
  };
}

function generateIssueFingerprint(issue: AccessibilityIssue): string {
  const parts = [
    issue.ruleId,
    issue.wcag?.criterion ?? 'no-wcag',
    issue.location.selector ?? issue.location.file ?? 'no-location',
    issue.message.substring(0, 50)
  ];
  return parts.join('|');
}

function deduplicateIssues(issues: AccessibilityIssue[]): AccessibilityIssue[] {
  const seen = new Map<string, AccessibilityIssue>();

  for (const issue of issues) {
    const fingerprint = generateIssueFingerprint(issue);

    if (!seen.has(fingerprint)) {
      seen.set(fingerprint, issue);
    } else {
      const existing = seen.get(fingerprint)!;

      if (issue.severity === 'critical' && existing.severity !== 'critical') {
        seen.set(fingerprint, issue);
      } else if (issue.confidence && existing.confidence && issue.confidence > existing.confidence) {
        seen.set(fingerprint, issue);
      }
    }
  }

  return Array.from(seen.values());
}

function groupByWCAG(issues: AccessibilityIssue[]): Record<string, AccessibilityIssue[]> {
  const grouped: Record<string, AccessibilityIssue[]> = {};

  for (const issue of issues) {
    const key = issue.wcag?.criterion ?? 'unknown';
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key]!.push(issue);
  }

  return grouped;
}

function buildCombinedSummary(
  issues: AccessibilityIssue[],
  _toolsUsed: ToolSource[]
): CombinedAnalysisResult['summary'] {
  const bySeverity: Record<Severity, number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };

  const byPrinciple: Record<WCAGPrinciple, number> = {
    perceivable: 0,
    operable: 0,
    understandable: 0,
    robust: 0
  };

  const byTool: Record<ToolSource, number> = {
    'axe-core': 0,
    'pa11y': 0,
  };

  const byRule: Record<string, number> = {};

  for (const issue of issues) {
    bySeverity[issue.severity]++;

    if (issue.wcag?.principle) {
      byPrinciple[issue.wcag.principle]++;
    }

    byTool[issue.tool]++;
    byRule[issue.ruleId] = (byRule[issue.ruleId] ?? 0) + 1;
  }

  return {
    total: issues.length,
    bySeverity,
    byPrinciple,
    byTool,
    byRule
  };
}

interface CombinedToolOutput {
  success: boolean;
  target: string;
  toolsUsed: ToolSource[];
  issueCount: number;
  deduplicatedCount: number;
  issues: AccessibilityIssue[];
  issuesByWCAG: Record<string, AccessibilityIssue[]>;
  summary: CombinedAnalysisResult['summary'];
  individualResults: AnalysisResult[];
  duration?: number | undefined;
  error?: string | undefined;
}

function formatOutput(
  result: CombinedAnalysisResult,
  deduplicatedCount: number,
  issuesByWCAG: Record<string, AccessibilityIssue[]>
): CombinedToolOutput {
  return {
    success: result.success,
    target: result.target,
    toolsUsed: result.toolsUsed,
    issueCount: result.issues.length,
    deduplicatedCount,
    issues: result.issues,
    issuesByWCAG,
    summary: result.summary,
    individualResults: result.individualResults ?? [],
    duration: result.duration,
    error: result.error
  };
}

const handleCombinedAnalysis = withToolContext<CombinedAnalysisInput>(
  'analyze-all',
  async (input, context): Promise<ToolResponse> => {
    const startTime = Date.now();
    const toolsToRun = input.tools ?? ['axe-core', 'pa11y'];
    const shouldDeduplicate = input.options?.deduplicateResults ?? true;
    const ignoreHTTPSErrors = input.options?.browser?.ignoreHTTPSErrors ?? false;

    context.logger.info('Starting combined web analysis', {
      tools: toolsToRun,
      deduplicate: shouldDeduplicate,
      hasUrl: !!input.url,
      hasHtml: !!input.html,
      ignoreHTTPSErrors
    });

    const target = buildAnalysisTarget(input);
    const options = buildAnalysisOptions(input);

    const results: AnalysisResult[] = [];
    const errors: string[] = [];

    const analysisPromises: Promise<void>[] = [];

    if (toolsToRun.includes('axe-core')) {
      analysisPromises.push(
        (async () => {
          try {
            const adapter = getAxeAdapter(ignoreHTTPSErrors);
            const result = await adapter.analyze(target, options);
            results.push(result);
            context.logger.debug('Axe analysis completed', { issueCount: result.issues.length });
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Axe: ${msg}`);
            context.logger.error('Axe analysis failed', {
              error: error instanceof Error ? error : new Error(String(error))
            });
          }
        })()
      );
    }

    if (toolsToRun.includes('pa11y')) {
      analysisPromises.push(
        (async () => {
          try {
            const adapter = getPa11yAdapter(ignoreHTTPSErrors);
            const result = await adapter.analyze(target, options);
            results.push(result);
            context.logger.debug('Pa11y analysis completed', { issueCount: result.issues.length });
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Pa11y: ${msg}`);
            context.logger.error('Pa11y analysis failed', {
              error: error instanceof Error ? error : new Error(String(error))
            });
          }
        })()
      );
    }

    await Promise.all(analysisPromises);

    const allIssues = results.flatMap(r => r.issues);
    const originalCount = allIssues.length;

    const finalIssues = shouldDeduplicate
      ? deduplicateIssues(allIssues)
      : allIssues;

    const issuesByWCAG = groupByWCAG(finalIssues);
    const duration = Date.now() - startTime;

    context.logger.info('Combined analysis completed', {
      totalIssues: originalCount,
      deduplicatedIssues: finalIssues.length,
      toolsRun: results.length,
      errors: errors.length,
      durationMs: duration
    });

    const combinedResult: CombinedAnalysisResult = {
      success: errors.length === 0,
      timestamp: new Date().toISOString(),
      duration,
      target: target.value,
      toolsUsed: results.map(r => r.tool),
      issues: finalIssues,
      summary: buildCombinedSummary(finalIssues, toolsToRun),
      individualResults: results,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };

    const output = formatOutput(combinedResult, originalCount, issuesByWCAG);
    return createJsonResponse(output, !combinedResult.success);
  }
);

const CombinedToolMcpInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
  tools: z
    .array(z.enum(['axe-core', 'pa11y']))
    .min(1)
    .default(['axe-core', 'pa11y'])
    .describe('Tools to run for web analysis'),
  options: z
    .object({
      wcagLevel: z
        .enum(['A', 'AA', 'AAA'])
        .default('AA')
        .describe('WCAG conformance level'),
      deduplicateResults: z
        .boolean()
        .default(true)
        .describe('Merge similar issues from different tools'),
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

export const analyzeAllTool: ToolDefinition = {
  name: 'analyze-all',
  description: `Run multiple accessibility analysis tools in parallel and combine results.

Executes axe-core and Pa11y for web analysis (URL/HTML). Use analyze-with-eslint separately for Vue source code analysis.

Input options:
- url: URL of the page to analyze (required for web analysis)
- html: Raw HTML content (alternative to url for web analysis)
- tools: Array of tools to run ['axe-core', 'pa11y']. Default: ['axe-core', 'pa11y']
- options.wcagLevel: WCAG level (A, AA, AAA). Default: AA
- options.deduplicateResults: Merge similar issues from different tools. Default: true
- options.browser.waitForSelector: CSS selector to wait for
- options.browser.viewport: Browser viewport dimensions
- options.browser.ignoreHTTPSErrors: Ignore SSL certificate errors (for local dev servers). Default: false

Output:
- issues: Combined and deduplicated accessibility issues
- issuesByWCAG: Issues grouped by WCAG criterion
- summary: Aggregated counts by severity, principle, and tool
- individualResults: Full results from each tool
- deduplicatedCount: Number of duplicate issues removed

Note: For Vue source code analysis, use analyze-with-eslint separately.`,

  register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      CombinedToolMcpInputSchema.shape,
      async (input): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
        const parseResult = CombinedAnalysisInputSchema.safeParse(input);

        if (!parseResult.success) {
          const errors = parseResult.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          const response = createErrorResponse(new Error(`Invalid input: ${errors}`));
          return { content: response.content };
        }

        const response = await handleCombinedAnalysis(parseResult.data);
        return { content: response.content };
      }
    );
  },
};

export { disposeAdapters as disposeAnalyzeAllAdapters };
