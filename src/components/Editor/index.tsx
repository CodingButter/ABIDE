import { useRef, useEffect } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { useEditorStore } from '@/store/editorStore'
import { usePreviewStore } from '@/store/previewStore'
import type * as monaco from 'monaco-editor'
import { X, FileText } from 'lucide-react'
import './editor.css'

export default function CodeEditor() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<Monaco | null>(null)
  
  const { 
    currentFile, 
    updateFileContent, 
    setCursorPosition,
    saveFile 
  } = useEditorStore()
  
  const { setPreviewContent, isAutoRefresh } = usePreviewStore()
  
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monacoInstance
    
    // Configure Monaco with ABIDE theme
    monacoInstance.editor.defineTheme('abide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff7b72' },
        { token: 'string', foreground: 'a5d6ff' },
        { token: 'number', foreground: 'ffa657' },
        { token: 'variable', foreground: '79c0ff' },
        { token: 'function', foreground: 'd2a8ff' },
        { token: 'type', foreground: 'ffa657' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b22',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#264f7850',
        'editorLineNumber.foreground': '#8b949e',
        'editorLineNumber.activeForeground': '#e6edf3',
        'editorCursor.foreground': '#2f81f7',
        'editor.findMatchBackground': '#ffa65750',
        'editor.findMatchHighlightBackground': '#ffa65730',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'editorBracketMatch.background': '#3fb95050',
        'editorBracketMatch.border': '#3fb950',
        'scrollbar.shadow': '#00000000',
        'scrollbarSlider.background': '#30363d50',
        'scrollbarSlider.hoverBackground': '#30363d80',
        'scrollbarSlider.activeBackground': '#30363d',
      }
    })
    
    monacoInstance.editor.setTheme('abide-dark')
    
    // Set up keybindings
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      if (currentFile) {
        saveFile(currentFile.id)
      }
    })
    
    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.lineNumber, e.position.column)
    })
  }
  
  const handleEditorChange = (value: string | undefined) => {
    if (!currentFile || value === undefined) return
    
    updateFileContent(currentFile.id, value)
    
    // Update preview if auto-refresh is enabled
    if (isAutoRefresh) {
      const fileExt = currentFile.name.split('.').pop()?.toLowerCase()
      
      switch (fileExt) {
        case 'html':
          setPreviewContent(value, 'html')
          break
        case 'md':
        case 'markdown':
          setPreviewContent(value, 'markdown')
          break
        case 'json':
          setPreviewContent(value, 'json')
          break
        default:
          setPreviewContent(value, 'none')
      }
    }
  }
  
  useEffect(() => {
    // Apply custom cursor animations when needed
    if (editorRef.current) {
      // This is where we'll hook up typing animations from MCP
    }
  }, [currentFile])
  
  if (!currentFile) {
    return (
      <div className="editor-empty">
        <div className="empty-state">
          <FileText className="empty-icon" />
          <h3>No file open</h3>
          <p>Select a file from the explorer to start editing</p>
          <div className="keyboard-shortcuts">
            <div className="shortcut">
              <span>New File</span>
              <div className="shortcut-key">
                <span className="key">Ctrl</span>
                <span className="key">N</span>
              </div>
            </div>
            <div className="shortcut">
              <span>Open File</span>
              <div className="shortcut-key">
                <span className="key">Ctrl</span>
                <span className="key">O</span>
              </div>
            </div>
            <div className="shortcut">
              <span>Save File</span>
              <div className="shortcut-key">
                <span className="key">Ctrl</span>
                <span className="key">S</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="editor-wrapper">
      <div className="editor-tabs">
        {useEditorStore.getState().openFiles.map(file => (
          <div 
            key={file.id}
            className={`editor-tab ${file.id === currentFile.id ? 'active' : ''} ${file.isDirty ? 'dirty' : ''}`}
            onClick={() => useEditorStore.getState().switchFile(file.id)}
          >
            <span className="tab-name">
              <span className="dirty-indicator">•</span>
              {file.name}
            </span>
            <button 
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                useEditorStore.getState().closeFile(file.id)
              }}
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="editor-content">
        <Editor
          height="100%"
          language={currentFile.language || 'javascript'}
          value={currentFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontFamily: "'Cascadia Code', 'Consolas', monospace",
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'off',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  )
}