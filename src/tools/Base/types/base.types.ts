import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ToolDefinition {
  name: string;
  description: string;
  register(server: McpServer): void;
}

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
  [key: string]: unknown;
}
