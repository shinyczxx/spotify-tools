/**
 * @file HoverDisplay.tsx
 * @description Global hover display component that shows content in a
 * wireframe-styled box when hovering over an element. Used for
 * tooltips and contextual help in the terminal UI.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { useState, useRef, useEffect } from 'react'
import './HoverDisplay.css'

interface HoverDisplayProps {
  /** Content to display in the hover box */
  content: React.ReactNode
  /** Position of the hover box relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Custom className for additional styling */
  className?: string
  /** Children element that triggers the hover display */
  children: React.ReactNode
  /** Maximum width of the hover display */
  maxWidth?: number
  /** Delay before showing the hover display (ms) */
  delay?: number
  /** Whether to show the hover display */
  disabled?: boolean
  /** Whether the hover display should follow the mouse cursor */
  followMouse?: boolean
}

const HoverDisplay: React.FC<HoverDisplayProps> = ({
  content,
  position = 'top',
  className = '',
  children,
  maxWidth = 300,
  delay = 500,
  disabled = false,
  followMouse = false,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hoverStyle, setHoverStyle] = useState<React.CSSProperties>({})
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isVisible && containerRef.current) {
      if (followMouse) {
        // Use mouse position for positioning
        const offset = 15
        let style: React.CSSProperties = {
          maxWidth: `${maxWidth}px`,
          position: 'fixed',
          zIndex: 1000,
          left: mousePosition.x + offset,
          top: mousePosition.y + offset,
          pointerEvents: 'none', // Prevent interfering with mouse events
        }

        // Ensure the hover display stays within viewport bounds
        const padding = 10
        if (style.left && (style.left as number) + maxWidth > window.innerWidth - padding) {
          style.left = mousePosition.x - maxWidth - offset
        }
        if (style.top && (style.top as number) + 100 > window.innerHeight - padding) {
          style.top = mousePosition.y - 100 - offset
        }

        setHoverStyle(style)
      } else {
        // Original positioning logic
        const rect = containerRef.current.getBoundingClientRect()
        const offset = 8

        let style: React.CSSProperties = {
          maxWidth: `${maxWidth}px`,
          position: 'fixed',
          zIndex: 1000,
        }

        switch (position) {
          case 'top':
            style = {
              ...style,
              left: rect.left + rect.width / 2,
              bottom: window.innerHeight - rect.top + offset,
              transform: 'translateX(-50%)',
            }
            break
          case 'bottom':
            style = {
              ...style,
              left: rect.left + rect.width / 2,
              top: rect.bottom + offset,
              transform: 'translateX(-50%)',
            }
            break
          case 'left':
            style = {
              ...style,
              right: window.innerWidth - rect.left + offset,
              top: rect.top + rect.height / 2,
              transform: 'translateY(-50%)',
            }
            break
          case 'right':
            style = {
              ...style,
              left: rect.right + offset,
              top: rect.top + rect.height / 2,
              transform: 'translateY(-50%)',
            }
            break
        }

        // Ensure the hover display stays within viewport bounds
        const padding = 10
        if (style.left && (style.left as number) < padding) {
          style.left = padding
          style.transform = 'none'
        }
        if (style.right && (style.right as number) < padding) {
          style.right = padding
          style.transform = 'none'
        }
        if (style.top && (style.top as number) < padding) {
          style.top = padding
          style.transform = style.transform?.includes('translateX') ? 'translateX(-50%)' : 'none'
        }
        if (style.bottom && (style.bottom as number) < padding) {
          style.bottom = padding
          style.transform = style.transform?.includes('translateX') ? 'translateX(-50%)' : 'none'
        }

        setHoverStyle(style)
      }
    }
  }, [isVisible, position, maxWidth, followMouse, mousePosition])

  const handleMouseEnter = () => {
    if (disabled || !content) return

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsVisible(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (followMouse) {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className={`hover-display-trigger ${className}`}
      >
        {children}
      </div>

      {isVisible && content && (
        <div
          className="hover-display-box"
          style={hoverStyle}
        >
          <div className="hover-display-content">{content}</div>
        </div>
      )}
    </>
  )
}

export default HoverDisplay
