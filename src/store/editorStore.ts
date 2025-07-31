import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface EditorFile {
  id: string
  name: string
  content: string
  language?: string
  isDirty: boolean
}

interface EditorState {
  openFiles: EditorFile[]
  currentFileId: string | null
  currentFile: EditorFile | null
  cursorPosition: { line: number; column: number }
  
  // Actions
  openFile: (file: EditorFile) => void
  closeFile: (fileId: string) => void
  switchFile: (fileId: string) => void
  updateFileContent: (fileId: string, content: string) => void
  setCursorPosition: (line: number, column: number) => void
  saveFile: (fileId: string) => Promise<void>
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      openFiles: [],
      currentFileId: null,
      currentFile: null,
      cursorPosition: { line: 1, column: 1 },
      
      openFile: (file) => {
        set((state) => {
          const existingFile = state.openFiles.find(f => f.id === file.id)
          if (existingFile) {
            return {
              currentFileId: file.id,
              currentFile: existingFile,
            }
          }
          
          return {
            openFiles: [...state.openFiles, file],
            currentFileId: file.id,
            currentFile: file,
          }
        })
      },
      
      closeFile: (fileId) => {
        set((state) => {
          const newOpenFiles = state.openFiles.filter(f => f.id !== fileId)
          let newCurrentFile = state.currentFile
          let newCurrentFileId = state.currentFileId
          
          if (state.currentFileId === fileId) {
            newCurrentFile = newOpenFiles[0] || null
            newCurrentFileId = newCurrentFile?.id || null
          }
          
          return {
            openFiles: newOpenFiles,
            currentFile: newCurrentFile,
            currentFileId: newCurrentFileId,
          }
        })
      },
      
      switchFile: (fileId) => {
        set((state) => {
          const file = state.openFiles.find(f => f.id === fileId)
          return {
            currentFileId: fileId,
            currentFile: file || null,
          }
        })
      },
      
      updateFileContent: (fileId, content) => {
        set((state) => {
          const newOpenFiles = state.openFiles.map(file => 
            file.id === fileId 
              ? { ...file, content, isDirty: true }
              : file
          )
          
          const currentFile = state.currentFile?.id === fileId
            ? { ...state.currentFile, content, isDirty: true }
            : state.currentFile
          
          return {
            openFiles: newOpenFiles,
            currentFile,
          }
        })
      },
      
      setCursorPosition: (line, column) => {
        set({ cursorPosition: { line, column } })
      },
      
      saveFile: async (fileId) => {
        const file = get().openFiles.find(f => f.id === fileId)
        if (!file) return
        
        // Call Tauri command to save file
        const { invoke } = await import('@/lib/tauri')
        await invoke('write_file', { fileId, content: file.content })
        
        set((state) => ({
          openFiles: state.openFiles.map(f => 
            f.id === fileId ? { ...f, isDirty: false } : f
          ),
          currentFile: state.currentFile?.id === fileId
            ? { ...state.currentFile, isDirty: false }
            : state.currentFile,
        }))
      },
    }),
    {
      name: 'editor-store',
    }
  )
)