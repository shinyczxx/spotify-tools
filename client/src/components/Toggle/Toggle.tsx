/**
 * @file Toggle.tsx
 * @description A toggle component that switches between two states with customizable width and labels
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-06
 *
 * @UsedBy
 * - AlbumShuffle.tsx
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with width prop and two state labels
 */

import React from 'react'
import './Toggle.css'

export interface ToggleProps {
  leftLabel: string
  rightLabel: string
  selected: 'left' | 'right'
  onToggle: (selected: 'left' | 'right') => void
  width?: string
  style?: React.CSSProperties
}

export const Toggle: React.FC<ToggleProps> = ({
  leftLabel,
  rightLabel,
  selected,
  onToggle,
  width = '400px',
  style = {},
}) => {
  const [hoveredInactive, setHoveredInactive] = React.useState<'left' | 'right' | null>(null)

  // Reset hoveredInactive if selection changes
  React.useEffect(() => {
    setHoveredInactive(null)
  }, [selected])

  return (
    <div className="toggle-container" style={{ width, ...style }}>
      <button
        className={`toggle-button left${selected === 'left' ? ' selected' : ''}${
          hoveredInactive === 'right' ? ' equal' : ''
        }`}
        onClick={() => onToggle('left')}
        type="button"
        onMouseEnter={() => selected === 'right' && setHoveredInactive('left')}
        onMouseLeave={() => setHoveredInactive(null)}
      >
        <span className="toggle-label">{leftLabel}</span>
      </button>
      <button
        className={`toggle-button right${selected === 'right' ? ' selected' : ''}${
          hoveredInactive === 'left' ? ' equal' : ''
        }`}
        onClick={() => onToggle('right')}
        type="button"
        onMouseEnter={() => selected === 'left' && setHoveredInactive('right')}
        onMouseLeave={() => setHoveredInactive(null)}
      >
        <span className="toggle-label">{rightLabel}</span>
      </button>
    </div>
  )
}
