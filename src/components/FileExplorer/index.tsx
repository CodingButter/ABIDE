import { useEffect, useState } from 'react'
import { invoke } from '@/lib/tauri'
import { useFileStore } from '@/store/fileStore'
import { useEditorStore } from '@/store/editorStore'
import { VirtualFile } from '@/shared/types'
import FileTreeNode from './FileTreeNode'
import { FilePlus, FolderPlus, RefreshCw } from 'lucide-react'
import './fileExplorer.css'

export default function FileExplorer() {
  const { fileTree, loadInitialFiles, createFile, createDirectory } = useFileStore()
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null)
  const [createPath] = useState('/')
  const [newName, setNewName] = useState('')
  
  useEffect(() => {
    loadInitialFiles()
  }, [loadInitialFiles])
  
  const handleCreateFile = async () => {
    if (!newName) return
    
    const path = `${createPath}/${newName}`.replace('//', '/')
    const content = getDefaultContent(newName)
    
    try {
      const fileId = await createFile(path, content)
      
      // Open the new file in editor
      const file = await invoke<VirtualFile>('read_file', { fileId })
      useEditorStore.getState().openFile({
        id: fileId,
        name: newName,
        content: file.content,
        language: file.language,
        isDirty: false
      })
      
      setIsCreating(null)
      setNewName('')
    } catch (error) {
      console.error('Failed to create file:', error)
    }
  }
  
  const handleCreateDirectory = async () => {
    if (!newName) return
    
    const path = `${createPath}/${newName}`.replace('//', '/')
    
    try {
      await createDirectory(path)
      setIsCreating(null)
      setNewName('')
    } catch (error) {
      console.error('Failed to create directory:', error)
    }
  }
  
  const getDefaultContent = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename.replace('.html', '')}</title>
</head>
<body>
  <h1>Hello ABIDE!</h1>
</body>
</html>`
      case 'css':
        return `/* ${filename} */

body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}`
      case 'js':
        return `// ${filename}

function main() {
  console.log('Hello from ABIDE!');
}

main();`
      case 'json':
        return `{
  "name": "${filename.replace('.json', '')}",
  "version": "1.0.0"
}`
      default:
        return ''
    }
  }
  
  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3 className="explorer-title">EXPLORER</h3>
        <div className="explorer-actions">
          <button 
            className="action-btn"
            title="New File"
            onClick={() => setIsCreating('file')}
          >
            <FilePlus size={16} />
          </button>
          <button 
            className="action-btn"
            title="New Folder"
            onClick={() => setIsCreating('folder')}
          >
            <FolderPlus size={16} />
          </button>
          <button 
            className="action-btn"
            title="Refresh"
            onClick={() => loadInitialFiles()}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {isCreating && (
        <div className="create-input-wrapper">
          <input
            type="text"
            className="create-input"
            placeholder={`Enter ${isCreating} name...`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (isCreating === 'file') {
                  handleCreateFile()
                } else {
                  handleCreateDirectory()
                }
              } else if (e.key === 'Escape') {
                setIsCreating(null)
                setNewName('')
              }
            }}
            autoFocus
          />
        </div>
      )}
      
      <div className="file-tree">
        {fileTree.map(node => (
          <FileTreeNode key={node.id} node={node} level={0} />
        ))}
        
        {fileTree.length === 0 && (
          <div className="empty-explorer">
            <p>No files yet</p>
            <p className="text-xs opacity-60">Create a file to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}