import { describe, it, expect, beforeAll } from 'vitest';
import { explainWcagCriterionPrompt } from '../../../src/prompts/educational/explain-wcag-criterion.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('explain-wcag-criterion Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    explainWcagCriterionPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'explain-wcag-criterion');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(explainWcagCriterionPrompt.name).toBe('explain-wcag-criterion');
    expect(explainWcagCriterionPrompt.title).toBe('Explain WCAG Criterion');
    expect(explainWcagCriterionPrompt.description).toBeDefined();
    expect(typeof explainWcagCriterionPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('explain-wcag-criterion');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Explain WCAG Criterion');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('criterion');
  });

  it('should generate prompt with data from wcag-criteria.json for known criterion', async () => {
    const result = await promptHandler({ criterion: '1.1.1' });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain('1.1.1');
    expect(text).toContain('Contenido no textual');
    expect(text).toContain('Level A');
    expect(text).toContain('Perceivable');
    expect(text).toContain('Affected users');
    expect(text).toContain('Effort');
    expect(text).toContain('Priority');
    expect(text).toContain('Common solutions');
    expect(text).toContain('w3.org');
    expect(text).toContain('Code Examples');
    expect(text).toContain('Testing Strategies');
  });

  it('should handle different WCAG levels correctly', async () => {
    const resultAA = await promptHandler({ criterion: '1.4.3' });
    const resultAAA = await promptHandler({ criterion: '1.4.6' });

    expect(resultAA.messages[0]?.content.text).toContain('Level AA');
    expect(resultAA.messages[0]?.content.text).toContain('Contraste mínimo');

    expect(resultAAA.messages[0]?.content.text).toContain('Level AAA');
    expect(resultAAA.messages[0]?.content.text).toContain('Contraste mejorado');
  });

  it('should generate fallback prompt for unknown criterion', async () => {
    const result = await promptHandler({ criterion: '99.99.99' });

    expect(result.messages).toHaveLength(1);
    const text = result.messages[0]?.content.text;

    expect(text).toContain('99.99.99');
    expect(text).toContain('not in my local database');
    expect(text).toContain('Overview');
    expect(text).toContain('User Impact');
    expect(text).toContain('Common Failures');
    expect(text).toContain('Remediation');
  });
});
