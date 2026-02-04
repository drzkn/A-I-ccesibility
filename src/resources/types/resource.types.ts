import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ResourceDefinition {
  name: string;
  register: (server: McpServer) => void;
}

export interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

export interface ResourceResult {
  contents: ResourceContent[];
}

export interface ResourceListItem {
  uri: string;
  name: string;
  title?: string;
  description?: string;
  mimeType?: string;
}
