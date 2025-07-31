import { useState, useEffect } from 'react'
import FileExplorer from './components/FileExplorer'
import Editor from './components/Editor'
import PreviewPanel from './components/PreviewPanel'
import AnimationDemo from './pages/AnimationDemo'
import { useEditorStore } from './store/editorStore'
import { useFileStore } from './store/fileStore'
import { FilePlus, FolderOpen, Save, Sparkles } from 'lucide-react'
import abideIcon from './assets/abide-icon.png'
import './app.css'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showAnimationDemo, setShowAnimationDemo] = useState(false)
  const { currentFile, openFiles } = useEditorStore()
  const { loadInitialFiles } = useFileStore()

  useEffect(() => {
    // Load initial file structure
    loadInitialFiles().then(() => {
      setIsLoading(false)
    })
  }, [loadInitialFiles])

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Initializing ABIDE...</p>
      </div>
    )
  }

  if (showAnimationDemo) {
    return <AnimationDemo onBack={() => setShowAnimationDemo(false)} />
  }
  
  // Add cursor control demo route later when needed

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <img src={abideIcon} alt="ABIDE" width={24} height={24} />
          ABIDE
        </div>
        <div className="header-controls">
          <button className="header-btn" title="New File">
            <FilePlus size={16} />
            <span>New</span>
          </button>
          <button className="header-btn" title="Open Folder">
            <FolderOpen size={16} />
            <span>Open</span>
          </button>
          <button className="header-btn" title="Save File">
            <Save size={16} />
            <span>Save</span>
          </button>
          <button 
            className="header-btn accent" 
            title="Animation Demo"
            onClick={() => setShowAnimationDemo(!showAnimationDemo)}
          >
            <Sparkles size={16} />
            <span>Animations</span>
          </button>
        </div>
      </header>
      
      <div className="app-body">
        <aside className="sidebar">
          <FileExplorer />
        </aside>
        
        <main className="main-content">
          <div className="editor-container">
            <Editor />
          </div>
          
          <div className="preview-container">
            <PreviewPanel />
          </div>
        </main>
      </div>
      
      <footer className="app-footer">
        <div className="status-bar">
          <span className="status-item">
            {currentFile ? `Editing: ${currentFile.name}` : 'No file open'}
          </span>
          <span className="status-item">
            {openFiles.length} files open
          </span>
          <span className="status-item">Ready</span>
        </div>
      </footer>
    </div>
  )
}

export default App