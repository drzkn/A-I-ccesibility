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

  it('should generate prompt combining all three tools with report sections and Lighthouse score', async () => {
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
    expect(text).toContain('analyze-with-lighthouse');
    expect(text).toContain('axe-core');
    expect(text).toContain('pa11y');
    expect(text).toContain('axe-core, Pa11y, and Lighthouse');
    expect(text).toContain('Lighthouse Accessibility Score');
    expect(text).toContain('Poor < 50');
    expect(text).toContain('Needs Improvement 50-89');
    expect(text).toContain('Good 90-100');
    expect(text).toContain('Perceivable');
    expect(text).toContain('Operable');
    expect(text).toContain('Understandable');
    expect(text).toContain('Robust');
    expect(text).toContain('Executive Summary');
    expect(text).toContain('Remediation');
    expect(text).toContain('Impact on Lighthouse score');
    expect(text).toContain('Score Improvement Projection');
  });

  it('should pass wcagLevel to both analyze-mixed and analyze-with-lighthouse', async () => {
    const resultA = await promptHandler({ url: 'https://example.com', wcagLevel: 'A' });
    const resultAAA = await promptHandler({ url: 'https://example.com', wcagLevel: 'AAA' });

    expect(resultA.messages[0]?.content.text).toContain('"A"');
    expect(resultAAA.messages[0]?.content.text).toContain('AAA');

    const textAAA = resultAAA.messages[0]?.content.text;
    const lighthouseSection = textAAA.substring(textAAA.indexOf('analyze-with-lighthouse'));
    expect(lighthouseSection).toContain('wcagLevel: "AAA"');
  });
});
