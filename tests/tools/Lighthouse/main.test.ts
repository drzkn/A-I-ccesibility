import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import {
  createMockServer,
  getToolHandler,
  type MockMcpServer,
  type MockToolRegistration,
} from '../../helpers/mock-server.js';

const mockBrowser = {
  connected: true,
  wsEndpoint: vi.fn().mockReturnValue('ws://127.0.0.1:9222/devtools'),
  newPage: vi.fn().mockResolvedValue({ goto: vi.fn(), close: vi.fn() }),
  close: vi.fn().mockResolvedValue(undefined),
};

vi.mock('puppeteer', () => ({
  default: { launch: vi.fn().mockResolvedValue(mockBrowser) },
}));

const mockLighthouseResult = {
  lhr: {
    categories: {
      accessibility: {
        score: 0.92,
        auditRefs: [{ id: 'image-alt', weight: 10 }, { id: 'document-title', weight: 3 }],
      },
    },
    audits: {
      'image-alt': {
        id: 'image-alt', title: 'Image elements do not have [alt] attributes',
        description: 'Informative images should have alt text.', score: 0, scoreDisplayMode: 'binary',
        details: { items: [{ node: { selector: 'img', snippet: '<img src="test.jpg">' } }] },
      },
      'document-title': {
        id: 'document-title', title: 'Document has a <title> element',
        description: 'The title element provides an overview.', score: 1, scoreDisplayMode: 'binary',
      },
    },
    lighthouseVersion: '13.0.0',
    userAgent: 'HeadlessChrome/120.0',
    finalDisplayedUrl: 'https://example.com/',
  },
};

const mockLighthouseFn = vi.fn().mockResolvedValue(mockLighthouseResult);
vi.mock('lighthouse', () => ({ default: mockLighthouseFn }));

const { analyzeWithLighthouseTool, disposeLighthouseAdapter } = await import(
  '../../../src/tools/Lighthouse/main.js'
);

describe('analyze-with-lighthouse Tool', () => {
  let mockServer: MockMcpServer;
  let toolHandler: MockToolRegistration['handler'];

  beforeAll(() => {
    mockServer = createMockServer();
    analyzeWithLighthouseTool.register(mockServer as never);
    toolHandler = getToolHandler(mockServer, 'analyze-with-lighthouse');
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockBrowser.connected = true;
    mockLighthouseFn.mockResolvedValue(mockLighthouseResult);
  });

  afterAll(async () => {
    await disposeLighthouseAdapter();
  });

  describe('tool registration', () => {
    it('should register with correct name, description and schema (url + options, no html)', () => {
      const tool = mockServer.registeredTools.get('analyze-with-lighthouse');
      expect(tool).toBeDefined();
      expect(tool?.description.length).toBeGreaterThan(50);
      expect(tool?.schema).toHaveProperty('url');
      expect(tool?.schema).toHaveProperty('options');
      expect(tool?.schema).not.toHaveProperty('html');
    });
  });

  describe('input validation', () => {
    it('should reject missing or invalid URL', async () => {
      for (const input of [{}, { url: 'not-a-valid-url' }]) {
        const result = await toolHandler(input);
        expect(result.content[0]?.text).toContain('Error');
      }
    });

    it('should accept valid URL and return structured response', async () => {
      const result = await toolHandler({ url: 'https://example.com' });
      const response = JSON.parse(result.content[0]?.text ?? '{}');

      expect(result.content).toHaveLength(1);
      expect(result.content[0]?.type).toBe('text');
      expect(response.success).toBe(true);
      expect(response.target).toBe('https://example.com');
      expect(response.accessibilityScore).toBe(92);
      expect(response.issueCount).toBeGreaterThan(0);
      expect(Array.isArray(response.issues)).toBe(true);
      expect(response.summary.bySeverity).toHaveProperty('critical');
      expect(response.duration).toBeGreaterThanOrEqual(0);

      const issue = response.issues[0];
      expect(issue.id).toBeDefined();
      expect(issue.ruleId).toBe('image-alt');
      expect(issue.tool).toBe('lighthouse');
    });
  });

  describe('options handling', () => {
    it('should accept wcagLevel and browser options without error', async () => {
      const result = await toolHandler({
        url: 'https://example.com',
        options: { wcagLevel: 'AAA', browser: { viewport: { width: 1920, height: 1080 }, ignoreHTTPSErrors: true } },
      });
      const response = JSON.parse(result.content[0]?.text ?? '{}');
      expect(response.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return error when lighthouse fails or returns null', async () => {
      for (const setup of [
        () => mockLighthouseFn.mockRejectedValueOnce(new Error('Lighthouse failure')),
        () => mockLighthouseFn.mockResolvedValueOnce(null),
      ]) {
        setup();
        const result = await toolHandler({ url: 'https://example.com' });
        const response = JSON.parse(result.content[0]?.text ?? '{}');
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
      }
    });
  });
});

describe('Tool Definition', () => {
  it('should expose name, description and register function', () => {
    expect(analyzeWithLighthouseTool.name).toBe('analyze-with-lighthouse');
    expect(typeof analyzeWithLighthouseTool.description).toBe('string');
    expect(typeof analyzeWithLighthouseTool.register).toBe('function');
  });
});
