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

async function main(): Promise<void> {
  logger.info('Starting AccesibilityHub Server', {
    version: APP_VERSION,
    tools: ['analyze-with-axe', 'analyze-with-pa11y', 'analyze-mixed', 'analyze-contrast']
  });

  registerTools();

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
