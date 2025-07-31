import { useEffect, useRef, useState } from 'react'
import './cursor.css'

interface CursorProps {
  active?: boolean
  color?: string
  trailLength?: number
  pulseSpeed?: number
}

interface CursorPosition {
  x: number
  y: number
  timestamp: number
}

export default function Cursor({
  active = true,
  color = 'var(--color-accent-primary)',
  trailLength = 5,
  pulseSpeed = 1
}: CursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<CursorPosition[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!active) return

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }

      setPositions(prev => {
        const updated = [...prev, newPosition]
        // Keep only the last N positions for trail effect
        return updated.slice(-trailLength)
      })

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }

    const handleKeyDown = () => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 200)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('keydown', handleKeyDown)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [active, trailLength])

  if (!active) return null

  return (
    <>
      {/* Cursor Trail */}
      {positions.map((pos, index) => {
        const opacity = (index + 1) / positions.length * 0.5
        const scale = 0.5 + (index / positions.length) * 0.5
        
        return (
          <div
            key={`${pos.timestamp}-${index}`}
            className="cursor-trail"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
              opacity,
              backgroundColor: color,
            }}
          />
        )
      })}

      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isTyping ? 'typing' : ''}`}
        style={{
          '--cursor-color': color,
          '--pulse-speed': `${pulseSpeed}s`
        } as React.CSSProperties}
      >
        <div className="cursor-core" />
        <div className="cursor-ring" />
        {isTyping && <div className="typing-ripple" />}
      </div>
    </>
  )
}