import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { logger, APP_VERSION } from "@/shared/utils/logger.js";
import {
  analyzeWithAxeTool,
  analyzeWithPa11yTool,
  analyzeMixedTool,
  analyzeContrastTool,
  disposeAxeAdapter,
  disposePa11yAdapter,
  disposeAnalyzeMixedAdapters,
  disposeContrastAdapter
} from "@/tools/index.js";
import {
  fullAccessibilityAuditPrompt,
  quickAccessibilityCheckPrompt,
  contrastCheckPrompt,
  preDeployCheckPrompt,
  quickWinsReportPrompt,
  explainWcagCriterionPrompt
} from "@/prompts/index.js";
import { registerWcagResources, registerContrastResources } from "@/resources/index.js";

const server = new McpServer({
  name: 'AccesibilityHub',
  version: APP_VERSION
});

function registerTools(): void {
  analyzeWithAxeTool.register(server);
  logger.info('Registered tool: analyze-with-axe');

  analyzeWithPa11yTool.register(server);
  logger.info('Registered tool: analyze-with-pa11y');

  analyzeMixedTool.register(server);
  logger.info('Registered tool: analyze-mixed');

  analyzeContrastTool.register(server);
  logger.info('Registered tool: analyze-contrast');
}

function registerPrompts(): void {
  const prompts = [
    fullAccessibilityAuditPrompt,
    quickAccessibilityCheckPrompt,
    contrastCheckPrompt,
    preDeployCheckPrompt,
    quickWinsReportPrompt,
    explainWcagCriterionPrompt
  ];

  for (const prompt of prompts) {
    prompt.register(server);
    logger.info(`Registered prompt: ${prompt.name}`);
  }
}

function registerResources(): void {
  registerWcagResources(server);
  logger.info('Registered WCAG resources');

  registerContrastResources(server);
  logger.info('Registered contrast resources');
}

async function main(): Promise<void> {
  logger.info('Starting AccesibilityHub Server', {
    version: APP_VERSION,
    tools: ['analyze-with-axe', 'analyze-with-pa11y', 'analyze-mixed', 'analyze-contrast'],
    prompts: [
      'full-accessibility-audit',
      'quick-accessibility-check',
      'contrast-check',
      'pre-deploy-check',
      'quick-wins-report',
      'explain-wcag-criterion'
    ],
    resources: [
      'wcag://criteria',
      'wcag://criteria/{id}',
      'wcag://criteria/level/{level}',
      'wcag://criteria/principle/{principle}',
      'contrast://thresholds/wcag21',
      'contrast://thresholds/apca',
      'contrast://algorithms'
    ]
  });

  registerTools();
  registerPrompts();
  registerResources();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('AccesibilityHub Server connected and ready');
}

async function shutdown(): Promise<void> {
  logger.info('Shutting down AccesibilityHub Server');

  await Promise.all([
    disposeAxeAdapter(),
    disposePa11yAdapter(),
    disposeAnalyzeMixedAdapters(),
    disposeContrastAdapter()
  ]);

  logger.info('All adapters disposed');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main().catch((error: unknown) => {
  logger.error('Failed to start MCP server', {
    error: error instanceof Error ? error : new Error(String(error))
  });
  process.exit(1);
});
