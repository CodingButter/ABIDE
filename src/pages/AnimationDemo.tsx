import { useState } from 'react'
import Cursor from '../components/Cursor'
import TypingAnimation from '../components/TypingAnimation'
import { Sparkles, Zap, Code, Terminal, Palette, ArrowLeft } from 'lucide-react'
import './animationDemo.css'

interface AnimationDemoProps {
  onBack?: () => void
}

export default function AnimationDemo({ onBack }: AnimationDemoProps) {
  const [cursorActive, setCursorActive] = useState(false)
  const [cursorColor, setCursorColor] = useState('var(--color-accent-primary)')
  const [typingSpeed, setTypingSpeed] = useState(300)
  const [showTerminal, setShowTerminal] = useState(false)

  const codeExample = `function createMagic() {
  const ideas = ['cursor trails', 'typing effects', 'pure chaos'];
  return ideas.map(idea => \`✨ \${idea}\`).join('\\n');
}`

  const terminalExample = `$ npm run dev
> abide@0.1.0 dev
> ./scripts/dev.sh

VITE v6.3.5 ready in 413ms
➜ Local: http://localhost:5173/
➜ Rusty Butter is LIVE! 🔴`

  return (
    <div className="animation-demo">
      {cursorActive && <Cursor active={cursorActive} color={cursorColor} />}
      
      <div className="demo-header">
        <button 
          className="back-button"
          onClick={onBack}
          title="Back to IDE"
        >
          <ArrowLeft size={20} />
          Back to IDE
        </button>
        <h1>
          <Sparkles className="inline-icon" />
          Animation Showcase
          <Sparkles className="inline-icon" />
        </h1>
        <p className="subtitle">Watch the magic happen in real-time!</p>
      </div>

      <div className="demo-sections">
        {/* Cursor Demo Section */}
        <section className="demo-section cursor-section">
          <h2>
            <Zap className="section-icon" />
            Custom Cursor Effects
          </h2>
          
          <div className="controls">
            <button 
              className={`control-button ${cursorActive ? 'active' : ''}`}
              onClick={() => {
                setCursorActive(!cursorActive)
                document.body.classList.toggle('custom-cursor-active', !cursorActive)
              }}
            >
              {cursorActive ? 'Disable' : 'Enable'} Custom Cursor
            </button>
            
            <div className="color-picker">
              <label>Cursor Color:</label>
              <div className="color-options">
                <button
                  className="color-option primary"
                  onClick={() => setCursorColor('var(--color-accent-primary)')}
                />
                <button
                  className="color-option success"
                  onClick={() => setCursorColor('var(--color-accent-success)')}
                />
                <button
                  className="color-option danger"
                  onClick={() => setCursorColor('var(--color-accent-danger)')}
                />
                <button
                  className="color-option warning"
                  onClick={() => setCursorColor('var(--color-accent-warning)')}
                />
              </div>
            </div>
          </div>

          <div className="feature-list">
            <div className="feature">✨ Trail effects following mouse movement</div>
            <div className="feature">💫 Pulsing animation with customizable speed</div>
            <div className="feature">⌨️ Typing detection with visual feedback</div>
            <div className="feature">🎯 Hover effects on interactive elements</div>
          </div>
        </section>

        {/* Typing Animation Section */}
        <section className="demo-section typing-section">
          <h2>
            <Code className="section-icon" />
            Typing Animation System
          </h2>

          <div className="controls">
            <div className="speed-control">
              <label>Typing Speed: {typingSpeed} CPM</label>
              <input
                type="range"
                min="100"
                max="1000"
                value={typingSpeed}
                onChange={(e) => setTypingSpeed(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="typing-demos">
            <div className="typing-demo-item">
              <h3>Basic Text Animation</h3>
              <div className="demo-content">
                <TypingAnimation
                  text="Welcome to ABIDE - Where code comes to life with style!"
                  speed={typingSpeed}
                  key={`basic-${typingSpeed}`}
                />
              </div>
            </div>

            <div className="typing-demo-item">
              <h3>Code Block Animation</h3>
              <div className="demo-content code-block">
                <TypingAnimation
                  text={codeExample}
                  speed={typingSpeed}
                  className="code-block"
                  key={`code-${typingSpeed}`}
                />
              </div>
            </div>

            <div className="typing-demo-item">
              <h3>Loop with Delete Effect</h3>
              <div className="demo-content">
                <TypingAnimation
                  text="Building amazing things..."
                  speed={typingSpeed}
                  deleteAfter={true}
                  loop={true}
                  key={`loop-${typingSpeed}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Terminal Demo Section */}
        <section className="demo-section terminal-section">
          <h2>
            <Terminal className="section-icon" />
            Terminal Experience
          </h2>

          <button 
            className="control-button"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            {showTerminal ? 'Hide' : 'Show'} Terminal Demo
          </button>

          {showTerminal && (
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-controls">
                  <span className="control red"></span>
                  <span className="control yellow"></span>
                  <span className="control green"></span>
                </div>
                <span className="terminal-title">rusty@butter:~/abide</span>
              </div>
              <div className="terminal-body">
                <TypingAnimation
                  text={terminalExample}
                  speed={400}
                  className="terminal"
                  startDelay={500}
                  key={`terminal-${showTerminal}`}
                />
              </div>
            </div>
          )}
        </section>

        {/* Combined Demo */}
        <section className="demo-section combined-section">
          <h2>
            <Palette className="section-icon" />
            Combined Effects
          </h2>
          
          <div className="combined-demo">
            <p>Enable the custom cursor and move it around while this types:</p>
            <div className="big-typing">
              <TypingAnimation
                text="Experience the future of development environments!"
                speed={200}
                deleteAfter={true}
                deleteSpeed={400}
                loop={true}
                className="big-text"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}