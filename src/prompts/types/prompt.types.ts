import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

export interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  register(server: McpServer): void;
}

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

export type PromptResult = GetPromptResult;
