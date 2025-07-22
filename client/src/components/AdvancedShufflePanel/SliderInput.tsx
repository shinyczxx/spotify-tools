/**
 * @file SliderInput.tsx
 * @description Slider input component with label and styling
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface SliderInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  min?: number
  max?: number
  accentColor: string
}

/**
 * Styled slider input with label and value display
 */
export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
  accentColor,
}) => (
  <div className="slider-input-container">
    <label
      className={`slider-input-label ${disabled ? 'disabled' : ''}`}
    >
      {label}: {value}%
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      disabled={disabled}
      className="slider-input-range"
      style={{
        accentColor: disabled ? '#666' : accentColor,
        opacity: disabled ? 0.5 : 1,
      }}
    />
  </div>
)