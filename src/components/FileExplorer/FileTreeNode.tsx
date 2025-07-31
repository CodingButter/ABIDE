import { useState } from 'react'
import { invoke } from '@/lib/tauri'
import { useFileStore } from '@/store/fileStore'
import { useEditorStore } from '@/store/editorStore'
import { FileNode, VirtualFile } from '@/shared/types'
import { 
  ChevronRight, 
  Folder, 
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileImage,
  Hash,
  Braces,
  Code,
  Globe,
  Palette
} from 'lucide-react'

interface FileTreeNodeProps {
  node: FileNode
  level: number
}

/**
 * FileTreeNode Component
 * 
 * Renders individual nodes in the file explorer tree structure.
 * Handles both files and directories with expand/collapse functionality.
 * 
 * @param node - The file or directory node to render
 * @param level - Current depth level in the tree (for indentation)
 */
export default function FileTreeNode({ node, level }: FileTreeNodeProps) {
  const { toggleDirectory, expandedDirs, selectFile } = useFileStore()
  const { openFile } = useEditorStore()
  const [isHovered, setIsHovered] = useState(false)
  
  const isExpanded = expandedDirs.has(node.path)
  const indent = level * 16 // 16px per level
  
  /**
   * Handles clicking on a tree node
   * - For directories: toggles expanded state
   * - For files: opens the file in the editor
   */
  const handleClick = async () => {
    if (node.isDirectory) {
      toggleDirectory(node.path)
    } else if (node.fileId) {
      selectFile(node.path)
      
      try {
        // Fetch file content from backend
        const file = await invoke<VirtualFile>('read_file', { fileId: node.fileId })
        
        // Open in editor
        openFile({
          id: node.fileId,
          name: node.name,
          content: file.content,
          language: file.language,
          isDirty: false
        })
      } catch (error) {
        console.error('Failed to open file:', error)
      }
    }
  }
  
  /**
   * Gets the appropriate icon component for the file type
   */
  const getFileIcon = () => {
    if (node.isDirectory) {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
    }
    
    const ext = node.name.split('.').pop()?.toLowerCase()
    
    // File type icons mapping
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileCode size={16} className={`file-icon ${ext}`} />
      case 'json':
        return <FileJson size={16} className="file-icon json" />
      case 'html':
        return <Globe size={16} className="file-icon html" />
      case 'css':
      case 'scss':
      case 'sass':
        return <Palette size={16} className="file-icon css" />
      case 'md':
      case 'mdx':
        return <FileText size={16} className="file-icon md" />
      case 'rs':
        return <Code size={16} className="file-icon rs" />
      case 'toml':
      case 'yaml':
      case 'yml':
        return <Hash size={16} className="file-icon config" />
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <FileImage size={16} className="file-icon image" />
      default:
        return <File size={16} className="file-icon" />
    }
  }
  
  return (
    <>
      <div
        className="file-node"
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Directory expand/collapse chevron */}
        {node.isDirectory && (
          <span className={`chevron ${isExpanded ? 'expanded' : ''}`}>
            <ChevronRight size={12} />
          </span>
        )}
        
        {/* File/folder icon */}
        {getFileIcon()}
        
        {/* File/folder name */}
        <span className="file-name">{node.name}</span>
        
        {/* Hover actions (future feature) */}
        {isHovered && (
          <div className="node-actions">
            {/* Add rename, delete buttons here */}
          </div>
        )}
      </div>
      
      {/* Render children if directory is expanded */}
      {node.isDirectory && isExpanded && node.children && (
        <div className="children">
          {node.children.map((child) => (
            <FileTreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
            />
          ))}
        </div>
      )}
    </>
  )
}