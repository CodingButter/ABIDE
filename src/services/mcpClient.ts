export interface McpMessage {
  id: string
  type: 'request' | 'response' | 'notification'
}

export interface McpRequest extends McpMessage {
  type: 'request'
  method: string
  params?: Record<string, unknown>
}

export interface McpResponse extends McpMessage {
  type: 'response'
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

export interface McpNotification extends McpMessage {
  type: 'notification'
  method: string
  params?: Record<string, unknown>
}

// ABIDE-specific MCP tool definitions
export interface AbideToolDefinition {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
}

// Available ABIDE tools for MCP
export const ABIDE_TOOLS: AbideToolDefinition[] = [
  {
    name: 'cursor_move_to',
    description: 'Move cursor to a specific element or position',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for target element' },
        position: { 
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' }
          }
        },
        duration: { type: 'number', description: 'Animation duration in milliseconds' }
      }
    }
  },
  {
    name: 'cursor_click',
    description: 'Click at current cursor position or target element',
    inputSchema: {
      type: 'object',
      properties: {
        selector: { type: 'string', description: 'CSS selector for target element (optional)' },
        position: { 
          type: 'object',
          properties: {
            x: { type: 'number' },
            y: { type: 'number' }
          }
        }
      }
    }
  },
  {
    name: 'cursor_type',
    description: 'Type text at current cursor position or in target input field',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to type' },
        selector: { type: 'string', description: 'CSS selector for input field (optional)' },
        speed: { type: 'number', description: 'Typing speed in characters per minute' }
      },
      required: ['text']
    }
  },
  {
    name: 'file_create',
    description: 'Create a new file in the virtual file system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'File content' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'file_read',
    description: 'Read content from a file',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' }
      },
      required: ['path']
    }
  },
  {
    name: 'file_update',
    description: 'Update content of an existing file',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' },
        content: { type: 'string', description: 'New file content' }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'file_delete',
    description: 'Delete a file from the virtual file system',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' }
      },
      required: ['path']
    }
  },
  {
    name: 'directory_list',
    description: 'List contents of a directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' }
      },
      required: ['path']
    }
  },
  {
    name: 'directory_create',
    description: 'Create a new directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path' }
      },
      required: ['path']
    }
  },
  {
    name: 'editor_open_file',
    description: 'Open a file in the Monaco editor',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path' }
      },
      required: ['path']
    }
  },
  {
    name: 'editor_get_selection',
    description: 'Get current selection in the editor',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'editor_insert_text',
    description: 'Insert text at current cursor position in editor',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to insert' }
      },
      required: ['text']
    }
  },
  {
    name: 'editor_replace_selection',
    description: 'Replace selected text in editor',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Replacement text' }
      },
      required: ['text']
    }
  },
  {
    name: 'animation_typing',
    description: 'Start a typing animation effect',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to animate' },
        speed: { type: 'number', description: 'Animation speed' },
        element: { type: 'string', description: 'Target element selector' }
      },
      required: ['text']
    }
  }
]

class McpClient {
  private ws: WebSocket | null = null
  private messageHandlers: Map<string, (response: McpResponse) => void> = new Map()
  private requestId = 0
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(private url: string = 'ws://localhost:3030/mcp') {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('Connected to MCP server')
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const message: McpMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse MCP message:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('Disconnected from MCP server')
        this.attemptReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('MCP WebSocket error:', error)
        reject(error)
      }
    })
  }

  private handleMessage(message: McpMessage) {
    if (message.type === 'response') {
      const response = message as McpResponse
      const handler = this.messageHandlers.get(response.id)
      if (handler) {
        handler(response)
        this.messageHandlers.delete(response.id)
      }
    } else if (message.type === 'notification') {
      // Handle notifications from server
      console.log('Received notification:', message)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay * this.reconnectAttempts)
    }
  }

  async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('MCP client not connected')
    }

    const request: McpRequest = {
      id: (++this.requestId).toString(),
      type: 'request',
      method,
      params
    }

    return new Promise((resolve, reject) => {
      this.messageHandlers.set(request.id, (response: McpResponse) => {
        if (response.error) {
          reject(new Error(response.error.message))
        } else {
          resolve(response.result)
        }
      })

      this.ws!.send(JSON.stringify(request))

      // Set timeout for request
      setTimeout(() => {
        if (this.messageHandlers.has(request.id)) {
          this.messageHandlers.delete(request.id)
          reject(new Error(`Request timeout: ${method}`))
        }
      }, 30000) // 30 second timeout
    })
  }

  // ABIDE-specific tool methods
  async cursorMoveTo(selector?: string, position?: { x: number; y: number }, duration?: number): Promise<void> {
    await this.sendRequest('cursor_move_to', {
      selector,
      position,
      duration
    })
  }

  async cursorClick(selector?: string, position?: { x: number; y: number }): Promise<void> {
    await this.sendRequest('cursor_click', {
      selector,
      position
    })
  }

  async cursorType(text: string, selector?: string, speed?: number): Promise<void> {
    await this.sendRequest('cursor_type', {
      text,
      selector,
      speed
    })
  }

  async fileCreate(path: string, content: string): Promise<string> {
    return await this.sendRequest('file_create', { path, content }) as string
  }

  async fileRead(path: string): Promise<string> {
    return await this.sendRequest('file_read', { path }) as string
  }

  async fileUpdate(path: string, content: string): Promise<void> {
    await this.sendRequest('file_update', { path, content })
  }

  async fileDelete(path: string): Promise<void> {
    await this.sendRequest('file_delete', { path })
  }

  async directoryList(path: string): Promise<unknown[]> {
    return await this.sendRequest('directory_list', { path }) as unknown[]
  }

  async directoryCreate(path: string): Promise<string> {
    return await this.sendRequest('directory_create', { path }) as string
  }

  async editorOpenFile(path: string): Promise<void> {
    await this.sendRequest('editor_open_file', { path })
  }

  async editorGetSelection(): Promise<unknown> {
    return await this.sendRequest('editor_get_selection')
  }

  async editorInsertText(text: string): Promise<void> {
    await this.sendRequest('editor_insert_text', { text })
  }

  async editorReplaceSelection(text: string): Promise<void> {
    await this.sendRequest('editor_replace_selection', { text })
  }

  async startTypingAnimation(text: string, speed?: number, element?: string): Promise<void> {
    await this.sendRequest('animation_typing', {
      text,
      speed,
      element
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// Singleton instance
export const mcpClient = new McpClient()

export default McpClient