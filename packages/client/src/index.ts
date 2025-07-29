/**
 * @fileoverview ABIDE Client SDK for browser automation
 * @module @abide/client
 */

import WebSocket from 'ws';
import {
  ABIDEClientConfig,
  ABIDEMessage,
  MouseMovePayload,
  MouseClickPayload,
  MouseHoverPayload,
  ElementQueryPayload,
  ElementInfo,
  JavaScriptResult,
} from './types';

export * from './types';

/**
 * ABIDE Client for controlling browser automation
 *
 * @example
 * ```typescript
 * const client = new ABIDEClient({ debug: true });
 * await client.connect();
 *
 * // Move mouse to coordinates
 * await client.moveMouse({ x: 100, y: 200 });
 *
 * // Click an element
 * await client.clickElement('#submit-button');
 *
 * // Execute JavaScript
 * const result = await client.executeJavaScript('return document.title');
 * ```
 */
interface PendingRequest<T = unknown> {
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
}

export class ABIDEClient {
  private ws: WebSocket | null = null;
  private config: Required<ABIDEClientConfig>;
  private messageId = 0;
  private pendingRequests = new Map<string, PendingRequest>();
  private connected = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  /**
   * Creates a new ABIDE client instance
   * @param config - Client configuration options
   */
  constructor(config: ABIDEClientConfig = {}) {
    this.config = {
      serverUrl: config.serverUrl || 'ws://localhost:3001',
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval || 3000,
      debug: config.debug || false,
    };
  }

  /**
   * Internal logging method
   * @private
   */
  private log(...args: unknown[]) {
    if (this.config.debug) {
      console.warn('[ABIDEClient]', ...args);
    }
  }

  /**
   * Connects to the ABIDE WebSocket server
   * @returns Promise that resolves when connected
   * @throws Error if connection fails
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl);

        this.ws.on('open', () => {
          this.log('Connected to ABIDE server');
          this.connected = true;

          // Identify as MCP client
          this.send({
            type: 'identify',
            payload: { type: 'mcp' },
          });

          resolve();
        });

        this.ws.on('message', (data: Buffer) => {
          try {
            const message: ABIDEMessage = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            this.log('Error parsing message:', error);
          }
        });

        this.ws.on('error', (error) => {
          this.log('WebSocket error:', error);
          if (!this.connected) {
            reject(error);
          }
        });

        this.ws.on('close', () => {
          this.log('Disconnected from ABIDE server');
          this.connected = false;

          // Clear pending requests
          this.pendingRequests.forEach(({ reject, timeout }) => {
            clearTimeout(timeout);
            reject(new Error('Connection closed'));
          });
          this.pendingRequests.clear();

          // Auto-reconnect
          if (this.config.autoReconnect && !this.reconnectTimeout) {
            this.reconnectTimeout = setTimeout(() => {
              this.reconnectTimeout = null;
              this.log('Attempting to reconnect...');
              this.connect().catch((err) => {
                this.log('Reconnection failed:', err);
              });
            }, this.config.reconnectInterval);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnects from the ABIDE server
   */
  disconnect(): void {
    this.config.autoReconnect = false;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Sends a message to the server
   * @private
   * @throws Error if not connected
   */
  private send(message: ABIDEMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to ABIDE server');
    }
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Handles incoming messages from the server
   * @private
   */
  private handleMessage(message: ABIDEMessage): void {
    if (message.type === 'result' && message.id) {
      const pending = this.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(message.payload);
        this.pendingRequests.delete(message.id);
      }
    }
  }

