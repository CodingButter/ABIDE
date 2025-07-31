# ABIDE - Automated Basic IDE

ABIDE is a Tauri-based desktop IDE with integrated LLM support through the Model Context Protocol (MCP). It provides a lightweight code editing environment with a virtual file system, Monaco Editor integration, and WebSocket-based LLM communication.

## Features

- 🚀 **Tauri v2 Desktop Application** - Native performance with web technologies
- 📝 **Monaco Editor** - VS Code's editor for a familiar coding experience
- 🗂️ **Virtual File System** - Sandboxed file operations for security
- 🤖 **MCP Integration** - WebSocket-based LLM communication protocol
- ⚛️ **React 18.3** - Modern React with TypeScript
- 🎨 **Tailwind CSS v4** - Next-generation utility-first CSS
- 🦀 **Rust Backend** - Fast and memory-safe backend with Axum

## Prerequisites

- Node.js 18+ and npm
- Rust and Cargo (install from https://rustup.rs/)
- System dependencies (Ubuntu/Debian):
  ```bash
  sudo apt update
  sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    libjavascriptcoregtk-4.1-dev \
    libsoup-3.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd packages/ABIDE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure Rust is properly installed:
   ```bash
   rustc --version
   cargo --version
   ```

## Development

To start the development server with hot-reload:

```bash
npm run dev
```

This will:
- Start the Vite dev server for the frontend
- Build and run the Tauri application
- Launch the API server on port 3030
- Open the ABIDE desktop window

### Other Commands

- `npm run dev:frontend` - Run only the frontend development server
- `npm run build` - Build the production application
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run tauri:build` - Build the Tauri application for distribution

## Architecture

The application consists of:

- **Frontend** (`src/`): React application with TypeScript
  - `components/`: UI components (Editor, FileExplorer, PreviewPanel)
  - `store/`: Zustand state management
  - `api/`: API client for backend communication
  
- **Backend** (`src-tauri/`): Rust application
  - `api/`: HTTP API server with WebSocket support
  - `commands/`: Tauri command handlers
  - `state/`: Application state and VFS implementation
  - `utils/`: Utility functions

## API Endpoints

The backend API server runs on `http://localhost:3030` with the following endpoints:

- `GET /health` - Health check
- `GET /mcp` - WebSocket endpoint for MCP
- `POST /api/files` - Create file
- `GET /api/files/:id` - Read file
- `POST /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file
- `POST /api/directories` - Create directory
- `GET /api/directories/*path` - List directory
- `GET /api/project` - Get project info
- `POST /api/project` - Save project
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

## License

[License information here]