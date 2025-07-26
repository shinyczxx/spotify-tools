/**
 * @file WireframeToggle.tsx
 * @description Two-button toggle component matching Toggle.tsx functionality with wireframe styling
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-24
 *
 * @ChangeLog
 * - 2.0.0: Complete rewrite to match Toggle component functionality
 * - 1.0.0: Initial implementation with terminal aesthetic
 */

import React from 'react'
import './WireframeToggle.css'

interface WireframeToggleProps {
  leftLabel: string
  rightLabel: string
  selected: 'left' | 'right'
  onToggle: (selected: 'left' | 'right') => void
  width?: string
  disabled?: boolean
}

const WireframeToggle: React.FC<WireframeToggleProps> = ({
  leftLabel,
  rightLabel,
  selected,
  onToggle,
  width = '400px',
  disabled = false,
}) => {
  const [hoveredInactive, setHoveredInactive] = React.useState<'left' | 'right' | null>(null)

  // Reset hoveredInactive if selection changes
  React.useEffect(() => {
    setHoveredInactive(null)
  }, [selected])

  return (
    <div className="wireframe-toggle-container" style={{ width }}>
      <button
        className={`wireframe-toggle-button left${selected === 'left' ? ' selected' : ''}${
          hoveredInactive === 'right' ? ' equal' : ''
        }`}
        onClick={() => !disabled && onToggle('left')}
        type="button"
        disabled={disabled}
        onMouseEnter={() => !disabled && selected === 'right' && setHoveredInactive('left')}
        onMouseLeave={() => setHoveredInactive(null)}
      >
        <span className="wireframe-toggle-label">{leftLabel}</span>
      </button>
      <button
        className={`wireframe-toggle-button right${selected === 'right' ? ' selected' : ''}${
          hoveredInactive === 'left' ? ' equal' : ''
        }`}
        onClick={() => !disabled && onToggle('right')}
        type="button"
        disabled={disabled}
        onMouseEnter={() => !disabled && selected === 'left' && setHoveredInactive('right')}
        onMouseLeave={() => setHoveredInactive(null)}
      >
        <span className="wireframe-toggle-label">{rightLabel}</span>
      </button>
    </div>
  )
}

export default WireframeToggle
