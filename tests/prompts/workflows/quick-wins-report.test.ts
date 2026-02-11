import { describe, it, expect, beforeAll } from 'vitest';
import { quickWinsReportPrompt } from '../../../src/prompts/workflows/quick-wins-report.js';
import {
  createMockPromptServer,
  getPromptHandler,
  type MockPromptServer,
  type MockPromptRegistration,
} from '../../helpers/mock-prompt-server.js';

describe('quick-wins-report Prompt', () => {
  let mockServer: MockPromptServer;
  let promptHandler: MockPromptRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockPromptServer();
    quickWinsReportPrompt.register(mockServer as never);
    promptHandler = getPromptHandler(mockServer, 'quick-wins-report');
  });

  it('should have correct PromptDefinition properties', () => {
    expect(quickWinsReportPrompt.name).toBe('quick-wins-report');
    expect(quickWinsReportPrompt.title).toBe('Accessibility Quick Wins Report');
    expect(quickWinsReportPrompt.description).toBeDefined();
    expect(typeof quickWinsReportPrompt.register).toBe('function');
  });

  it('should register with correct metadata and schema', () => {
    const prompt = mockServer.registeredPrompts.get('quick-wins-report');

    expect(prompt).toBeDefined();
    expect(prompt?.title).toBe('Accessibility Quick Wins Report');
    expect(prompt?.description.length).toBeGreaterThan(20);
    expect(prompt?.argsSchema).toHaveProperty('url');
  });

  it('should generate prompt with all three tools, quick wins criteria, and Lighthouse score sections', async () => {
    const testUrl = 'https://test-site.com';
    const result = await promptHandler({ url: testUrl });

    expect(result.messages).toHaveLength(1);
    const message = result.messages[0];
    expect(message?.role).toBe('user');
    expect(message?.content.type).toBe('text');

    const text = message?.content.text;
    expect(text).toContain(testUrl);
    expect(text).toContain('analyze-mixed');
    expect(text).toContain('analyze-with-lighthouse');
    expect(text).toContain('all three tools');
    expect(text).toContain('High Impact');
    expect(text).toContain('Low Effort');
    expect(text).toContain('High Confidence');
    expect(text).toContain('Priority');
    expect(text).toContain('Missing alt text');
    expect(text).toContain('Missing form labels');
    expect(text).toContain('Low color contrast');
    expect(text).toContain('Missing document language');
    expect(text).toContain('Before');
    expect(text).toContain('After');
    expect(text).toContain('Implementation Checklist');
    expect(text).toContain('- [ ]');
    expect(text).toContain('NOT Considered Quick Wins');
    expect(text).toContain('Current Lighthouse Score');
    expect(text).toContain('Key failing Lighthouse audits');
    expect(text).toContain('Impact Estimation');
    expect(text).toContain('Projected Lighthouse score improvement');
  });
});
