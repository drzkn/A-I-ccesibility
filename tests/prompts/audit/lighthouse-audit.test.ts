import { describe, it, expect, beforeAll } from 'vitest';
import { lighthouseAuditPrompt } from '../../../src/prompts/audit/lighthouse-audit.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('lighthouse-audit Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    lighthouseAuditPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'lighthouse-audit');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(lighthouseAuditPrompt.name).toBe('lighthouse-audit');
    expect(lighthouseAuditPrompt.title).toBe('Lighthouse Accessibility Audit');
    expect(lighthouseAuditPrompt.description).toBeDefined();
    expect(typeof lighthouseAuditPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('lighthouse-audit');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Lighthouse Accessibility Audit');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
    expect(prompt?.argsSchema).toHaveProperty('wcagLevel');
  });

  it('should generate prompt with default wcagLevel AA, all report sections, and complementary tools', async () => {
    const testUrl = 'https://test-site.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = (message?.content as { type: 'text'; text: string }).text;
    expect(text).toContain(testUrl);
    expect(text).toContain('AA');
    expect(text).toContain('analyze-with-lighthouse');
    expect(text).toContain('Accessibility Score');
    expect(text).toContain('Failed Audits');
    expect(text).toContain('Audits That Need Manual Review');
    expect(text).toContain('Score Improvement Roadmap');
    expect(text).toContain('Quick Wins');
    expect(text).toContain('Medium Effort');
    expect(text).toContain('Larger Refactors');
    expect(text).toContain('Top 3 actions');
    expect(text).toContain('Poor');
    expect(text).toContain('Good');
    expect(text).toContain('axe-core');
    expect(text).toContain('Pa11y');
  });

  it('should respect provided wcagLevel parameter in tool call and criterion references', async () => {
    const resultA = await promptHandler({ url: 'https://example.com', wcagLevel: 'A' });
    const resultAAA = await promptHandler({ url: 'https://example.com', wcagLevel: 'AAA' });

    const textA = (resultA.messages[0]?.content as { type: 'text'; text: string }).text;
    const textAAA = (resultAAA.messages[0]?.content as { type: 'text'; text: string }).text;
    expect(textA).toContain('"A"');
    expect(textAAA).toContain('AAA');
    expect(textAAA).toContain('WCAG AAA criterion');
  });
});
