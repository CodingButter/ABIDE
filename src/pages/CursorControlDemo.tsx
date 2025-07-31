import { useRef, useState } from 'react'
import CursorController, { CursorControllerRef } from '../components/Cursor/CursorController'
import { Mouse, Target, Type, Play, ArrowLeft } from 'lucide-react'
import './cursorControlDemo.css'

interface CursorControlDemoProps {
  onBack?: () => void
}

export default function CursorControlDemo({ onBack }: CursorControlDemoProps) {
  const cursorRef = useRef<CursorControllerRef>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [demoText, setDemoText] = useState('')
  const [clickCount, setClickCount] = useState(0)

  // Demo sequence showing off cursor capabilities
  const runDemoSequence = async () => {
    if (!cursorRef.current || isPlaying) return
    
    setIsPlaying(true)
    setDemoText('')
    setClickCount(0)
    
    try {
      // Move to the text input
      await cursorRef.current.moveTo({
        selector: '#demo-input',
        duration: 1500
      })
      
      // Click to focus
      await cursorRef.current.click()
      
      // Type some text
      await cursorRef.current.typeAt(
        { selector: '#demo-input' },
        'Watch me type with realistic timing!',
        80
      )
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Move to first button
      await cursorRef.current.moveTo({
        selector: '#target-btn-1',
        duration: 1000
      })
      
      await cursorRef.current.click()
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Move to second button
      await cursorRef.current.moveTo({
        selector: '#target-btn-2',
        duration: 1200
      })
      
      await cursorRef.current.click()
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Move to third button
      await cursorRef.current.moveTo({
        selector: '#target-btn-3',
        duration: 800
      })
      
      await cursorRef.current.click()
      
      // Final flourish - draw a circle
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const radius = 150
      
      for (let angle = 0; angle <= 360; angle += 10) {
        const x = centerX + radius * Math.cos(angle * Math.PI / 180)
        const y = centerY + radius * Math.sin(angle * Math.PI / 180)
        await cursorRef.current.moveTo({
          position: { x, y },
          duration: 50
        })
      }
      
    } finally {
      setIsPlaying(false)
    }
  }

  const handleTargetClick = (id: string) => {
    setClickCount(prev => prev + 1)
    console.log(`Clicked: ${id}`)
  }

  return (
    <div className="cursor-control-demo">
      <CursorController
        ref={cursorRef}
        active={true}
        color="var(--color-accent-primary)"
        trailLength={8}
        pulseSpeed={1.2}
      />
      
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
          <Mouse className="inline-icon" />
          Advanced Cursor Control
          <Target className="inline-icon" />
        </h1>
        <p className="subtitle">Element targeting, smooth animations, and realistic interactions!</p>
      </div>

      <div className="demo-content">
        <div className="control-panel">
          <h2>Demo Controls</h2>
          
          <button
            className={`demo-button primary ${isPlaying ? 'disabled' : ''}`}
            onClick={runDemoSequence}
            disabled={isPlaying}
          >
            <Play size={20} />
            {isPlaying ? 'Running Demo...' : 'Run Full Demo'}
          </button>

          <div className="stats">
            <div className="stat">
              <span className="label">Clicks:</span>
              <span className="value">{clickCount}</span>
            </div>
          </div>
        </div>

        <div className="interactive-area">
          <h3>Interactive Elements</h3>
          
          <div className="input-section">
            <label htmlFor="demo-input">
              <Type size={16} />
              Text Input Target:
            </label>
            <input
              id="demo-input"
              type="text"
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              placeholder="Cursor will type here..."
            />
          </div>

          <div className="button-grid">
            <button
              id="target-btn-1"
              className="target-button"
              onClick={() => handleTargetClick('Button 1')}
            >
              <Target size={16} />
              Target 1
            </button>
            
            <button
              id="target-btn-2"
              className="target-button accent"
              onClick={() => handleTargetClick('Button 2')}
            >
              <Target size={16} />
              Target 2
            </button>
            
            <button
              id="target-btn-3"
              className="target-button success"
              onClick={() => handleTargetClick('Button 3')}
            >
              <Target size={16} />
              Target 3
            </button>
          </div>
        </div>

        <div className="features-section">
          <h3>Cursor Controller Features</h3>
          <div className="feature-grid">
            <div className="feature-card">
              <h4>🎯 Element Targeting</h4>
              <p>Target elements by selector, direct reference, or absolute position</p>
            </div>
            <div className="feature-card">
              <h4>🌊 Smooth Animations</h4>
              <p>Easing functions for natural cursor movement</p>
            </div>
            <div className="feature-card">
              <h4>⌨️ Realistic Typing</h4>
              <p>Variable speed typing with authentic timing</p>
            </div>
            <div className="feature-card">
              <h4>🖱️ Click Effects</h4>
              <p>Visual feedback and actual DOM event triggering</p>
            </div>
          </div>
        </div>

        <div className="code-example">
          <h3>Usage Example</h3>
          <pre>{`// Move to element
await cursor.moveTo({
  selector: '#save-button',
  duration: 1000
})

// Click at current position
await cursor.click()

// Type in input field
await cursor.typeAt(
  { selector: '#username' },
  'RustyButter',
  100 // chars per minute
)

// Move to coordinates
await cursor.moveTo({
  position: { x: 500, y: 300 },
  duration: 1500
})`}</pre>
        </div>
      </div>
    </div>
  )
}