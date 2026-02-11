import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { WCAGLevel, WCAGPrinciple } from '@/shared/types/accessibility.js';
import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import {
  getAllAudits,
  getAuditById,
  getAuditsByLevel,
  getAuditsByPrinciple,
  getAllAuditIds
} from './lighthouse.data.js';

const VALID_LEVELS: WCAGLevel[] = ['A', 'AA', 'AAA'];
const VALID_PRINCIPLES: WCAGPrinciple[] = ['perceivable', 'operable', 'understandable', 'robust'];

export function registerLighthouseResources(server: McpServer): void {
  server.registerResource(
    'lighthouse-audits-list',
    'lighthouse://audits',
    {
      description: 'Catálogo completo de auditorías de accesibilidad de Lighthouse con sus mapeos WCAG',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: 'lighthouse://audits',
        mimeType: 'application/json',
        text: JSON.stringify(getAllAudits(), null, 2)
      }]
    })
  );

  server.registerResource(
    'lighthouse-audit-by-id',
    new ResourceTemplate('lighthouse://audits/{auditId}', {
      list: async () => ({
        resources: getAllAuditIds().map(auditId => ({
          uri: `lighthouse://audits/${auditId}`,
          name: `Lighthouse: ${auditId}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Detalle de una auditoría de Lighthouse por ID (ej: color-contrast, image-alt)',
      mimeType: 'application/json'
    },
    async (uri: URL, variables: Variables) => {
      const auditId = variables.auditId as string;
      const audit = getAuditById(auditId);
      if (!audit) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({ error: `Auditoría Lighthouse '${auditId}' no encontrada` })
          }]
        };
      }
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(audit, null, 2)
        }]
      };
    }
  );

  server.registerResource(
    'lighthouse-audits-by-level',
    new ResourceTemplate('lighthouse://audits/level/{level}', {
      list: async () => ({
        resources: VALID_LEVELS.map(level => ({
          uri: `lighthouse://audits/level/${level}`,
          name: `Auditorías Lighthouse Nivel ${level}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Auditorías de Lighthouse filtradas por nivel de conformidad WCAG (A, AA, AAA)',
      mimeType: 'application/json'
    },
    async (uri: URL, variables: Variables) => {
      const level = variables.level as string;
      if (!VALID_LEVELS.includes(level as WCAGLevel)) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: `Nivel inválido: ${level}. Use A, AA o AAA`
            })
          }]
        };
      }
      const audits = getAuditsByLevel(level as WCAGLevel);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(audits, null, 2)
        }]
      };
    }
  );

  server.registerResource(
    'lighthouse-audits-by-principle',
    new ResourceTemplate('lighthouse://audits/principle/{principle}', {
      list: async () => ({
        resources: VALID_PRINCIPLES.map(principle => ({
          uri: `lighthouse://audits/principle/${principle}`,
          name: `Auditorías Lighthouse - ${principle.charAt(0).toUpperCase() + principle.slice(1)}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Auditorías de Lighthouse filtradas por principio POUR (perceivable, operable, understandable, robust)',
      mimeType: 'application/json'
    },
    async (uri: URL, variables: Variables) => {
      const principle = variables.principle as string;
      if (!VALID_PRINCIPLES.includes(principle as WCAGPrinciple)) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({
              error: `Principio inválido: ${principle}. Use perceivable, operable, understandable o robust`
            })
          }]
        };
      }
      const audits = getAuditsByPrinciple(principle as WCAGPrinciple);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(audits, null, 2)
        }]
      };
    }
  );
}
