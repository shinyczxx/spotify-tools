/**
 * @file WireframeSelect.tsx
 * @description Wireframe themed select dropdown component with modular hooks and components
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 *
 * @UsedBy
 * - PlaylistSelector.tsx (for per-page selection)
 * - Any component needing standard dropdown selection
 *
 * @ChangeLog
 * - 2.0.0: Modularized with custom hooks and sub-components
 * - 1.1.0: Updated to use external terminal arrow icon
 * - 1.0.0: Initial implementation with wireframe select dropdown
 */
import React, { useState, useRef, useEffect } from 'react'
import { useDropdownPosition } from '@hooks/ui/useDropdownPosition'
import { useOutsideClick } from '@hooks/ui/useOutsideClick'
import { useSelectKeyboard } from '@hooks/ui/useSelectKeyboard'
import { SelectLabel } from './SelectLabel'
import { SelectTrigger } from './SelectTrigger'
import { SelectDropdown } from './SelectDropdown'
import '../styles/select-checkbox-merged.css'

export interface WireframeSelectOption {
  value: string | number
  label: string
}

export interface WireframeSelectProps {
  options: WireframeSelectOption[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  size?: 'small' | 'medium' | 'large'
  label?: string
  labelPosition?: 'left' | 'right' | 'top' | 'none'
  id?: string
}

export const WireframeSelect: React.FC<WireframeSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className = '',
  size = 'medium',
  label,
  labelPosition = 'top',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<WireframeSelectOption | null>(
    options.find((opt) => opt.value === value) || null,
  )
  const selectRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update selected option when value or options change
  useEffect(() => {
    const newSelectedOption = options.find((opt) => opt.value === value) || null
    setSelectedOption(newSelectedOption)
  }, [value, options])

  // Custom hooks for functionality
  const { dropdownStyle } = useDropdownPosition({ isOpen, triggerRef: selectRef })
  
  useOutsideClick({
    refs: [selectRef, dropdownRef],
    onOutsideClick: () => setIsOpen(false),
  })

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const { handleKeyDown } = useSelectKeyboard({
    disabled,
    isOpen,
    onToggle: handleToggle,
    onClose: handleClose,
    options,
    value,
    onChange,
  })

  const handleOptionClick = (option: WireframeSelectOption) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
  }

  const containerClasses = [
    'wireframe-select-container',
    `wireframe-select-container-${size}`,
    labelPosition === 'top' 
      ? 'wireframe-select-container-label-top' 
      : labelPosition === 'right'
      ? 'wireframe-select-container-label-right'
      : labelPosition === 'left'
      ? 'wireframe-select-container-label-left'
      : 'wireframe-select-container-label-none',
    label && labelPosition !== 'none'
      ? 'wireframe-select-container-with-gap'
      : 'wireframe-select-container-no-gap',
    disabled ? 'wireframe-select-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const selectId = id || `wireframe-select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={containerClasses}>
      {label && labelPosition !== 'none' && (
        <SelectLabel
          label={label}
          htmlFor={selectId}
          labelPosition={labelPosition}
        />
      )}
      
      <div
        ref={selectRef}
        className="wireframe-select"
        id={selectId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <SelectTrigger
          isOpen={isOpen}
          disabled={disabled}
          size={size}
          selectedLabel={selectedOption?.label || ''}
          placeholder={placeholder}
          onClick={handleToggle}
        />

        <SelectDropdown
          isOpen={isOpen}
          options={options}
          value={value}
          onOptionClick={handleOptionClick}
          dropdownStyle={dropdownStyle}
          dropdownRef={dropdownRef}
        />
      </div>
    </div>
  )
}

export default WireframeSelect
