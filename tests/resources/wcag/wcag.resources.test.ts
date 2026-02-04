import { describe, it, expect, beforeAll } from 'vitest';
import { registerWcagResources } from '../../../src/resources/wcag/wcag.resources.js';
import {
  getAllCriteria,
  getCriterionById,
  getCriteriaByLevel,
  getCriteriaByPrinciple
} from '../../../src/resources/wcag/wcag.data.js';
import {
  createMockResourceServer,
  getResourceHandler,
  getResourceTemplateHandler,
  type MockResourceServer
} from '../../helpers/mock-resource-server.js';

describe('WCAG Resources', () => {
  let mockServer: MockResourceServer;

  beforeAll(() => {
    mockServer = createMockResourceServer();
    registerWcagResources(mockServer as never);
  });

  it('should register all WCAG resources with correct metadata', () => {
    expect(mockServer.registeredResources.has('wcag-criteria-list')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('wcag-criterion-by-id')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('wcag-criteria-by-level')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('wcag-criteria-by-principle')).toBe(true);

    const criteriaList = mockServer.registeredResources.get('wcag-criteria-list');
    expect(criteriaList?.metadata.mimeType).toBe('application/json');
    expect(criteriaList?.metadata.description).toBeDefined();
  });

  it('should return all WCAG criteria with correct structure', async () => {
    const handler = getResourceHandler(mockServer, 'wcag-criteria-list');
    const result = await handler();

    expect(result.contents[0]?.uri).toBe('wcag://criteria');
    expect(result.contents[0]?.mimeType).toBe('application/json');

    const criteria = JSON.parse(result.contents[0]?.text ?? '[]');
    expect(criteria.length).toBe(getAllCriteria().length);

    const firstCriterion = criteria[0];
    expect(firstCriterion).toHaveProperty('criterion');
    expect(firstCriterion).toHaveProperty('title');
    expect(firstCriterion).toHaveProperty('level');
    expect(firstCriterion).toHaveProperty('principle');
  });

  it('should return specific criterion by ID and handle invalid IDs', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'wcag-criterion-by-id');
    
    const result = await handler(new URL('wcag://criteria/1.4.3'), { id: '1.4.3' });
    const criterion = JSON.parse(result.contents[0]?.text ?? '{}');
    const expected = getCriterionById('1.4.3');
    
    expect(criterion.criterion).toBe('1.4.3');
    expect(criterion.title).toBe(expected?.title);
    expect(criterion.level).toBe(expected?.level);

    const invalidResult = await handler(new URL('wcag://criteria/99.99.99'), { id: '99.99.99' });
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('no encontrado');
  });

  it('should filter criteria by level and reject invalid levels', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'wcag-criteria-by-level');

    for (const level of ['A', 'AA', 'AAA'] as const) {
      const result = await handler(new URL(`wcag://criteria/level/${level}`), { level });
      const criteria = JSON.parse(result.contents[0]?.text ?? '[]');
      
      expect(criteria.length).toBe(getCriteriaByLevel(level).length);
      expect(criteria.every((c: { level: string }) => c.level === level)).toBe(true);
    }

    const invalidResult = await handler(new URL('wcag://criteria/level/AAAA'), { level: 'AAAA' });
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('Nivel inválido');
  });

  it('should filter criteria by principle and reject invalid principles', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'wcag-criteria-by-principle');
    const principles = ['perceivable', 'operable', 'understandable', 'robust'] as const;

    for (const principle of principles) {
      const result = await handler(
        new URL(`wcag://criteria/principle/${principle}`),
        { principle }
      );
      const criteria = JSON.parse(result.contents[0]?.text ?? '[]');
      
      expect(criteria.length).toBe(getCriteriaByPrinciple(principle).length);
      expect(criteria.every((c: { principle: string }) => c.principle === principle)).toBe(true);
    }

    const invalidResult = await handler(
      new URL('wcag://criteria/principle/invalid'),
      { principle: 'invalid' }
    );
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('Principio inválido');
  });
});
