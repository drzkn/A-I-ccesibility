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
}

export function createTextResponse(text: string, isError = false): ToolResponse {
  return {
    content: [{ type: 'text', text }],
    isError
  };
}

export function createJsonResponse<T>(data: T, isError = false): ToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    isError
  };
}

export function createErrorResponse(error: unknown): ToolResponse {
  const message = error instanceof Error ? error.message : String(error);
  return createTextResponse(`Error: ${message}`, true);
}
