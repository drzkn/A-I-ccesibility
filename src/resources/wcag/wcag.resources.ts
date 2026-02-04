import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { WCAGLevel, WCAGPrinciple } from '@/shared/types/accessibility.js';
import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js';
import {
  getAllCriteria,
  getCriterionById,
  getCriteriaByLevel,
  getCriteriaByPrinciple,
  getAllCriteriaIds
} from './wcag.data.js';

const VALID_LEVELS: WCAGLevel[] = ['A', 'AA', 'AAA'];
const VALID_PRINCIPLES: WCAGPrinciple[] = ['perceivable', 'operable', 'understandable', 'robust'];

export function registerWcagResources(server: McpServer): void {
  server.registerResource(
    'wcag-criteria-list',
    'wcag://criteria',
    {
      description: 'Lista de todos los criterios WCAG 2.1 disponibles',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: 'wcag://criteria',
        mimeType: 'application/json',
        text: JSON.stringify(getAllCriteria(), null, 2)
      }]
    })
  );

  server.registerResource(
    'wcag-criterion-by-id',
    new ResourceTemplate('wcag://criteria/{id}', {
      list: async () => ({
        resources: getAllCriteriaIds().map(id => ({
          uri: `wcag://criteria/${id}`,
          name: `WCAG ${id}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Criterio WCAG específico por ID (ej: 1.4.3)',
      mimeType: 'application/json'
    },
    async (uri: URL, variables: Variables) => {
      const id = variables.id as string;
      const criterion = getCriterionById(id);
      if (!criterion) {
        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({ error: `Criterio WCAG ${id} no encontrado` })
          }]
        };
      }
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(criterion, null, 2)
        }]
      };
    }
  );

  server.registerResource(
    'wcag-criteria-by-level',
    new ResourceTemplate('wcag://criteria/level/{level}', {
      list: async () => ({
        resources: VALID_LEVELS.map(level => ({
          uri: `wcag://criteria/level/${level}`,
          name: `Criterios WCAG Nivel ${level}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Criterios WCAG filtrados por nivel de conformidad (A, AA, AAA)',
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
      const criteria = getCriteriaByLevel(level as WCAGLevel);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(criteria, null, 2)
        }]
      };
    }
  );

  server.registerResource(
    'wcag-criteria-by-principle',
    new ResourceTemplate('wcag://criteria/principle/{principle}', {
      list: async () => ({
        resources: VALID_PRINCIPLES.map(principle => ({
          uri: `wcag://criteria/principle/${principle}`,
          name: `Criterios WCAG - ${principle.charAt(0).toUpperCase() + principle.slice(1)}`,
          mimeType: 'application/json'
        }))
      })
    }),
    {
      description: 'Criterios WCAG filtrados por principio POUR (perceivable, operable, understandable, robust)',
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
      const criteria = getCriteriaByPrinciple(principle as WCAGPrinciple);
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(criteria, null, 2)
        }]
      };
    }
  );
}
