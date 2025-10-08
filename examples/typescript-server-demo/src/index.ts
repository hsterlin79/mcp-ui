import express from 'express';
import { z } from "zod";
import cors from 'cors';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createUIResource } from '@mcp-ui/server';
import { randomUUID } from 'crypto';
import { generateFlightResultsHTML } from './utils/htmlResource.js';
import { getFlightRequestSchemaAsZod, getFlightResponseSchemaAsZod } from './utils/schema.js';
import { getAvailableFlights } from './utils/data.js';
import { getFlightSearchFormHtml, getAddressSelfContainedHtml } from './utils/formLoader.js';
import { LwcHandler } from './lwcHandler.js';

const app = express();
const port = 3000;

app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));
app.use(express.json());

// Map to store transports by session ID, as shown in the documentation.
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST requests for client-to-server communication.
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // A session already exists; reuse the existing transport.
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // This is a new initialization request. Create a new transport.
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        transports[sid] = transport;
        console.log(`MCP Session initialized: ${sid}`);
      },
    });

    // Clean up the transport from our map when the session closes.
    transport.onclose = () => {
      if (transport.sessionId) {
        console.log(`MCP Session closed: ${transport.sessionId}`);
        delete transports[transport.sessionId];
      }
    };

    // Create a new server instance for this specific session.
    const server = new McpServer({
      name: "typescript-server-demo",
      version: "1.0.0"
    });

    // Register our tools on the new server instance.
    server.registerTool('getFlightResultsAsStructuredContent', {
      title: 'Search Flights',
      description: 'Search for available flights between two cities on a specific date. Returns flight details including prices and times.',
      inputSchema: getFlightRequestSchemaAsZod(),
      outputSchema: getFlightResponseSchemaAsZod(),
    }, async ({ originCity, destinationCity, dateOfTravel, filters }) => {
      console.log(`Flight search - Origin: ${originCity}, Destination: ${destinationCity}, Date: ${dateOfTravel}, Filters: ${JSON.stringify(filters)}`);
      const flightData = getAvailableFlights(originCity, destinationCity, filters.price, filters.discountPercentage);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(flightData),
        }],
        structuredContent: flightData,
      };
    });

    server.registerTool('getFlightResultsAsRawHtml', {
      title: 'Search Flights',
      description: 'Search for available flights between two cities on a specific date. Returns flight details including prices and times.  Returns the results as raw HTML.',
      inputSchema: getFlightRequestSchemaAsZod(),
    }, async ({ originCity, destinationCity, dateOfTravel, filters }) => {
      console.log(`Flight search - Origin: ${originCity}, Destination: ${destinationCity}, Date: ${dateOfTravel}, Filters: ${JSON.stringify(filters)}`);
      const flightData = getAvailableFlights(originCity, destinationCity, filters.price, filters.discountPercentage);
      const flightDataHtml = generateFlightResultsHTML(flightData, originCity, destinationCity, dateOfTravel);
      const uiResource = createUIResource({
        uri: 'ui://raw-html-demo',
        content: {
            type: 'rawHtml',
            htmlString: flightDataHtml
        },
        encoding: 'text',
      });
      return {
        content: [uiResource]
      };
    });

    server.registerTool('getFlightsAsExternalUrl', {
      title: 'Search Flights',
      description: 'Search for available flights between two cities on a specific date. Returns flight details including prices and times.  Returns the results as a Lightning Out component',
      inputSchema: getFlightRequestSchemaAsZod()
    }, async () => {
      // Create the UI resource to be returned to the client
      // This is the only MCP-UI specific code in this example
      const uiResource = createUIResource({
        uri: 'ui://external-url-demo',
        content: {
            type: 'externalUrl',
            iframeUrl: 'https://example.com'
        },
        encoding: 'text',
      });

      return {
        content: [uiResource],
      };
    });

    server.registerTool('getFlightResultsAsUem', {
      title: 'Search Flights',
      description: 'Search for available flights between two cities on a specific date. Returns flight details including prices and times.  Returns the results as UEM that is translated client-side.',
      inputSchema: getFlightRequestSchemaAsZod()
    }, async ({ originCity, destinationCity, dateOfTravel, filters }) => {
      console.log(`Flight search - Origin: ${originCity}, Destination: ${destinationCity}, Date: ${dateOfTravel}, Filters: ${JSON.stringify(filters)}`);
      const flightData = getAvailableFlights(originCity, destinationCity, filters.price, filters.discountPercentage);
      const flightDataHtml = generateFlightResultsHTML(flightData, originCity, destinationCity, dateOfTravel, dateOfTravel);
      // TODO: Create a new UEM UIResource type
      const uiResource = createUIResource({
        uri: 'ui://uem-demo',
        content: {
            type: 'rawHtml',
            htmlString: flightDataHtml
        },
        encoding: 'text',
      });
      return {
        content: [uiResource]
      };
    });

    server.registerTool('getStaticLwc', {
      title: 'Get Static LWC Component',
      description: 'Static LWC Component'
    }, async ({ originCity, destinationCity, dateOfTravel, filters }) => {
      const html = lwcHandler.generateComponentAsRawHtml('x-app', {});
      const uiResource = createUIResource({
        uri: 'ui://lwcComponentAsRawHtml',
        content: {
            type: 'rawHtml',
            htmlString: html
        },
        encoding: 'text',
      });

      return {
        content: [uiResource],
      };
    });

    server.registerTool('getFlightDetailsAndRenderinLWC', {
      title: 'Get LWC Component',
      description: 'LWC Component',
      inputSchema: getFlightRequestSchemaAsZod()
    }, async ({ originCity, destinationCity, dateOfTravel, filters }) => {

      const uiResource = createUIResource({
        uri: 'ui://lwcComponent',
        content: { type: 'externalUrl', iframeUrl: `http://localhost:${port}/lwc/x-flightDetails` },
        encoding: 'text',
      });
      return {
        content: [uiResource],
      };
    });

    server.registerTool('showRemoteDom', {
      title: 'Show Remote DOM',
      description: 'Shows todays weather forecast using remote DOM script.',
      inputSchema: {},
    }, async () => {
      const remoteDomScript = `
        const p = document.createElement('ui-text');
        p.textContent = 'This is a remote DOM element from the server.';
        root.appendChild(p);
      `;
      const uiResource = createUIResource({
        uri: 'ui://remote-dom-demo',
        content: {
          type: 'remoteDom',
          script: remoteDomScript,
          framework: 'react',
        },
        encoding: 'text',
      });

      return {
        content: [uiResource],
      };
    });

    server.registerTool('showFlightSearchForm', {
      title: 'Show Flight Search Form',
      description: 'Displays an interactive form to search for flights with tool selection.',
      inputSchema: {},
    }, async () => {
        console.log(`Running Flight Search form tool to show User a rich UI for flight search `);

        const formHtml = getFlightSearchFormHtml();

      const uiResource = createUIResource({
        uri: 'ui://flight-search-form',
        content: {
          type: 'rawHtml',
          htmlString: formHtml
        },
        encoding: 'text',
      });

      return {
        content: [uiResource],
      };
    });

    server.registerTool('addressManager', {
      title: 'Address Manager',
      description: 'Self-contained address manager that allows entering and displaying address information in one UI.',
      inputSchema: {},
    }, async () => {
      console.log('Running Address Manager - self-contained form and display');

      const html = getAddressSelfContainedHtml();

      const uiResource = createUIResource({
        uri: 'ui://address-manager',
        content: {
          type: 'rawHtml',
          htmlString: html
        },
        encoding: 'text',
      });

      return {
        content: [uiResource],
      };
    });

    // Connect the server instance to the transport for this session.
    await server.connect(transport);
  } else {
    return res.status(400).json({
      error: { message: 'Bad Request: No valid session ID provided' },
    });
  }

  // Handle the client's request using the session's transport.
  await transport.handleRequest(req, res, req.body);
});

