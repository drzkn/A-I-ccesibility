import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface MockResourceRegistration {
  name: string;
  uri: string;
  metadata: {
    description?: string;
    mimeType?: string;
  };
  handler: () => Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }>;
}

export interface MockResourceTemplateRegistration {
  name: string;
  template: ResourceTemplate;
  metadata: {
    description?: string;
    mimeType?: string;
  };
  handler: (
    uri: URL,
    variables: Record<string, string>
  ) => Promise<{
    contents: Array<{ uri: string; mimeType: string; text: string }>;
  }>;
}

type StaticHandler = MockResourceRegistration['handler'];
type TemplateHandler = MockResourceTemplateRegistration['handler'];

export interface MockResourceServer {
  registeredResources: Map<string, MockResourceRegistration>;
  registeredResourceTemplates: Map<string, MockResourceTemplateRegistration>;
  registerResource: {
    (
      name: string,
      uri: string,
      metadata: MockResourceRegistration['metadata'],
      handler: StaticHandler
    ): void;
    (
      name: string,
      template: ResourceTemplate,
      metadata: MockResourceTemplateRegistration['metadata'],
      handler: TemplateHandler
    ): void;
  };
}

export function createMockResourceServer(): MockResourceServer {
  const registeredResources = new Map<string, MockResourceRegistration>();
  const registeredResourceTemplates = new Map<string, MockResourceTemplateRegistration>();

  function registerResource(
    name: string,
    uriOrTemplate: string | ResourceTemplate,
    metadata: MockResourceRegistration['metadata'],
    handler: StaticHandler | TemplateHandler
  ): void {
    if (typeof uriOrTemplate === 'string') {
      registeredResources.set(name, {
        name,
        uri: uriOrTemplate,
        metadata,
        handler: handler as StaticHandler
      });
    } else {
      registeredResourceTemplates.set(name, {
        name,
        template: uriOrTemplate,
        metadata,
        handler: handler as TemplateHandler
      });
    }
  }

  return {
    registeredResources,
    registeredResourceTemplates,
    registerResource,
  };
}

export function getResourceHandler(
  server: MockResourceServer,
  resourceName: string
): MockResourceRegistration['handler'] {
  const registration = server.registeredResources.get(resourceName);
  if (!registration) {
    throw new Error(`Resource "${resourceName}" not registered`);
  }
  return registration.handler;
}

export function getResourceTemplateHandler(
  server: MockResourceServer,
  templateName: string
): MockResourceTemplateRegistration['handler'] {
  const registration = server.registeredResourceTemplates.get(templateName);
  if (!registration) {
    throw new Error(`Resource template "${templateName}" not registered`);
  }
  return registration.handler;
}
