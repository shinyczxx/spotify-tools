/**
 * @file WireframeToggle.tsx
 * @description Toggle switch component with wireframe terminal styling
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with terminal aesthetic
 */

import React from 'react'
import './WireframeToggle.css'

interface WireframeToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const WireframeToggle: React.FC<WireframeToggleProps> = ({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  size = 'medium',
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`

  const handleChange = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  return (
    <div className={`wireframe-toggle-container ${size}`}>
      {label && (
        <label htmlFor={toggleId} className="wireframe-toggle-label">
          {label}
        </label>
      )}
      <div className="wireframe-toggle-wrapper">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="wireframe-toggle-input"
        />
        <label htmlFor={toggleId} className="wireframe-toggle-track">
          <span className="wireframe-toggle-thumb" />
          <span className="wireframe-toggle-on">on</span>
          <span className="wireframe-toggle-off">off</span>
        </label>
      </div>
    </div>
  )
}

export default WireframeToggle
