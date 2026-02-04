import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getWCAG21Thresholds,
  getAPCAThresholds,
  getAlgorithms
} from './contrast.data.js';

export function registerContrastResources(server: McpServer): void {
  server.registerResource(
    'contrast-wcag21-thresholds',
    'contrast://thresholds/wcag21',
    {
      description: 'Umbrales de ratio de contraste según WCAG 2.1',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: 'contrast://thresholds/wcag21',
        mimeType: 'application/json',
        text: JSON.stringify(getWCAG21Thresholds(), null, 2)
      }]
    })
  );

  server.registerResource(
    'contrast-apca-thresholds',
    'contrast://thresholds/apca',
    {
      description: 'Umbrales de contraste perceptual según APCA (propuesto para WCAG 3.0)',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: 'contrast://thresholds/apca',
        mimeType: 'application/json',
        text: JSON.stringify(getAPCAThresholds(), null, 2)
      }]
    })
  );

  server.registerResource(
    'contrast-algorithms',
    'contrast://algorithms',
    {
      description: 'Lista de algoritmos de contraste soportados con descripción',
      mimeType: 'application/json'
    },
    async () => ({
      contents: [{
        uri: 'contrast://algorithms',
        mimeType: 'application/json',
        text: JSON.stringify(getAlgorithms(), null, 2)
      }]
    })
  );
}
