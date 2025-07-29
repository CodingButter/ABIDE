/**
 * @fileoverview Browser automation controller for ABIDE
 * @module BrowserController
 */

/**
 * Controls browser automation features including virtual cursor,
 * element interaction, and JavaScript execution
 */
export class BrowserController {
  private cursor: HTMLDivElement;
  private ws: WebSocket | null = null;

  /**
   * Initializes the browser controller
   */
  constructor() {
    // Create virtual cursor
    this.cursor = this.createCursor();
    this.connectWebSocket();
  }

  /**
   * Creates a visual cursor element for tracking mouse movements
   * @private
   * @returns The cursor DOM element
   */
  private createCursor(): HTMLDivElement {
    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(59, 130, 246, 0.4) 50%, transparent 70%);
      border: 2px solid #3b82f6;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: all 0.1s ease-out;
      display: none;
    `;
    document.body.appendChild(cursor);
    return cursor;
  }

  /**
   * Establishes WebSocket connection to the ABIDE server
   * @private
   */
  private connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:3001');

    this.ws.onopen = () => {
      console.warn('Connected to ABIDE server');
      this.ws?.send(
        JSON.stringify({
          type: 'identify',
          payload: { type: 'browser' },
        })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.warn('Disconnected from ABIDE server');
      // Reconnect after 3 seconds
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  /**
   * Routes incoming WebSocket messages to appropriate handlers
   * @private
   * @param message - Incoming message from server
   */
  private handleMessage(message: { type: string; payload: unknown; id?: string }) {
    console.warn('Handling message:', message);

    switch (message.type) {
      case 'mouse:move':
        this.moveMouse(message.payload as { x: number; y: number; duration?: number });
        break;
      case 'mouse:click':
        this.clickMouse(message.payload as { x: number; y: number; button?: 'left' | 'right' });
        break;
      case 'mouse:hover':
        this.hoverElement(
          message.payload as { selector?: string; id?: string; x?: number; y?: number }
        );
        break;
      case 'element:query':
        this.queryElement(
          message.payload as { selector?: string; id?: string; query: string },
          message.id
        );
        break;
      case 'js:execute':
        this.executeJavaScript(message.payload as { code: string }, message.id);
        break;
    }
  }

  /**
   * Moves the virtual cursor to specified coordinates
   * @private
   * @param payload - Movement parameters
   */
  private moveMouse(payload: { x: number; y: number; duration?: number }) {
    this.cursor.style.display = 'block';

    if (payload.duration) {
      this.cursor.style.transition = `all ${payload.duration}ms ease-out`;
    }

    this.cursor.style.left = `${payload.x}px`;
    this.cursor.style.top = `${payload.y}px`;
  }

  /**
   * Simulates a mouse click at specified coordinates
   * @private
   * @param payload - Click parameters
   */
  private clickMouse(payload: { x: number; y: number; button?: 'left' | 'right' }) {
    // Move cursor to position
    this.moveMouse({ x: payload.x, y: payload.y });

    // Animate click
    this.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    setTimeout(() => {
      this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);

    // Find element at position and click it
    const element = document.elementFromPoint(payload.x, payload.y) as HTMLElement;
    if (element) {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: payload.x,
        clientY: payload.y,
        button: payload.button === 'right' ? 2 : 0,
      });
      element.dispatchEvent(clickEvent);
    }
  }

  /**
   * Hovers over an element and triggers mouse events
   * @private
   * @param payload - Element targeting parameters
   */
  private hoverElement(payload: { selector?: string; id?: string; x?: number; y?: number }) {
    let element: Element | null = null;

    if (payload.selector) {
      element = document.querySelector(payload.selector);
    } else if (payload.id) {
      element = document.getElementById(payload.id);
    } else if (payload.x !== undefined && payload.y !== undefined) {
      element = document.elementFromPoint(payload.x, payload.y);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      this.moveMouse({ x, y, duration: 300 });

      // Dispatch hover events
      const mouseEnter = new MouseEvent('mouseenter', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(mouseEnter);

      const mouseOver = new MouseEvent('mouseover', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(mouseOver);
    }
  }

  /**
   * Queries element information and sends results back to server
   * @private
   * @param payload - Query parameters
   * @param messageId - Message ID for response correlation
   */
  private queryElement(
    payload: { selector?: string; id?: string; query: string },
    messageId?: string
  ) {
    let element: Element | null = null;

    if (payload.selector) {
      element = document.querySelector(payload.selector);
    } else if (payload.id) {
      element = document.getElementById(payload.id);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const computed = window.getComputedStyle(element);

      const result = {
        found: true,
        tagName: element.tagName,
        id: element.id,
        className: element.className,
        innerText: (element as HTMLElement).innerText?.substring(0, 100),
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
        },
        styles: {
          display: computed.display,
          position: computed.position,
          visibility: computed.visibility,
          opacity: computed.opacity,
        },
        attributes: Array.from(element.attributes).reduce(
          (acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          },
          {} as Record<string, string>
        ),
      };

      this.sendResult(result, messageId);
    } else {
      this.sendResult({ found: false }, messageId);
    }
  }

  /**
   * Executes JavaScript code in the browser context
   * @private
   * @param payload - Code to execute
   * @param messageId - Message ID for response correlation
   */
  private executeJavaScript(payload: { code: string }, messageId?: string) {
    try {
      // Create a function to safely execute the code
      const func = new Function('document', 'window', payload.code);
      const result = func(document, window);

      this.sendResult({ success: true, result }, messageId);
    } catch (error) {
      this.sendResult(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
        },
        messageId
      );
    }
  }

  /**
   * Sends execution results back to the server
   * @private
   * @param result - Result data to send
   * @param messageId - Original message ID
   */
  private sendResult(result: unknown, messageId?: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'result',
          payload: result,
          id: messageId,
        })
      );
    }
  }

  /**
   * Gets information about all visible elements on the page
   * @returns Array of element information
   */
  public getAllElements(): Array<{
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
  }> {
    const elements = document.querySelectorAll('*');
    const result: Array<{
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
    }> = [];

    elements.forEach((el, index) => {
      if (index > 100) return; // Limit for performance

      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        result.push({
          tagName: el.tagName,
          id: el.id,
          className: el.className,
          innerText: (el as HTMLElement).innerText?.substring(0, 50),
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          },
        });
      }
    });

    return result;
  }
}
