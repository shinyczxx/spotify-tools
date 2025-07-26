/**
 * @file WireframeSingleStateSwitch.tsx
 * @description Multi-state switch component that works exactly like Toggle but supports multiple states
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-24
 *
 * @UsedBy
 * - LastFmTools.tsx
 *
 * @ChangeLog
 * - 2.0.0: Complete rewrite to match Toggle component behavior exactly
 * - 1.0.0: Initial implementation with array-based state management
 */

import React from 'react'
import './WireframeSingleStateSwitch.css'

interface WireframeSingleStateSwitchProps {
  states: Array<{
    label: string
    state: string
  }>
  activeState: string
  onStateChange: (state: string) => void
  width?: string
  style?: React.CSSProperties
  disabled?: boolean
}

const WireframeSingleStateSwitch: React.FC<WireframeSingleStateSwitchProps> = ({
  states,
  activeState,
  onStateChange,
  width = '400px',
  style = {},
  disabled = false,
}) => {
  const [hoveredInactive, setHoveredInactive] = React.useState<string | null>(null)
  
  // Reset hoveredInactive if selection changes
  React.useEffect(() => {
    setHoveredInactive(null)
  }, [activeState])
  
  const activeIndex = states.findIndex(state => state.state === activeState)
  
  return (
    <div className="wireframe-single-state-switch-container" style={{ width, ...style }}>
      {states.map((state, index) => {
        const isActive = state.state === activeState
        const isHoveredInactive = hoveredInactive && hoveredInactive !== state.state
        
        return (
          <button
            key={state.state}
            className={`wireframe-single-state-switch-button${isActive ? ' selected' : ''}${
              isHoveredInactive ? ' equal' : ''
            }`}
            onClick={() => !disabled && onStateChange(state.state)}
            type="button"
            disabled={disabled}
            onMouseEnter={() => !disabled && !isActive && setHoveredInactive(state.state)}
            onMouseLeave={() => setHoveredInactive(null)}
          >
            <span className="wireframe-single-state-switch-label">{state.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default WireframeSingleStateSwitch