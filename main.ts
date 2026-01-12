import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';

// 1. Crea el servidor. 
// Interfaz principal con el protocolo MCP. Maneja la comunicación entre el cliente y el servidor.

const server = new McpServer({
  name: 'Demo',
  version: '1.0.0'
});

const fetchWeatherCallback =
  async ({ city }: { city: string }) => {
    return {
      content: [{
        type: 'text' as const,
        text: `El clima de ${city} es soleado`
      }]
    };
  };

// 2. Definir las herramientas.
// Las herramientas permiten al LLM hacer operaciones a través del servidor
server.registerTool(
  'fetch-wheather',
  { 
    description: 'Tool to fetch the weather of a city',
    inputSchema: {
      city: z.string().describe('City name')
    }
  },
  fetchWeatherCallback
)

// 3. Escuchar las conexiones del cliente
const transporter =  new StdioServerTransport();
server.connect(transporter);