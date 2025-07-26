/**
 * @file WireframeMultiSelect.tsx
 * @description Wireframe themed multi-select component with checkbox list
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-25
 *
 * @UsedBy
 * - Album shuffle modal for selecting album types
 * - Any component needing multiple option selection
 */

import React from 'react'
import { WireframeCheckbox } from '../WireframeCheckbox'
import '../styles/select-checkbox-merged.css'
import './WireframeMultiSelect.css'

export interface WireframeMultiSelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface WireframeMultiSelectProps {
  options: WireframeMultiSelectOption[]
  values: (string | number)[]
  onChange: (values: (string | number)[]) => void
  disabled?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
  label?: string
  labelPosition?: 'left' | 'right' | 'top' | 'none'
  id?: string
  variant?: 'default' | 'compact'
}

/**
 * Multi-select component using checkboxes in wireframe style
 */
export const WireframeMultiSelect: React.FC<WireframeMultiSelectProps> = ({
  options,
  values,
  onChange,
  disabled = false,
  className = '',
  size = 'medium',
  label,
  labelPosition = 'top',
  id,
  variant = 'default',
}) => {
  const multiSelectId = id || `wireframe-multiselect-${Math.random().toString(36).substr(2, 9)}`

  const handleOptionChange = (optionValue: string | number, checked: boolean) => {
    if (disabled) return

    if (checked) {
      // Add to values if not already present
      if (!values.includes(optionValue)) {
        onChange([...values, optionValue])
      }
    } else {
      // Remove from values
      onChange(values.filter(value => value !== optionValue))
    }
  }

  const containerClasses = [
    'wireframe-multiselect-container',
    `wireframe-multiselect-container-${size}`,
    `wireframe-multiselect-container-${variant}`,
    labelPosition === 'top' 
      ? 'wireframe-multiselect-container-label-top' 
      : labelPosition === 'right'
      ? 'wireframe-multiselect-container-label-right'
      : labelPosition === 'left'
      ? 'wireframe-multiselect-container-label-left'
      : 'wireframe-multiselect-container-label-none',
    label && labelPosition !== 'none'
      ? 'wireframe-multiselect-container-with-gap'
      : 'wireframe-multiselect-container-no-gap',
    disabled ? 'wireframe-multiselect-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const optionsClasses = [
    'wireframe-multiselect-options',
    `wireframe-multiselect-options-${size}`,
    `wireframe-multiselect-options-${variant}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses} id={multiSelectId}>
      {label && labelPosition !== 'none' && (
        <label 
          className={`wireframe-multiselect-label wireframe-multiselect-label-${size} wireframe-multiselect-label-${labelPosition}`}
          htmlFor={multiSelectId}
        >
          {label}
        </label>
      )}
      
      <div className={optionsClasses} role="group" aria-labelledby={label ? `${multiSelectId}-label` : undefined}>
        {options.map((option) => {
          const isSelected = values.includes(option.value)
          const isOptionDisabled = disabled || option.disabled

          return (
            <div
              key={option.value}
              className={`wireframe-multiselect-option ${isOptionDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
            >
              <WireframeCheckbox
                id={`${multiSelectId}-option-${option.value}`}
                label={option.label}
                checked={isSelected}
                disabled={isOptionDisabled}
                size={size}
                variant={variant}
                onChange={(e) => handleOptionChange(option.value, e.target.checked)}
                containerClassName="wireframe-multiselect-checkbox-container"
                checkboxClassName="wireframe-multiselect-checkbox"
                labelClassName="wireframe-multiselect-checkbox-label"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WireframeMultiSelect