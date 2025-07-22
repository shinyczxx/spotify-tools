/**
 * @file SelectDropdown.tsx
 * @description Dropdown options list for wireframe select
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { createPortal } from 'react-dom'
import { WireframeSelectOption } from './WireframeSelect'

interface SelectDropdownProps {
  isOpen: boolean
  options: WireframeSelectOption[]
  value: string | number
  onOptionClick: (option: WireframeSelectOption) => void
  dropdownStyle: React.CSSProperties
  dropdownRef: React.RefObject<HTMLDivElement>
}

/**
 * Dropdown portal with options list
 */
export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  isOpen,
  options,
  value,
  onOptionClick,
  dropdownStyle,
  dropdownRef,
}) => {
  if (!isOpen || typeof window === 'undefined') {
    return null
  }

  return createPortal(
    <div className="wireframe-select-dropdown" ref={dropdownRef} style={dropdownStyle}>
      <div className="wireframe-select-options" role="listbox">
        {options.map((option) => (
          <div
            key={option.value}
            className={`wireframe-select-option ${
              option.value === value ? 'wireframe-select-option-selected' : ''
            }`}
            onClick={() => onOptionClick(option)}
            role="option"
            aria-selected={option.value === value}
            tabIndex={-1}
          >
            <span className="wireframe-select-option-text">{option.label}</span>
            {option.value === value && (
              <span className="wireframe-select-option-check">✓</span>
            )}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  )
}