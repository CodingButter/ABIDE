# ABIDE - Automated Browser IDE

ABIDE is a comprehensive system that provides an automated browser-based IDE with LLM integration capabilities. It consists of three main components working together to enable intelligent browser automation and IDE functionality.

## Architecture

- **App (Frontend)**: React-based web application providing the browser IDE interface
- **Server**: WebSocket server managing browser automation state and IDE operations
- **MCP Server**: Model Context Protocol server enabling LLM integration for intelligent automation

## Components

### Frontend App (`packages/app`)
- Browser-based IDE interface
- Real-time WebSocket connection to server
- Visual cursor control and element selection
- Code editor integration
- Layout management

### Server (`packages/server`)
- WebSocket server for real-time communication
- Browser automation state management
- IDE state synchronization
- Action execution engine
- Event broadcasting

### MCP Server (`packages/mcp-server`)
- Model Context Protocol implementation
- LLM-friendly API for state queries
- Method execution interface
- Real-time state updates
- Integration with the main server via WebSocket

## Getting Started

```bash
# Install dependencies
npm install

# Run all services in development mode
npm run dev

# Build all packages
npm run build
```

## Development

This is a mono-repo using npm workspaces. Each package can be developed independently:

```bash
# Run specific package
npm run dev -w @abide/app
npm run dev -w @abide/server
npm run dev -w @abide/mcp-server
```

## Features (Planned)

- **Browser Automation**: Control browser elements, navigate, and interact
- **IDE Integration**: Code editing with syntax highlighting and auto-completion
- **LLM Control**: AI-powered automation through MCP protocol
- **Real-time Sync**: WebSocket-based state synchronization
- **Layout Management**: Customizable IDE layouts and panels
- **Action Recording**: Record and replay browser interactions
- **State Inspection**: Debug and inspect browser and IDE state

## License

MIT