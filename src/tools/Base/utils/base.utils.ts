import { createToolLogger, generateRequestId } from '@/shared/utils/logger.js';
import type { ToolResponse } from '../types/index.js';

export function createTextResponse(text: string, isError = false): ToolResponse {
  return {
    content: [{ type: 'text', text }],
    isError,
  };
}

export function createJsonResponse<T>(data: T, isError = false): ToolResponse {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    isError,
  };
}

export function createErrorResponse(error: unknown): ToolResponse {
  const message = error instanceof Error ? error.message : String(error);
  return createTextResponse(`Error: ${message}`, true);
}

export interface ToolExecutionContext {
  requestId: string;
  logger: ReturnType<typeof createToolLogger>;
}

export type ToolHandler<TInput> = (
  input: TInput,
  context: ToolExecutionContext
) => Promise<ToolResponse>;

export function withToolContext<TInput>(
  toolName: string,
  handler: ToolHandler<TInput>
): (input: TInput) => Promise<ToolResponse> {
  const toolLogger = createToolLogger(toolName);

  return async (input: TInput): Promise<ToolResponse> => {
    const requestId = generateRequestId();

    toolLogger.info('Tool execution started', { requestId });
    const startTime = Date.now();

    try {
      const result = await handler(input, {
        requestId,
        logger: toolLogger,
      });

      const duration = Date.now() - startTime;
      toolLogger.info('Tool execution completed', {
        requestId,
        durationMs: duration,
        isError: result.isError ?? false,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      toolLogger.error('Tool execution failed', {
        requestId,
        durationMs: duration,
        error: error instanceof Error ? error : new Error(String(error)),
      });

      return createErrorResponse(error);
    }
  };
}
