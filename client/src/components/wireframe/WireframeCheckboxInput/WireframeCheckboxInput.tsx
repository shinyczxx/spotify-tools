/**
 * @file WireframeCheckboxInput.tsx
 * @description Reusable wireframe-style checkbox input component
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted from AdvancedShufflePanel inline component
 */

import React from 'react'

export interface WireframeCheckboxInputProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  accentColor?: string
  description?: string
}

const WireframeCheckboxInput: React.FC<WireframeCheckboxInputProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  accentColor = 'var(--circuit-color)',
  description,
}) => {
  return (
    <div style={{ marginBottom: '8px' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: '12px',
          color: disabled ? '#666' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          style={{
            marginRight: '8px',
            accentColor: disabled ? '#666' : accentColor,
            opacity: disabled ? 0.5 : 1,
          }}
        />
        <span>
          {label}
          {description && (
            <div style={{ 
              fontSize: '10px', 
              color: disabled ? '#555' : '#ccc',
              marginTop: '2px' 
            }}>
              {description}
            </div>
          )}
        </span>
      </label>
    </div>
  )
}

export default WireframeCheckboxInput