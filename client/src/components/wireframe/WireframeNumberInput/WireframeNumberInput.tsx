/**
 * @file WireframeNumberInput.tsx
 * @description Terminal-themed number input with optional increment/decrement arrows
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-24
 */

import React, { useRef } from 'react'
import './WireframeNumberInput.css'

export interface WireframeNumberInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  placeholder?: string
  showArrows?: boolean
  id?: string
}

export const WireframeNumberInput: React.FC<WireframeNumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className = '',
  placeholder,
  showArrows = false,
  id,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0
    let clampedValue = newValue
    
    if (min !== undefined) {
      clampedValue = Math.max(clampedValue, min)
    }
    if (max !== undefined) {
      clampedValue = Math.min(clampedValue, max)
    }
    
    onChange(clampedValue)
  }

  const handleIncrement = () => {
    if (disabled) return
    const newValue = value + step
    const clampedValue = max !== undefined ? Math.min(newValue, max) : newValue
    onChange(clampedValue)
  }

  const handleDecrement = () => {
    if (disabled) return
    const newValue = value - step
    const clampedValue = min !== undefined ? Math.max(newValue, min) : newValue
    onChange(clampedValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }

  const containerClasses = [
    'wireframe-number-input-container',
    showArrows ? 'wireframe-number-input-with-arrows' : 'wireframe-number-input-no-arrows',
    disabled ? 'wireframe-number-input-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        className="wireframe-number-input"
        id={id}
      />
      
      {showArrows && (
        <div className="wireframe-number-arrows">
          <button
            type="button"
            className="wireframe-number-arrow wireframe-number-arrow-up"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && value >= max)}
            aria-label="Increment"
          >
            <span className="arrow-symbol">▲</span>
          </button>
          <button
            type="button"
            className="wireframe-number-arrow wireframe-number-arrow-down"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && value <= min)}
            aria-label="Decrement"
          >
            <span className="arrow-symbol">▼</span>
          </button>
        </div>
      )}
    </div>
  )
}