// A separate, reusable handler for GET and DELETE requests.
const handleSessionRequest = async (req: express.Request, res: express.Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  console.log('sessionId', sessionId);
  if (!sessionId || !transports[sessionId]) {
    return res.status(404).send('Session not found');
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
};

// GET handles the long-lived stream for server-to-client messages.
app.get('/mcp', handleSessionRequest);

// DELETE handles explicit session termination from the client.
app.delete('/mcp', handleSessionRequest);

// Initialize LWC handler
console.log('Initializing LWC handler...');
const lwcHandler = new LwcHandler();

// Dynamic LWC component route: /lwc/<component-name>
app.get('/lwc/:componentName', (req, res) => {
  try {
    const { componentName } = req.params;
    const { value } = req.query;
    let componentData = null;
    
    // Parse component data from query parameter
    if (value) {
      try {
        // If value is a JSON string, parse it
        if (typeof value === 'string') {
          componentData = JSON.parse(value);
        } else {
          componentData = value;
        }
        console.log(`Component data for ${componentName}:`, componentData);
      } catch (parseError) {
        console.error(`Error parsing component data for ${componentName}:`, parseError);
        // Continue without data if parsing fails
      }
    }
    
    const html = lwcHandler.generateComponentHtml(componentName, componentData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error(`Error serving component ${req.params.componentName}:`, error);
    res.status(500).send(error instanceof Error ? error.message : 'Error loading component');
  }
});

// GET endpoint to serve flight details with dynamic data (legacy route)
app.get('/flightDetails', (req, res) => {
  try {
    const { value } = req.query;
    let flightData = null;
    
    // Parse flight data from query parameter
    if (value) {
      try {
        // If value is a JSON string, parse it
        if (typeof value === 'string') {
          flightData = JSON.parse(value);
        } else {
          flightData = value;
        }
        console.log('Flight data from URL:', flightData);
      } catch (parseError) {
        console.error('Error parsing flight data from URL:', parseError);
        // Continue with default data if parsing fails
      }
    }
    
    const html = lwcHandler.generateLwcHtml(flightData);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving flight details:', error);
    res.status(500).send(error instanceof Error ? error.message : 'Error loading flight details');
  }
});

// GET endpoint to serve the LWC component
app.get('/lwc', (req, res) => {
  try {
    const html = lwcHandler.generateLwcHtml();
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Error serving LWC component:', error);
    res.status(500).send(error instanceof Error ? error.message : 'Error loading LWC component');
  }
});

app.listen(port, () => {
  console.log(`TypeScript MCP server listening at http://localhost:${port}`);
});