import type { GetPromptResult } from '@modelcontextprotocol/sdk/types.js';

export interface MockPromptRegistration {
  name: string;
  title: string;
  description: string;
  argsSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<GetPromptResult>;
}

export interface MockPromptServer {
  registeredPrompts: Map<string, MockPromptRegistration>;
  registerPrompt: (
    name: string,
    options: {
      title: string;
      description: string;
      argsSchema: Record<string, unknown>;
    },
    handler: (args: Record<string, unknown>) => Promise<GetPromptResult>
  ) => void;
}

export function createMockPromptServer(): MockPromptServer {
  const registeredPrompts = new Map<string, MockPromptRegistration>();

  return {
    registeredPrompts,
    registerPrompt(name, options, handler) {
      registeredPrompts.set(name, {
        name,
        title: options.title,
        description: options.description,
        argsSchema: options.argsSchema,
        handler,
      });
    },
  };
}

export function getPromptHandler(
  server: MockPromptServer,
  promptName: string
): MockPromptRegistration['handler'] {
  const registration = server.registeredPrompts.get(promptName);
  if (!registration) {
    throw new Error(`Prompt "${promptName}" not registered`);
  }
  return registration.handler;
}
