import { describe, it, expect, beforeAll } from 'vitest';
import { registerLighthouseResources } from '../../../src/resources/lighthouse/lighthouse.resources.js';
import {
  getAllAudits,
  getAuditById,
  getAuditsByLevel,
  getAuditsByPrinciple
} from '../../../src/resources/lighthouse/lighthouse.data.js';
import {
  createMockResourceServer,
  getResourceHandler,
  getResourceTemplateHandler,
  type MockResourceServer
} from '../../helpers/mock-resource-server.js';

describe('Lighthouse Resources', () => {
  let mockServer: MockResourceServer;

  beforeAll(() => {
    mockServer = createMockResourceServer();
    registerLighthouseResources(mockServer as never);
  });

  it('should register all Lighthouse resources with correct metadata', () => {
    expect(mockServer.registeredResources.has('lighthouse-audits-list')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('lighthouse-audit-by-id')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('lighthouse-audits-by-level')).toBe(true);
    expect(mockServer.registeredResourceTemplates.has('lighthouse-audits-by-principle')).toBe(true);

    const auditsList = mockServer.registeredResources.get('lighthouse-audits-list');
    expect(auditsList?.metadata.mimeType).toBe('application/json');
    expect(auditsList?.metadata.description).toBeDefined();
  });

  it('should return all Lighthouse audits with correct structure', async () => {
    const handler = getResourceHandler(mockServer, 'lighthouse-audits-list');
    const result = await handler();

    expect(result.contents[0]?.uri).toBe('lighthouse://audits');
    expect(result.contents[0]?.mimeType).toBe('application/json');

    const audits = JSON.parse(result.contents[0]?.text ?? '[]');
    expect(audits.length).toBe(getAllAudits().length);

    const firstAudit = audits[0];
    expect(firstAudit).toHaveProperty('auditId');
    expect(firstAudit).toHaveProperty('title');
    expect(firstAudit).toHaveProperty('description');
    expect(firstAudit).toHaveProperty('wcagCriterion');
    expect(firstAudit).toHaveProperty('wcagLevel');
    expect(firstAudit).toHaveProperty('wcagPrinciple');
  });

  it('should return specific audit by ID and handle invalid IDs', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'lighthouse-audit-by-id');

    const result = await handler(
      new URL('lighthouse://audits/color-contrast'),
      { auditId: 'color-contrast' }
    );
    const audit = JSON.parse(result.contents[0]?.text ?? '{}');
    const expected = getAuditById('color-contrast');

    expect(audit.auditId).toBe('color-contrast');
    expect(audit.title).toBe(expected?.title);
    expect(audit.wcagLevel).toBe(expected?.wcagLevel);
    expect(audit.wcagPrinciple).toBe(expected?.wcagPrinciple);

    const invalidResult = await handler(
      new URL('lighthouse://audits/nonexistent-audit'),
      { auditId: 'nonexistent-audit' }
    );
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('no encontrada');
  });

  it('should filter audits by level and reject invalid levels', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'lighthouse-audits-by-level');

    for (const level of ['A', 'AA', 'AAA'] as const) {
      const result = await handler(
        new URL(`lighthouse://audits/level/${level}`),
        { level }
      );
      const audits = JSON.parse(result.contents[0]?.text ?? '[]');

      expect(audits.length).toBe(getAuditsByLevel(level).length);
      expect(audits.every((a: { wcagLevel: string }) => a.wcagLevel === level)).toBe(true);
    }

    const invalidResult = await handler(
      new URL('lighthouse://audits/level/AAAA'),
      { level: 'AAAA' }
    );
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('Nivel inválido');
  });

  it('should filter audits by principle and reject invalid principles', async () => {
    const handler = getResourceTemplateHandler(mockServer, 'lighthouse-audits-by-principle');
    const principles = ['perceivable', 'operable', 'understandable', 'robust'] as const;

    for (const principle of principles) {
      const result = await handler(
        new URL(`lighthouse://audits/principle/${principle}`),
        { principle }
      );
      const audits = JSON.parse(result.contents[0]?.text ?? '[]');

      expect(audits.length).toBe(getAuditsByPrinciple(principle).length);
      expect(audits.every((a: { wcagPrinciple: string }) => a.wcagPrinciple === principle)).toBe(true);
    }

    const invalidResult = await handler(
      new URL('lighthouse://audits/principle/invalid'),
      { principle: 'invalid' }
    );
    const errorResponse = JSON.parse(invalidResult.contents[0]?.text ?? '{}');
    expect(errorResponse.error).toContain('Principio inválido');
  });
});
