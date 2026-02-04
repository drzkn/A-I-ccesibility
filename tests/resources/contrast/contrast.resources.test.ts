import { describe, it, expect, beforeAll } from 'vitest';
import { registerContrastResources } from '../../../src/resources/contrast/contrast.resources.js';
import {
  getWCAG21Thresholds,
  getAPCAThresholds,
  getAlgorithms
} from '../../../src/resources/contrast/contrast.data.js';
import {
  createMockResourceServer,
  getResourceHandler,
  type MockResourceServer
} from '../../helpers/mock-resource-server.js';

describe('Contrast Resources', () => {
  let mockServer: MockResourceServer;

  beforeAll(() => {
    mockServer = createMockResourceServer();
    registerContrastResources(mockServer as never);
  });

  it('should register all contrast resources with correct metadata and URIs', () => {
    const resources = [
      { name: 'contrast-wcag21-thresholds', uri: 'contrast://thresholds/wcag21' },
      { name: 'contrast-apca-thresholds', uri: 'contrast://thresholds/apca' },
      { name: 'contrast-algorithms', uri: 'contrast://algorithms' }
    ];

    for (const { name, uri } of resources) {
      const resource = mockServer.registeredResources.get(name);
      expect(resource).toBeDefined();
      expect(resource?.uri).toBe(uri);
      expect(resource?.metadata.mimeType).toBe('application/json');
      expect(resource?.metadata.description).toBeDefined();
    }
  });

  it('should return WCAG 2.1 thresholds with correct values', async () => {
    const handler = getResourceHandler(mockServer, 'contrast-wcag21-thresholds');
    const result = await handler();
    const thresholds = JSON.parse(result.contents[0]?.text ?? '{}');
    const expected = getWCAG21Thresholds();

    expect(result.contents[0]?.uri).toBe('contrast://thresholds/wcag21');
    expect(thresholds.AA_NORMAL).toEqual(expected.AA_NORMAL);
    expect(thresholds.AA_LARGE).toEqual(expected.AA_LARGE);
    expect(thresholds.AAA_NORMAL).toEqual(expected.AAA_NORMAL);
    expect(thresholds.AAA_LARGE).toEqual(expected.AAA_LARGE);
    expect(thresholds.NON_TEXT).toEqual(expected.NON_TEXT);
  });

  it('should return APCA thresholds with correct values', async () => {
    const handler = getResourceHandler(mockServer, 'contrast-apca-thresholds');
    const result = await handler();
    const thresholds = JSON.parse(result.contents[0]?.text ?? '{}');
    const expected = getAPCAThresholds();

    expect(result.contents[0]?.uri).toBe('contrast://thresholds/apca');
    expect(thresholds.BODY_TEXT).toEqual(expected.BODY_TEXT);
    expect(thresholds.LARGE_TEXT).toEqual(expected.LARGE_TEXT);
    expect(thresholds.NON_TEXT).toEqual(expected.NON_TEXT);
  });

  it('should return algorithms with correct structure and threshold references', async () => {
    const handler = getResourceHandler(mockServer, 'contrast-algorithms');
    const result = await handler();
    const algorithms = JSON.parse(result.contents[0]?.text ?? '[]');
    const expected = getAlgorithms();

    expect(result.contents[0]?.uri).toBe('contrast://algorithms');
    expect(algorithms.length).toBe(expected.length);

    const wcag21 = algorithms.find((a: { id: string }) => a.id === 'WCAG21');
    expect(wcag21?.thresholdUri).toBe('contrast://thresholds/wcag21');
    expect(wcag21).toHaveProperty('name');
    expect(wcag21).toHaveProperty('description');
    expect(wcag21).toHaveProperty('standard');

    const apca = algorithms.find((a: { id: string }) => a.id === 'APCA');
    expect(apca?.thresholdUri).toBe('contrast://thresholds/apca');
  });
});
