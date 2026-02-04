import { describe, it, expect, beforeAll } from 'vitest';
import { contrastCheckPrompt } from '../../../src/prompts/contrast/contrast-check.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('contrast-check Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    contrastCheckPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'contrast-check');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(contrastCheckPrompt.name).toBe('contrast-check');
    expect(contrastCheckPrompt.title).toBe('Contrast Check');
    expect(contrastCheckPrompt.description).toBeDefined();
    expect(typeof contrastCheckPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('contrast-check');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Contrast Check');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
    expect(prompt?.argsSchema).toHaveProperty('selector');
    expect(prompt?.argsSchema).toHaveProperty('algorithm');
    expect(prompt?.argsSchema).toHaveProperty('wcagLevel');
  });

  it('should generate prompt with WCAG21 defaults and AA thresholds', async () => {
    const testUrl = 'https://test-site.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain(testUrl);
    expect(text).toContain('WCAG21');
    expect(text).toContain('WCAG 2.1 standard luminance-based contrast');
    expect(text).toContain('4.5:1');
    expect(text).toContain('3:1');
    expect(text).toContain('analyze-contrast');
    expect(text).toContain('1.4.3');
    expect(text).toContain('1.4.6');
    expect(text).toContain('Implementation Guide');
  });

  it('should use APCA algorithm with correct thresholds when specified', async () => {
    const result = await promptHandler({ url: 'https://example.com', algorithm: 'APCA' });
    const text = result.messages[0]?.content.text;

    expect(text).toContain('APCA');
    expect(text).toContain('Accessible Perceptual Contrast Algorithm');
    expect(text).toContain('Lc 75');
    expect(text).toContain('Lc 60');
    expect(text).toContain('Lc 45');
  });

  it('should use AAA thresholds when wcagLevel is AAA', async () => {
    const result = await promptHandler({ url: 'https://example.com', wcagLevel: 'AAA' });
    const text = result.messages[0]?.content.text;

    expect(text).toContain('7:1');
    expect(text).toContain('4.5:1');
  });

  it('should include optional parameters when provided', async () => {
    const result = await promptHandler({
      url: 'https://example.com',
      selector: '.main-content',
      language: 'Spanish',
    });
    const text = result.messages[0]?.content.text;

    expect(text).toContain('.main-content');
    expect(text).toContain('Spanish');
  });
});
