import { describe, it, expect, beforeAll } from 'vitest';
import { preDeployCheckPrompt } from '../../../src/prompts/workflows/pre-deploy-check.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('pre-deploy-check Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    preDeployCheckPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'pre-deploy-check');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(preDeployCheckPrompt.name).toBe('pre-deploy-check');
    expect(preDeployCheckPrompt.title).toBe('Pre-Deploy Accessibility Check');
    expect(preDeployCheckPrompt.description).toBeDefined();
    expect(typeof preDeployCheckPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('pre-deploy-check');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Pre-Deploy Accessibility Check');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
  });

  it('should generate deployment gate check prompt with GO/NO-GO decision format', async () => {
    const testUrl = 'https://staging.example.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain(testUrl);
    expect(text).toContain('analyze-mixed');
    expect(text).toContain('wcagLevel: "AA"');
    expect(text).toContain('deployment gate check');
    expect(text).toContain('GO');
    expect(text).toContain('NO-GO');
    expect(text).toContain('GO WITH CAUTION');
    expect(text).toContain('Blocking Issues');
    expect(text).toContain('Non-Blocking Issues');
    expect(text).toContain('Compliance Summary');
    expect(text).toContain('WCAG 2.1 Level AA');
    expect(text).toContain('Recommended Actions');
    expect(text).toContain('If NO-GO');
    expect(text).toContain('If GO');
  });
});
