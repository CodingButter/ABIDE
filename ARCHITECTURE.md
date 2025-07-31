# ABIDE Architecture Documentation

## Overview

ABIDE (Automated Basic IDE) is a Tauri-based desktop application that provides an integrated development environment with LLM integration via the Model Context Protocol (MCP). The application features a virtual file system, code editor with syntax highlighting, live preview capabilities, and animated typing effects for AI-assisted coding.

## Technology Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type-safe JavaScript
- **Vite 6.0** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor component
- **Zustand 5.0** - State management

### Backend
- **Tauri v2** - Desktop application framework
- **Rust** - Systems programming language
- **Axum** - Web framework for API server
- **Tokio** - Async runtime
- **Tungstenite** - WebSocket implementation

## Project Structure

```
packages/ABIDE/
├── src/                      # React frontend
│   ├── components/          # React components
│   │   ├── Editor/         # Monaco editor wrapper
│   │   ├── FileExplorer/   # File tree navigation
│   │   ├── PreviewPanel/   # Live preview component
│   │   └── Cursor/         # Animated cursor (TODO)
│   ├── store/              # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── shared/             # Shared TypeScript types
│   └── simulation/         # Typing animation logic
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── api/           # HTTP/WebSocket handlers
│   │   ├── state/         # Application state
│   │   ├── simulation/    # Animation engine
│   │   └── main.rs        # Entry point
│   └── Cargo.toml         # Rust dependencies
└── package.json           # Node dependencies
```

## Core Components

### 1. Virtual File System (VFS)
Located in `src-tauri/src/state/vfs.rs`

The VFS provides an in-memory file system that allows users to create, read, update, and delete files without touching the actual filesystem. This sandboxed approach ensures safety while providing full IDE functionality.

Key features:
- Tree-based file structure
- Support for files and directories
- Content storage with metadata
- Language detection based on file extensions

### 2. Editor Component
Located in `src/components/Editor/`

A Monaco Editor integration that provides:
- Syntax highlighting for multiple languages
- Auto-completion and IntelliSense
- Custom theme (ABIDE Dark)
- Real-time content synchronization
- Dirty state tracking

### 3. WebSocket API for MCP
Located in `src-tauri/src/api/websocket.rs`

Implements the Model Context Protocol for LLM integration:
- Bidirectional communication
- File operation commands
- Animation control messages
- Settings synchronization

### 4. State Management
Using Zustand stores in `src/store/`:

- **editorStore**: Manages open files, current file, cursor position
- **fileStore**: Handles file tree and file operations
- **previewStore**: Controls preview panel content and auto-refresh

### 5. Preview Panel
Located in `src/components/PreviewPanel/`

Supports live preview for:
- HTML files (rendered directly)
- Markdown files (converted to HTML)
- JSON files (syntax highlighted)

## Key Features

### 1. Animated Typing
The application supports animated typing effects to simulate human-like code input:
- Variable typing speed with randomization
- Cursor blinking animations
- Smooth scrolling during typing
- Character-by-character insertion

### 2. MCP Integration
Full support for Model Context Protocol:
- File CRUD operations via WebSocket
- Animation control commands
- Settings management
- Event-driven architecture

### 3. Multi-Tab Editing
- Multiple files open simultaneously
- Tab management with dirty state indicators
- Quick file switching
- Automatic language detection

### 4. Responsive Layout
- Resizable panels
- Collapsible file explorer
- Full-screen editor mode
- Dark theme optimized for coding

## Data Flow

1. **User Interaction** → React Components → Zustand Stores
2. **File Operations** → Tauri Commands → Rust VFS
3. **MCP Commands** → WebSocket → API Handlers → State Updates
4. **State Changes** → React Re-render → UI Update

## Security Considerations

- **Sandboxed VFS**: No direct filesystem access from web context
- **CSP Headers**: Strict Content Security Policy
- **Tauri Security**: Restricted command access
- **Input Validation**: All user inputs sanitized

## Development Setup

### Prerequisites
- Node.js 18+
- Rust 1.70+
- C compiler (for native modules)

### Commands
```bash
# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build for production
npm run tauri build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Future Enhancements

1. **Cursor Animation Component**: Implement custom cursor with smooth animations
2. **Typing Simulation**: Complete the typing animation system
3. **File Persistence**: Add ability to save/load workspaces
4. **Plugin System**: Support for custom extensions
5. **Terminal Integration**: Built-in terminal emulator
6. **Git Integration**: Version control features
7. **Collaborative Editing**: Multi-user support via MCP

## Performance Optimizations

- **Virtual Scrolling**: For large file trees
- **Code Splitting**: Lazy load components
- **Memoization**: Prevent unnecessary re-renders
- **Worker Threads**: Offload heavy computations
- **Debounced Updates**: Reduce state update frequency

## Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full application workflows
- **Performance Tests**: Load and stress testing

## Deployment

The application can be packaged for:
- **Windows**: MSI installer
- **macOS**: DMG or app bundle
- **Linux**: AppImage, deb, or rpm

## Contributing

Please refer to the main project's contributing guidelines. Key points:
- Follow the established code style
- Add comprehensive comments
- Update documentation
- Write tests for new features
- Submit PRs with clear descriptions