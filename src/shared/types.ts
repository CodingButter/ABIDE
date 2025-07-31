/**
 * Shared TypeScript types and interfaces for ABIDE
 * 
 * This file contains all the common type definitions used across
 * the application to ensure type safety and consistency.
 */

/**
 * Represents a file node in the virtual file system
 */
export interface FileNode {
  id: string
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  fileId?: string // Reference to VirtualFile if not a directory
}

/**
 * Represents a virtual file with content
 */
export interface VirtualFile {
  id: string
  name: string
  content: string
  language?: string
  createdAt: Date
  modifiedAt: Date
}

/**
 * Editor file representation with dirty state tracking
 */
export interface EditorFile {
  id: string
  name: string
  content: string
  language?: string
  isDirty: boolean
}

/**
 * Cursor position in the editor
 */
export interface CursorPosition {
  line: number
  column: number
}

/**
 * Animation configuration for typing simulation
 */
export interface AnimationConfig {
  typingSpeed: number // characters per second
  typingVariation: number // randomness factor (0.0-1.0)
  cursorBlinkRate: number // milliseconds
  smoothScrolling: boolean
  enableAnimations: boolean
}

/**
 * MCP WebSocket message types
 */
export type McpMessageType = 
  | 'file.create'
  | 'file.read'
  | 'file.update'
  | 'file.delete'
  | 'directory.create'
  | 'directory.list'
  | 'animation.type'
  | 'animation.cursor'
  | 'settings.get'
  | 'settings.update'

/**
 * MCP WebSocket response
 */
export interface McpResponse<T = unknown> {
  type: 'success' | 'error' | 'event'
  data?: T
  message?: string
  event?: string
}