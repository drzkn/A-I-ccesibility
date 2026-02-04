import { describe, it, expect, beforeAll } from 'vitest';
import { quickAccessibilityCheckPrompt } from '../../../src/prompts/audit/quick-accessibility-check.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('quick-accessibility-check Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    quickAccessibilityCheckPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'quick-accessibility-check');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(quickAccessibilityCheckPrompt.name).toBe('quick-accessibility-check');
    expect(quickAccessibilityCheckPrompt.title).toBe('Quick Accessibility Check');
    expect(quickAccessibilityCheckPrompt.description).toBeDefined();
    expect(typeof quickAccessibilityCheckPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('quick-accessibility-check');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Quick Accessibility Check');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
  });

  it('should generate prompt with tool instructions and output format', async () => {
    const testUrl = 'https://test-site.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain(testUrl);
    expect(text).toContain('axe-core');
    expect(text).toContain('critical');
    expect(text).toContain('serious');
    expect(text).toContain('moderate');
    expect(text).toContain('minor');
    expect(text).toContain('Quick fix');
    expect(text).toContain('Next Steps');
  });
});
