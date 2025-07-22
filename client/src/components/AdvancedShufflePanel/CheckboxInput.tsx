/**
 * @file CheckboxInput.tsx
 * @description Checkbox input component with label and styling
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface CheckboxInputProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  accentColor: string
}

/**
 * Styled checkbox input with label
 */
export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  accentColor,
}) => (
  <div className="checkbox-input-container">
    <label className={`checkbox-input-label ${disabled ? 'disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="checkbox-input-checkbox"
        style={{
          accentColor: disabled ? '#666' : accentColor,
          opacity: disabled ? 0.5 : 1,
        }}
      />
      {label}
    </label>
  </div>
)