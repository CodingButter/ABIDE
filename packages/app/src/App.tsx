import { useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import { BrowserController } from './lib/BrowserController';
import './App.css';

function App() {
  const browserControllerRef = useRef<BrowserController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Initialize browser controller
    browserControllerRef.current = new BrowserController();

    return () => {
      // Cleanup
      if (browserControllerRef.current) {
        // Add cleanup method if needed
      }
    };
  }, []);
  return (
    <div className="h-screen bg-gray-900 text-gray-100">
      <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <h1 className="text-xl font-semibold">ABIDE - Automated Browser IDE</h1>
      </header>

      <PanelGroup direction="horizontal" className="h-[calc(100vh-3rem)]">
        {/* File Explorer Panel */}
        <Panel defaultSize={20} minSize={10} maxSize={30}>
          <div className="h-full bg-gray-800 border-r border-gray-700 p-4">
            <h2 className="text-sm font-semibold mb-2">Explorer</h2>
            <div className="text-sm text-gray-400">File tree will go here</div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-600 transition-colors" />

        {/* Main Content Area */}
        <Panel defaultSize={60}>
          <PanelGroup direction="vertical">
            {/* Code Editor */}
            <Panel defaultSize={70} minSize={30}>
              <div className="h-full bg-gray-900">
                <Editor
                  theme="vs-dark"
                  defaultLanguage="typescript"
                  defaultValue="// Welcome to ABIDE - Let's build browser automation!"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-600 transition-colors" />

            {/* Terminal/Output Panel */}
            <Panel defaultSize={30} minSize={10}>
              <div className="h-full bg-black p-4 font-mono text-sm">
                <div className="text-green-400">$ ABIDE Terminal</div>
                <div className="text-gray-400 mt-2">Ready for browser automation...</div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-600 transition-colors" />

        {/* Browser Preview Panel */}
        <Panel defaultSize={20} minSize={10} maxSize={40}>
          <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="h-12 px-4 flex items-center border-b border-gray-700">
              <h2 className="text-sm font-semibold">Browser Preview</h2>
            </div>
            <iframe
              ref={iframeRef}
              className="flex-1 w-full h-full bg-white"
              src="about:blank"
              sandbox="allow-scripts allow-same-origin"
              title="Browser Preview"
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
