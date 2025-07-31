import { useEffect, useRef, useState } from 'react'
import './typingAnimation.css'

interface TypingAnimationProps {
  text: string
  speed?: number // Characters per minute
  onComplete?: () => void
  showCursor?: boolean
  cursorChar?: string
  className?: string
  startDelay?: number
  deleteAfter?: boolean
  deleteSpeed?: number
  loop?: boolean
}

export default function TypingAnimation({
  text,
  speed = 300, // 300 characters per minute (5 per second)
  onComplete,
  showCursor = true,
  cursorChar = '|',
  className = '',
  startDelay = 0,
  deleteAfter = false,
  deleteSpeed = 600, // Faster deletion
  loop = false
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const cursorIntervalRef = useRef<NodeJS.Timeout>()

  // Calculate delay between characters
  const typeDelay = 60000 / speed // milliseconds per character
  const deleteDelay = 60000 / deleteSpeed

  useEffect(() => {
    // Cursor blink effect
    if (showCursor) {
      cursorIntervalRef.current = setInterval(() => {
        setCursorVisible(prev => !prev)
      }, 530) // Blink every 530ms for realistic effect
    }

    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current)
      }
    }
  }, [showCursor])

  useEffect(() => {
    const startTyping = () => {
      setIsTyping(true)
      setIsDeleting(false)
      typeNextChar(0)
    }

    const typeNextChar = (index: number) => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index))
        
        if (index < text.length) {
          // Add some randomness to make it more human-like
          const randomDelay = typeDelay + (Math.random() - 0.5) * typeDelay * 0.5
          timeoutRef.current = setTimeout(() => {
            typeNextChar(index + 1)
          }, randomDelay)
        } else {
          // Typing complete
          setIsTyping(false)
          if (onComplete) onComplete()
          
          if (deleteAfter) {
            timeoutRef.current = setTimeout(() => {
              startDeleting()
            }, 1000) // Wait 1 second before deleting
          }
        }
      }
    }

    const startDeleting = () => {
      setIsDeleting(true)
      deleteNextChar(text.length)
    }

    const deleteNextChar = (index: number) => {
      if (index >= 0) {
        setDisplayedText(text.slice(0, index))
        
        if (index > 0) {
          const randomDelay = deleteDelay + (Math.random() - 0.5) * deleteDelay * 0.3
          timeoutRef.current = setTimeout(() => {
            deleteNextChar(index - 1)
          }, randomDelay)
        } else {
          // Deletion complete
          setIsDeleting(false)
          
          if (loop) {
            timeoutRef.current = setTimeout(() => {
              startTyping()
            }, startDelay)
          }
        }
      }
    }

    // Start the animation
    if (startDelay > 0) {
      timeoutRef.current = setTimeout(startTyping, startDelay)
    } else {
      startTyping()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed, deleteSpeed, startDelay, deleteAfter, loop, onComplete])

  return (
    <span className={`typing-animation ${className}`}>
      <span className="typed-text">{displayedText}</span>
      {showCursor && (
        <span 
          className={`typing-cursor ${cursorVisible ? 'visible' : ''} ${isTyping ? 'typing' : ''} ${isDeleting ? 'deleting' : ''}`}
        >
          {cursorChar}
        </span>
      )}
    </span>
  )
}