import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { analyzeWithAxeTool, disposeAxeAdapter } from '../../../src/tools/Axe/main.js';
import { fixtures } from '../../fixtures/html-fixtures.js';
import {
  createMockServer,
  getToolHandler,
  type MockMcpServer,
  type MockToolRegistration,
} from '../../helpers/mock-server.js';

describe('analyze-with-axe Tool', () => {
  let mockServer: MockMcpServer;
  let toolHandler: MockToolRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockServer();
    analyzeWithAxeTool.register(mockServer as never);
    toolHandler = getToolHandler(mockServer, 'analyze-with-axe');
  });

  afterAll(async () => {
    await disposeAxeAdapter();
  });

  describe('tool registration', () => {
    it('should register with correct name', () => {
      expect(mockServer.registeredTools.has('analyze-with-axe')).toBe(true);
    });

    it('should have a description', () => {
      const tool = mockServer.registeredTools.get('analyze-with-axe');
      expect(tool?.description.length).toBeGreaterThan(50);
    });

    it('should have schema with url, html, and options', () => {
      const tool = mockServer.registeredTools.get('analyze-with-axe');
      expect(tool?.schema).toHaveProperty('url');
      expect(tool?.schema).toHaveProperty('html');
      expect(tool?.schema).toHaveProperty('options');
    });
  });

  describe('input validation', () => {
    it('should reject when neither url nor html is provided', async () => {
      const result = await toolHandler({});

      expect(result.content).toBeDefined();
      expect(result.content[0]?.text).toContain('Error');
    });

    it('should reject when both url and html are provided', async () => {
      const result = await toolHandler({
        url: 'https://example.com',
        html: '<html></html>',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0]?.text).toContain('Error');
    });

    it('should reject invalid URL format', async () => {
      const result = await toolHandler({
        url: 'not-a-valid-url',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0]?.text).toContain('Error');
    });

    it('should accept valid URL', async () => {
      const result = await toolHandler({
        url: 'https://example.com',
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');
      expect(response).toHaveProperty('success');
    });

    it('should accept valid HTML', async () => {
      const result = await toolHandler({
        html: fixtures.valid,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');
      expect(response.success).toBe(true);
    });
  });

  describe('analysis with HTML content', () => {
    it('should analyze valid HTML and return structured result', async () => {
      const result = await toolHandler({
        html: fixtures.valid,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.success).toBe(true);
      expect(response.target).toBeDefined();
      expect(response.issueCount).toBeDefined();
      expect(response.issues).toBeDefined();
      expect(Array.isArray(response.issues)).toBe(true);
      expect(response.summary).toBeDefined();
    });

    it('should detect missing alt text issues', async () => {
      const result = await toolHandler({
        html: fixtures.missingAltText,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.success).toBe(true);
      expect(response.issueCount).toBeGreaterThan(0);

      const imageAltIssues = response.issues.filter(
        (i: { ruleId: string }) => i.ruleId === 'image-alt'
      );
      expect(imageAltIssues.length).toBeGreaterThan(0);
    });

    it('should detect missing form labels', async () => {
      const result = await toolHandler({
        html: fixtures.missingFormLabels,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.success).toBe(true);
      expect(response.issueCount).toBeGreaterThan(0);
    });

    it('should detect missing lang attribute', async () => {
      const result = await toolHandler({
        html: fixtures.missingLang,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.success).toBe(true);

      const langIssues = response.issues.filter(
        (i: { ruleId: string }) => i.ruleId === 'html-has-lang'
      );
      expect(langIssues.length).toBeGreaterThan(0);
    });

    it('should detect multiple issues in problematic HTML', async () => {
      const result = await toolHandler({
        html: fixtures.multipleIssues,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.success).toBe(true);
      expect(response.issueCount).toBeGreaterThan(2);
    });
  });

  describe('options handling', () => {
    it('should respect wcagLevel option', async () => {
      const resultA = await toolHandler({
        html: fixtures.multipleIssues,
        options: { wcagLevel: 'A' },
      });

      const resultAAA = await toolHandler({
        html: fixtures.multipleIssues,
        options: { wcagLevel: 'AAA' },
      });

      const responseA = JSON.parse(resultA.content[0]?.text ?? '{}');
      const responseAAA = JSON.parse(resultAAA.content[0]?.text ?? '{}');

      expect(responseA.success).toBe(true);
      expect(responseAAA.success).toBe(true);
    });

    it('should respect excludeRules option', async () => {
      const resultWithRule = await toolHandler({
        html: fixtures.missingLang,
      });

      const resultWithoutRule = await toolHandler({
        html: fixtures.missingLang,
        options: { excludeRules: ['html-has-lang'] },
      });

      const responseWithRule = JSON.parse(resultWithRule.content[0]?.text ?? '{}');
      const responseWithoutRule = JSON.parse(resultWithoutRule.content[0]?.text ?? '{}');

      const langIssuesWithRule = responseWithRule.issues.filter(
        (i: { ruleId: string }) => i.ruleId === 'html-has-lang'
      );
      const langIssuesWithoutRule = responseWithoutRule.issues.filter(
        (i: { ruleId: string }) => i.ruleId === 'html-has-lang'
      );

      expect(langIssuesWithRule.length).toBeGreaterThan(0);
      expect(langIssuesWithoutRule.length).toBe(0);
    });

    it('should respect includeIncomplete option', async () => {
      const resultWithIncomplete = await toolHandler({
        html: fixtures.valid,
        options: { includeIncomplete: true },
      });

      const resultWithoutIncomplete = await toolHandler({
        html: fixtures.valid,
        options: { includeIncomplete: false },
      });

      const responseWithIncomplete = JSON.parse(resultWithIncomplete.content[0]?.text ?? '{}');
      const responseWithoutIncomplete = JSON.parse(resultWithoutIncomplete.content[0]?.text ?? '{}');

      expect(responseWithIncomplete.success).toBe(true);
      expect(responseWithoutIncomplete.success).toBe(true);
    });
  });

  describe('response structure', () => {
    it('should return properly formatted JSON response', async () => {
      const result = await toolHandler({
        html: fixtures.missingAltText,
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('target');
      expect(response).toHaveProperty('issueCount');
      expect(response).toHaveProperty('issues');
      expect(response).toHaveProperty('summary');
    });

    it('should include summary with severity counts', async () => {
      const result = await toolHandler({
        html: fixtures.multipleIssues,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response.summary).toHaveProperty('total');
      expect(response.summary).toHaveProperty('bySeverity');
      expect(response.summary.bySeverity).toHaveProperty('critical');
      expect(response.summary.bySeverity).toHaveProperty('serious');
      expect(response.summary.bySeverity).toHaveProperty('moderate');
      expect(response.summary.bySeverity).toHaveProperty('minor');
    });

    it('should include duration in response', async () => {
      const result = await toolHandler({
        html: fixtures.valid,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(response).toHaveProperty('duration');
      expect(response.duration).toBeGreaterThan(0);
    });

    it('should include issue details with required fields', async () => {
      const result = await toolHandler({
        html: fixtures.missingAltText,
      });

      const response = JSON.parse(result.content[0]?.text ?? '{}');
      const issue = response.issues[0];

      expect(issue).toHaveProperty('id');
      expect(issue).toHaveProperty('ruleId');
      expect(issue).toHaveProperty('tool');
      expect(issue).toHaveProperty('severity');
      expect(issue).toHaveProperty('location');
      expect(issue).toHaveProperty('message');
    });
  });

  describe('error handling', () => {
    it('should return error for unreachable URL', async () => {
      const result = await toolHandler({
        url: 'http://localhost:99999/nonexistent',
      });

      const text = result.content[0]?.text ?? '';

      if (text.startsWith('Error:')) {
        expect(text).toContain('Error');
      } else {
        const response = JSON.parse(text);
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
      }
    });

    it('should handle empty HTML gracefully', async () => {
      const result = await toolHandler({
        html: '',
      });

      expect(result.content[0]?.text).toContain('Error');
    });
  });
});

describe('Tool Definition', () => {
  it('should have correct name property', () => {
    expect(analyzeWithAxeTool.name).toBe('analyze-with-axe');
  });

  it('should have description property', () => {
    expect(analyzeWithAxeTool.description).toBeDefined();
    expect(typeof analyzeWithAxeTool.description).toBe('string');
  });

  it('should have register function', () => {
    expect(typeof analyzeWithAxeTool.register).toBe('function');
  });
});
