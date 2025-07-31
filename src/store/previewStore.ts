import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface PreviewState {
  isPreviewEnabled: boolean
  previewContent: string
  previewType: 'html' | 'markdown' | 'json' | 'none'
  isAutoRefresh: boolean
  refreshInterval: number
  
  // Actions
  setPreviewContent: (content: string, type: PreviewState['previewType']) => void
  togglePreview: () => void
  toggleAutoRefresh: () => void
  setRefreshInterval: (interval: number) => void
  refreshPreview: () => void
}

export const usePreviewStore = create<PreviewState>()(
  devtools(
    (set) => ({
      isPreviewEnabled: true,
      previewContent: '',
      previewType: 'none',
      isAutoRefresh: true,
      refreshInterval: 1000,
      
      setPreviewContent: (content, type) => {
        set({ previewContent: content, previewType: type })
      },
      
      togglePreview: () => {
        set((state) => ({ isPreviewEnabled: !state.isPreviewEnabled }))
      },
      
      toggleAutoRefresh: () => {
        set((state) => ({ isAutoRefresh: !state.isAutoRefresh }))
      },
      
      setRefreshInterval: (interval) => {
        set({ refreshInterval: interval })
      },
      
      refreshPreview: () => {
        // This will be called by components to trigger preview updates
        // The actual refresh logic will be in the preview component
      },
    }),
    {
      name: 'preview-store',
    }
  )
)