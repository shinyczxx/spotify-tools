/**
 * @file WireframeSlider.tsx
 * @description Reusable wireframe-style slider input component
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted from AdvancedShufflePanel inline component
 */

import React from 'react'

export interface WireframeSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  accentColor?: string
  showValue?: boolean
  unit?: string
}

const WireframeSlider: React.FC<WireframeSliderProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  accentColor = 'var(--circuit-color)',
  showValue = true,
  unit = '%',
}) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          marginBottom: '4px',
          color: disabled ? '#666' : '#fff',
        }}
      >
        {label}{showValue && `: ${value}${unit}`}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        style={{
          width: '100%',
          accentColor: disabled ? '#666' : accentColor,
          opacity: disabled ? 0.5 : 1,
        }}
      />
    </div>
  )
}

export default WireframeSlider