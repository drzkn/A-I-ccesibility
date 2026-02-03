import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

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

export const ViewportSchema = z
  .object({
    width: z.number().int().positive().default(1280).describe('Viewport width in pixels'),
    height: z.number().int().positive().default(720).describe('Viewport height in pixels'),
  })
  .describe('Browser viewport dimensions');

export const BrowserOptionsSchema = z
  .object({
    waitForSelector: z.string().optional().describe('CSS selector to wait for before analysis'),
    waitForTimeout: z
      .number()
      .int()
      .positive()
      .max(60000)
      .optional()
      .describe('Time to wait in ms before analysis (max 60s)'),
    viewport: ViewportSchema.optional(),
    ignoreHTTPSErrors: z
      .boolean()
      .default(false)
      .describe('Ignore HTTPS certificate errors (useful for local dev servers with self-signed certs)'),
  })
  .describe('Browser behavior options');

export const BaseToolInputSchema = z.object({
  url: z.string().url().optional().describe('URL of the page to analyze'),
  html: z.string().min(1).optional().describe('Raw HTML content to analyze'),
});

export type Viewport = z.infer<typeof ViewportSchema>;
export type BrowserOptions = z.infer<typeof BrowserOptionsSchema>;
export type BaseToolInput = z.infer<typeof BaseToolInputSchema>;
