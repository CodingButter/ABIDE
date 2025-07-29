/**
 * @fileoverview Type definitions for ABIDE client-server communication
 * @module @abide/client/types
 */

/**
 * Payload for mouse movement commands
 */
export interface MouseMovePayload {
  /** X coordinate on the screen */
  x: number;
  /** Y coordinate on the screen */
  y: number;
  /** Optional duration for smooth movement animation in milliseconds */
  duration?: number;
}

/**
 * Payload for mouse click commands
 */
export interface MouseClickPayload {
  /** X coordinate for the click */
  x: number;
  /** Y coordinate for the click */
  y: number;
  /** Mouse button to use (defaults to 'left') */
  button?: 'left' | 'right';
}

/**
 * Payload for hovering over elements
 * Can target by CSS selector, element ID, or coordinates
 */
export interface MouseHoverPayload {
  /** CSS selector to find the element */
  selector?: string;
  /** Element ID to target */
  id?: string;
  /** X coordinate to hover at */
  x?: number;
  /** Y coordinate to hover at */
  y?: number;
}

/**
 * Payload for querying element information
 */
export interface ElementQueryPayload {
  /** CSS selector to find the element */
  selector?: string;
  /** Element ID to query */
  id?: string;
  /** Type of query to perform */
  query: string;
}

/**
 * Detailed information about a DOM element
 */
export interface ElementInfo {
  /** Whether the element was found */
  found: boolean;
  /** HTML tag name */
  tagName?: string;
  /** Element ID attribute */
  id?: string;
  /** Element class attribute */
  className?: string;
  /** Text content of the element (truncated) */
  innerText?: string;
  /** Bounding box coordinates and dimensions */
  boundingBox?: {
    /** Left position relative to viewport */
    x: number;
    /** Top position relative to viewport */
    y: number;
    /** Element width */
    width: number;
    /** Element height */
    height: number;
    /** Top edge position */
    top: number;
    /** Right edge position */
    right: number;
    /** Bottom edge position */
    bottom: number;
    /** Left edge position */
    left: number;
  };
  /** Computed styles for visibility checks */
  styles?: {
    /** CSS display property */
    display: string;
    /** CSS position property */
    position: string;
    /** CSS visibility property */
    visibility: string;
    /** CSS opacity property */
    opacity: string;
  };
  /** All element attributes as key-value pairs */
  attributes?: Record<string, string>;
}

/**
 * Payload for executing JavaScript code in the browser context
 */
export interface JavaScriptExecutePayload {
  /** JavaScript code to execute */
  code: string;
}

/**
 * Result from JavaScript code execution
 */
export interface JavaScriptResult {
  /** Whether the execution succeeded */
  success: boolean;
  /** Return value from the executed code */
  result?: unknown;
  /** Error message if execution failed */
  error?: string;
}

/**
 * WebSocket message structure for client-server communication
 */
export interface ABIDEMessage {
  /** Message type identifier */
  type: string;
  /** Message payload data */
  payload: unknown;
  /** Optional message ID for request-response correlation */
  id?: string;
}

/**
 * Configuration options for ABIDE client
 */
export interface ABIDEClientConfig {
  /** WebSocket server URL (defaults to ws://localhost:3001) */
  serverUrl?: string;
  /** Whether to automatically reconnect on disconnect (defaults to true) */
  autoReconnect?: boolean;
  /** Interval between reconnection attempts in milliseconds (defaults to 3000) */
  reconnectInterval?: number;
  /** Enable debug logging (defaults to false) */
  debug?: boolean;
}
