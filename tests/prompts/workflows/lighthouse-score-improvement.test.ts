import { describe, it, expect, beforeAll } from 'vitest';
import { lighthouseScoreImprovementPrompt } from '../../../src/prompts/workflows/lighthouse-score-improvement.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('lighthouse-score-improvement Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    lighthouseScoreImprovementPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'lighthouse-score-improvement');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(lighthouseScoreImprovementPrompt.name).toBe('lighthouse-score-improvement');
    expect(lighthouseScoreImprovementPrompt.title).toBe('Lighthouse Score Improvement Plan');
    expect(lighthouseScoreImprovementPrompt.description).toBeDefined();
    expect(typeof lighthouseScoreImprovementPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('lighthouse-score-improvement');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Lighthouse Score Improvement Plan');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
    expect(prompt?.argsSchema).toHaveProperty('targetScore');
  });

  it('should generate full improvement plan with default targetScore and all sections', async () => {
    const testUrl = 'https://example.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = (message?.content as { type: 'text'; text: string }).text;
    expect(text).toContain(testUrl);
    expect(text).toContain('analyze-with-lighthouse');
    expect(text).toContain('90/100');
    expect(text).toContain('Current State');
    expect(text).toContain('Score Impact Analysis');
    expect(text).toContain('Weight/Impact');
    expect(text).toContain('Affected Elements');
    expect(text).toContain('Phase 1: Critical Fixes');
    expect(text).toContain('Phase 2: Important Fixes');
    expect(text).toContain('Phase 3: Final Polish');
    expect(text).toContain('Estimated score gain');
    expect(text).toContain('Audits That Need Manual Review');
    expect(text).toContain('Progress Tracking');
    expect(text).toContain('Score Improvement Checklist');
    expect(text).toContain(`Checklist for ${testUrl}`);
    expect(text).toContain('Target: 90/100');
    expect(text).toContain('- [ ]');
    expect(text).toContain('Beyond the Target');
    expect(text).toContain('axe-core');
    expect(text).toContain('Pa11y');
  });

  it('should use custom targetScore when provided', async () => {
    const testUrl = 'https://example.com';
    const result = await promptHandler({ url: testUrl, targetScore: 95 });

    const text = (result.messages[0]?.content as { type: 'text'; text: string }).text;
    expect(text).toContain('95/100');
    expect(text).toContain('already >= 95');
    expect(text).not.toContain('90/100');
  });
});
