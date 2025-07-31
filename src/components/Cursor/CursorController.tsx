import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import Cursor from './index'

interface CursorTarget {
  element?: HTMLElement
  selector?: string
  position?: { x: number; y: number }
  duration?: number
}

interface CursorControllerProps {
  active?: boolean
  color?: string
  trailLength?: number
  pulseSpeed?: number
  onReachTarget?: () => void
}

export interface CursorControllerRef {
  moveTo: (target: CursorTarget) => Promise<void>
  click: (target?: CursorTarget) => Promise<void>
  typeAt: (target: CursorTarget, text: string, speed?: number) => Promise<void>
  getCurrentPosition: () => { x: number; y: number }
}

const CursorController = forwardRef<CursorControllerRef, CursorControllerProps>(({
  active = true,
  color = 'var(--color-accent-primary)',
  trailLength = 5,
  pulseSpeed = 1,
  onReachTarget
}, ref) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const animationRef = useRef<number>()
  const positionRef = useRef({ x: 0, y: 0 })

  // Get element position including scroll offset
  const getElementCenter = (element: HTMLElement): { x: number; y: number } => {
    const rect = element.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    }
  }

  // Find element by selector
  const findElement = (selector: string): HTMLElement | null => {
    return document.querySelector(selector)
  }

  // Smooth movement animation using easing
  const animateMovement = (
    start: { x: number; y: number },
    end: { x: number; y: number },
    duration: number,
    onComplete?: () => void
  ) => {
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth movement
      const easeInOutCubic = (t: number) => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }
      
      const easedProgress = easeInOutCubic(progress)
      
      const currentX = start.x + (end.x - start.x) * easedProgress
      const currentY = start.y + (end.y - start.y) * easedProgress
      
      setPosition({ x: currentX, y: currentY })
      positionRef.current = { x: currentX, y: currentY }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setIsMoving(false)
        if (onComplete) onComplete()
        if (onReachTarget) onReachTarget()
      }
    }
    
    setIsMoving(true)
    animate()
  }

  // Move cursor to target
  const moveTo = async (target: CursorTarget): Promise<void> => {
    return new Promise((resolve) => {
      let targetPos: { x: number; y: number }
      
      if (target.element) {
        targetPos = getElementCenter(target.element)
      } else if (target.selector) {
        const element = findElement(target.selector)
        if (!element) {
          console.warn(`Element not found: ${target.selector}`)
          resolve()
          return
        }
        targetPos = getElementCenter(element)
      } else if (target.position) {
        targetPos = target.position
      } else {
        resolve()
        return
      }
      
      const duration = target.duration || 1000
      animateMovement(positionRef.current, targetPos, duration, () => resolve())
    })
  }

  // Simulate click at current position or target
  const click = async (target?: CursorTarget): Promise<void> => {
    if (target) {
      await moveTo(target)
    }
    
    // Visual feedback for click
    const clickElement = document.createElement('div')
    clickElement.className = 'cursor-click-effect'
    clickElement.style.left = `${positionRef.current.x}px`
    clickElement.style.top = `${positionRef.current.y}px`
    document.body.appendChild(clickElement)
    
    setTimeout(() => {
      clickElement.remove()
    }, 600)
    
    // Trigger actual click if there's an element at this position
    const element = document.elementFromPoint(positionRef.current.x, positionRef.current.y)
    if (element && element instanceof HTMLElement) {
      element.click()
    }
    
    return new Promise(resolve => setTimeout(resolve, 200))
  }

  // Simulate typing at a location
  const typeAt = async (target: CursorTarget, text: string, speed = 100): Promise<void> => {
    await moveTo(target)
    
    // Focus the element if it's an input
    let inputElement: HTMLElement | null = null
    if (target.element) {
      inputElement = target.element
    } else if (target.selector) {
      inputElement = findElement(target.selector)
    }
    
    if (inputElement && (inputElement instanceof HTMLInputElement || inputElement instanceof HTMLTextAreaElement)) {
      inputElement.focus()
      
      setIsTyping(true)
      
      // Type each character
      for (let i = 0; i < text.length; i++) {
        inputElement.value += text[i]
        inputElement.dispatchEvent(new Event('input', { bubbles: true }))
        
        // Random variation in typing speed for realism
        const delay = speed + (Math.random() - 0.5) * speed * 0.5
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      
      setIsTyping(false)
    }
  }

  // Get current cursor position
  const getCurrentPosition = () => positionRef.current

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    moveTo,
    click,
    typeAt,
    getCurrentPosition
  }))

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!active) return null

  return (
    <>
      <div 
        className={`cursor-controller ${isMoving ? 'moving' : ''} ${isTyping ? 'typing' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          '--cursor-color': color,
          '--pulse-speed': `${pulseSpeed}s`
        } as React.CSSProperties}
      >
        <div className="cursor-core" />
        <div className="cursor-ring" />
        {isTyping && <div className="typing-ripple" />}
      </div>
      
      {/* Trail effect could be added here similar to original Cursor component */}
      
      <style>{`
        .cursor-click-effect {
          position: fixed;
          width: 20px;
          height: 20px;
          border: 2px solid ${color};
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          animation: cursor-click 0.6s ease-out;
          transform: translate(-50%, -50%);
        }
        
        @keyframes cursor-click {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
          }
        }
        
        .cursor-controller {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: none;
        }
        
        .cursor-controller.moving .cursor-core {
          background-color: var(--color-accent-success);
          box-shadow: 0 0 20px var(--color-accent-success);
        }
        
        .cursor-controller.typing .cursor-core {
          animation: cursor-typing-pulse 0.2s ease-in-out infinite;
        }
        
        @keyframes cursor-typing-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }
      `}</style>
    </>
  )
})

CursorController.displayName = 'CursorController'

export default CursorController