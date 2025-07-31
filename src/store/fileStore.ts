import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { invoke } from '@/lib/tauri'

export interface FileNode {
  id: string
  name: string
  path: string
  isDirectory: boolean
  children?: FileNode[]
  fileId?: string
}

interface FileState {
  fileTree: FileNode[]
  selectedPath: string | null
  expandedDirs: Set<string>
  
  // Actions
  loadInitialFiles: () => Promise<void>
  createFile: (path: string, content: string) => Promise<string>
  deleteFile: (fileId: string) => Promise<void>
  createDirectory: (path: string) => Promise<void>
  toggleDirectory: (path: string) => void
  selectFile: (path: string) => void
  refreshFileTree: () => Promise<void>
}

export const useFileStore = create<FileState>()(
  devtools(
    (set, get) => ({
      fileTree: [],
      selectedPath: null,
      expandedDirs: new Set(['/']),
      
      loadInitialFiles: async () => {
        try {
          const nodes = await invoke<FileNode[]>('list_directory', { path: '/' })
          set({ fileTree: nodes })
        } catch (error) {
          console.error('Failed to load files:', error)
        }
      },
      
      createFile: async (path, content) => {
        try {
          const fileId = await invoke<string>('create_file', { path, content })
          await get().refreshFileTree()
          return fileId
        } catch (error) {
          console.error('Failed to create file:', error)
          throw error
        }
      },
      
      deleteFile: async (fileId) => {
        try {
          await invoke('delete_file', { fileId })
          await get().refreshFileTree()
        } catch (error) {
          console.error('Failed to delete file:', error)
          throw error
        }
      },
      
      createDirectory: async (path) => {
        try {
          await invoke('create_directory', { path })
          await get().refreshFileTree()
        } catch (error) {
          console.error('Failed to create directory:', error)
          throw error
        }
      },
      
      toggleDirectory: (path) => {
        set((state) => {
          const newExpandedDirs = new Set(state.expandedDirs)
          if (newExpandedDirs.has(path)) {
            newExpandedDirs.delete(path)
          } else {
            newExpandedDirs.add(path)
          }
          return { expandedDirs: newExpandedDirs }
        })
      },
      
      selectFile: (path) => {
        set({ selectedPath: path })
      },
      
      refreshFileTree: async () => {
        const nodes = await invoke<FileNode[]>('list_directory', { path: '/' })
        set({ fileTree: nodes })
      },
    }),
    {
      name: 'file-store',
    }
  )
)