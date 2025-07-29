/**
 * @fileoverview ABIDE WebSocket server for browser automation
 * @module @abide/server
 */

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import http from 'http';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

/**
 * Represents a connected WebSocket client
 */
interface Client {
  /** WebSocket connection instance */
  ws: WebSocket;
  /** Unique client identifier */
  id: string;
  /** Type of client (browser, MCP server, or unknown) */
  type: 'browser' | 'mcp' | 'unknown';
}

const clients = new Map<string, Client>();

/**
 * WebSocket message structure
 */
interface Message {
  /** Message type identifier */
  type: string;
  /** Message payload data */
  payload: unknown;
  /** Optional message ID for request-response correlation */
  id?: string;
}

/**
 * Handle new WebSocket connections
 */
wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(7);
  const client: Client = { ws, id: clientId, type: 'unknown' };
  clients.set(clientId, client);

  console.warn(`Client connected: ${clientId}`);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: 'connected',
      payload: { clientId },
    })
  );

  ws.on('message', (data: Buffer) => {
    try {
      const message: Message = JSON.parse(data.toString());
      console.warn(`Received from ${clientId}:`, message);

      // Handle client identification
      if (message.type === 'identify') {
        const payload = message.payload as { type: 'browser' | 'mcp' | 'unknown' };
        client.type = payload.type;
        console.warn(`Client ${clientId} identified as ${client.type}`);
        return;
      }

      // Route messages based on type
      switch (message.type) {
        case 'mouse:move':
        case 'mouse:click':
        case 'mouse:hover':
        case 'element:query':
        case 'js:execute':
          // Forward to browser clients
          broadcastToBrowsers(message, clientId);
          break;

        case 'result':
          // Forward results back to MCP clients
          broadcastToMCP(message, clientId);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.warn(`Client disconnected: ${clientId}`);
    clients.delete(clientId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
  });
});

/**
 * Broadcasts a message to all connected browser clients
 * @param message - Message to broadcast
 * @param excludeId - Optional client ID to exclude from broadcast
 */
function broadcastToBrowsers(message: Message, excludeId?: string) {
  clients.forEach((client, id) => {
    if (client.type === 'browser' && id !== excludeId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

/**
 * Broadcasts a message to all connected MCP clients
 * @param message - Message to broadcast
 * @param excludeId - Optional client ID to exclude from broadcast
 */
function broadcastToMCP(message: Message, excludeId?: string) {
  clients.forEach((client, id) => {
    if (client.type === 'mcp' && id !== excludeId && client.ws.readyState === 1) {
      client.ws.send(JSON.stringify(message));
    }
  });
}

/**
 * Health check endpoint
 * Returns server status and connected client information
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    clients: Array.from(clients.values()).map((c) => ({
      id: c.id,
      type: c.type,
    })),
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.warn(`ABIDE Server running on port ${PORT}`);
  console.warn(`WebSocket server ready for connections`);
});
