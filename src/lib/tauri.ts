/**
 * Tauri API wrapper
 * 
 * This file provides a mock implementation of Tauri API functions
 * for development when not running in a Tauri context.
 * In production, these will be replaced by actual Tauri APIs.
 */

// Check if we're running in Tauri context
const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined

/**
 * Mock invoke function for development
 * Returns mock data based on the command
 */
export async function invoke<T = unknown>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  // If running in Tauri, use the real API
  if (isTauri) {
    const tauriApi = await import('@tauri-apps/api/core')
    return tauriApi.invoke(cmd, args) as Promise<T>
  }
  
  // Mock responses for development
  // eslint-disable-next-line no-console
  console.log(`[Mock] Invoking command: ${cmd}`, args)
  
  switch (cmd) {
    case 'list_directory':
      return [
        {
          id: '1',
          name: 'src',
          path: '/src',
          isDirectory: true,
          children: [
            {
              id: '2',
              name: 'main.js',
              path: '/src/main.js',
              isDirectory: false,
              fileId: 'file-1'
            }
          ]
        },
        {
          id: '3',
          name: 'README.md',
          path: '/README.md',
          isDirectory: false,
          fileId: 'file-2'
        }
      ] as T
      
    case 'read_file':
      return {
        id: args?.fileId || 'file-1',
        name: 'main.js',
        content: '// Welcome to ABIDE!\nconsole.log("Hello, World!");',
        language: 'javascript',
        createdAt: new Date(),
        modifiedAt: new Date()
      } as T
      
    case 'create_file':
      return `file-${Date.now()}` as T
      
    case 'write_file':
    case 'delete_file':
    case 'create_directory':
      return undefined as T
      
    default:
      throw new Error(`Unknown command: ${cmd}`)
  }
}

// Re-export window type with Tauri extension
declare global {
  interface Window {
    __TAURI__?: {
      invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>
    }
  }
}