  /**
   * Sends a request and waits for response
   * @private
   * @param type - Message type
   * @param payload - Message payload
   * @param timeout - Response timeout in milliseconds
   * @returns Promise with the response
   */
  private sendRequest<T = unknown>(type: string, payload: unknown, timeout = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = `req_${++this.messageId}`;

      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, timeout);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout: timeoutHandle,
      });

      this.send({ type, payload, id });
    });
  }

  /**
   * Moves the virtual mouse cursor to specified coordinates
   * @param payload - Mouse movement parameters
   */
  async moveMouse(payload: MouseMovePayload): Promise<void> {
    this.send({
      type: 'mouse:move',
      payload,
    });
  }

  /**
   * Clicks at the specified coordinates
   * @param payload - Click parameters
   */
  async clickMouse(payload: MouseClickPayload): Promise<void> {
    this.send({
      type: 'mouse:click',
      payload,
    });
  }

  /**
   * Hovers over an element
   * @param payload - Hover parameters (selector, id, or coordinates)
   */
  async hoverElement(payload: MouseHoverPayload): Promise<void> {
    this.send({
      type: 'mouse:hover',
      payload,
    });
  }

  /**
   * Queries information about an element
   * @param payload - Query parameters
   * @returns Element information
   */
  async queryElement(payload: ElementQueryPayload): Promise<ElementInfo> {
    return this.sendRequest<ElementInfo>('element:query', payload);
  }

  /**
   * Gets element information by ID
   * @param id - Element ID
   * @returns Element information
   */
  async getElementById(id: string): Promise<ElementInfo> {
    return this.queryElement({ id, query: 'info' });
  }

  /**
   * Gets element information by CSS selector
   * @param selector - CSS selector
   * @returns Element information
   */
  async querySelector(selector: string): Promise<ElementInfo> {
    return this.queryElement({ selector, query: 'info' });
  }

  /**
   * Executes JavaScript code in the browser context
   * @param code - JavaScript code to execute
   * @returns Execution result
   */
  async executeJavaScript(code: string): Promise<JavaScriptResult> {
    return this.sendRequest<JavaScriptResult>('js:execute', { code });
  }

  /**
   * Waits for an element to appear on the page
   * @param selector - CSS selector
   * @param timeout - Maximum wait time in milliseconds
   * @returns Element information
   * @throws Error if timeout exceeded
   */
  async waitForElement(selector: string, timeout = 10000): Promise<ElementInfo> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = await this.querySelector(selector);
      if (element.found) {
        return element;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Element not found: ${selector}`);
  }

  /**
   * Clicks on an element by selector
   * @param selector - CSS selector
   * @throws Error if element not found
   */
  async clickElement(selector: string): Promise<void> {
    const element = await this.querySelector(selector);
    if (!element.found || !element.boundingBox) {
      throw new Error(`Element not found: ${selector}`);
    }

    const x = element.boundingBox.x + element.boundingBox.width / 2;
    const y = element.boundingBox.y + element.boundingBox.height / 2;

    await this.clickMouse({ x, y });
  }

  /**
   * Types text into the currently focused input element
   * @param text - Text to type
   * @throws Error if no input element is focused
   */
  async typeText(text: string): Promise<void> {
    // This would need to be implemented with keyboard events
    // For now, we can use JavaScript to set input values
    const code = `
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        activeElement.value = '${text.replace(/'/g, "\\'")}';
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        activeElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    `;

    const result = await this.executeJavaScript(code);
    if (!result.success || !result.result) {
      throw new Error('No active input element found');
    }
  }

  /**
   * Navigates to a URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    const code = `window.location.href = '${url.replace(/'/g, "\\'")}';`;
    await this.executeJavaScript(code);
  }

  /**
   * Gets the current page title
   * @returns Page title
   * @throws Error if execution fails
   */
  async getPageTitle(): Promise<string> {
    const result = await this.executeJavaScript('return document.title;');
    if (!result.success) {
      throw new Error('Failed to get page title');
    }
    return result.result as string;
  }

  /**
   * Gets information about all visible elements on the page
   * @returns Array of element information (limited to 100 elements)
   * @throws Error if execution fails
   */
  async getAllElements(): Promise<
    Array<{
      tagName: string;
      id: string;
      className: string;
      innerText?: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>
  > {
    const code = `
      const elements = Array.from(document.querySelectorAll('*')).slice(0, 100);
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          innerText: el.innerText?.substring(0, 50),
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        };
      }).filter(el => el.boundingBox.width > 0 && el.boundingBox.height > 0);
    `;

    const result = await this.executeJavaScript(code);
    if (!result.success) {
      throw new Error('Failed to get elements');
    }
    return result.result as Array<{
      tagName: string;
      id: string;
      className: string;
      innerText?: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
  }
}
