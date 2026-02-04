import { describe, it, expect, beforeAll } from 'vitest';
import { fullAccessibilityAuditPrompt } from '../../../src/prompts/audit/full-accessibility-audit.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('full-accessibility-audit Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    fullAccessibilityAuditPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'full-accessibility-audit');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(fullAccessibilityAuditPrompt.name).toBe('full-accessibility-audit');
    expect(fullAccessibilityAuditPrompt.title).toBe('Full Accessibility Audit');
    expect(fullAccessibilityAuditPrompt.description).toBeDefined();
    expect(typeof fullAccessibilityAuditPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('full-accessibility-audit');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Full Accessibility Audit');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
    expect(prompt?.argsSchema).toHaveProperty('wcagLevel');
  });

  it('should generate prompt with default wcagLevel AA and required instructions', async () => {
    const testUrl = 'https://test-site.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain(testUrl);
    expect(text).toContain('AA');
    expect(text).toContain('analyze-mixed');
    expect(text).toContain('axe-core');
    expect(text).toContain('pa11y');
    expect(text).toContain('Perceivable');
    expect(text).toContain('Operable');
    expect(text).toContain('Understandable');
    expect(text).toContain('Robust');
    expect(text).toContain('Remediation');
  });

  it('should respect provided wcagLevel parameter', async () => {
    const resultA = await promptHandler({ url: 'https://example.com', wcagLevel: 'A' });
    const resultAAA = await promptHandler({ url: 'https://example.com', wcagLevel: 'AAA' });

    expect(resultA.messages[0]?.content.text).toContain('"A"');
    expect(resultAAA.messages[0]?.content.text).toContain('AAA');
  });
});
