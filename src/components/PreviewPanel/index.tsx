import { useEffect, useRef } from 'react'
import { usePreviewStore } from '@/store/previewStore'
import { RefreshCw, X, Eye, EyeOff } from 'lucide-react'
import './previewPanel.css'

/**
 * PreviewPanel Component
 * 
 * Provides live preview functionality for HTML, Markdown, and JSON files.
 * Automatically updates when file content changes if auto-refresh is enabled.
 * 
 * Features:
 * - HTML rendering in sandboxed iframe
 * - Markdown to HTML conversion
 * - JSON syntax highlighting
 * - Auto-refresh capability
 */
export default function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { 
    isPreviewEnabled, 
    previewContent, 
    previewType,
    isAutoRefresh,
    togglePreview,
    toggleAutoRefresh 
  } = usePreviewStore()
  
  /**
   * Updates the preview content based on file type
   */
  useEffect(() => {
    if (!isPreviewEnabled || !previewContent || !iframeRef.current) return
    
    const iframe = iframeRef.current
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    
    if (!doc) return
    
    // Clear previous content
    doc.open()
    
    switch (previewType) {
      case 'html':
        // Direct HTML preview
        doc.write(previewContent)
        break
        
      case 'markdown': {
        // Simple markdown rendering (in production, use a proper markdown parser)
        const mdHtml = convertMarkdownToHtml(previewContent)
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { 
                font-family: -apple-system, sans-serif; 
                padding: 20px;
                line-height: 1.6;
                color: #333;
              }
              h1, h2, h3 { margin-top: 24px; margin-bottom: 16px; }
              code { 
                background: #f4f4f4; 
                padding: 2px 4px; 
                border-radius: 3px;
                font-family: 'Cascadia Code', monospace;
              }
              pre { 
                background: #f4f4f4; 
                padding: 16px; 
                border-radius: 6px;
                overflow-x: auto;
              }
              blockquote {
                border-left: 4px solid #ddd;
                margin: 0;
                padding-left: 16px;
              }
            </style>
          </head>
          <body>${mdHtml}</body>
          </html>
        `)
        break
      }
        
      case 'json':
        // JSON with syntax highlighting
        try {
          const formatted = JSON.stringify(JSON.parse(previewContent), null, 2)
          doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { 
                  font-family: 'Cascadia Code', monospace; 
                  padding: 20px;
                  background: #1e1e1e;
                  color: #d4d4d4;
                }
                pre { margin: 0; }
                .string { color: #ce9178; }
                .number { color: #b5cea8; }
                .boolean { color: #569cd6; }
                .null { color: #569cd6; }
                .key { color: #9cdcfe; }
              </style>
            </head>
            <body>
              <pre>${syntaxHighlightJson(formatted)}</pre>
            </body>
            </html>
          `)
        } catch (e) {
          doc.write(`<pre style="color: red;">Invalid JSON: ${e}</pre>`)
        }
        break
        
      default:
        doc.write('<p style="opacity: 0.5;">No preview available for this file type</p>')
    }
    
    doc.close()
  }, [previewContent, previewType, isPreviewEnabled])
  
  if (!isPreviewEnabled) {
    return (
      <div className="preview-disabled">
        <button 
          className="enable-preview-btn"
          onClick={togglePreview}
        >
          Enable Preview
        </button>
      </div>
    )
  }
  
  return (
    <div className="preview-panel">
      {/* Preview Header */}
      <div className="preview-header">
        <h3 className="preview-title">PREVIEW</h3>
        <div className="preview-controls">
          <button
            className={`control-btn ${isAutoRefresh ? 'active' : ''}`}
            onClick={toggleAutoRefresh}
            title="Toggle auto-refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="control-btn"
            onClick={togglePreview}
            title="Close preview"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="preview-content">
        {previewContent ? (
          <iframe
            ref={iframeRef}
            className="preview-iframe"
            sandbox="allow-scripts"
            title="Preview"
          />
        ) : (
          <div className="no-preview">
            <p>No preview content</p>
            <p className="text-sm opacity-60">
              Open an HTML, Markdown, or JSON file to see preview
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Simple markdown to HTML converter
 * In production, use a proper markdown parser like marked or remark
 */
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>')
}

/**
 * JSON syntax highlighter
 */
function syntaxHighlightJson(json: string): string {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'number'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key'
        } else {
          cls = 'string'
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean'
      } else if (/null/.test(match)) {
        cls = 'null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}