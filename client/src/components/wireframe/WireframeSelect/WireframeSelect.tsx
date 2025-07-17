/**
 * @file WireframeSelect.tsx
 * @description Wireframe themed select dropdown component with 80s terminal aesthetic
 * @author GitHub Copilot
 * @version 1.1.0
 * @date 2025-07-07
 *
 * @UsedBy
 * - PlaylistSelector.tsx (for per-page selection)
 * - Any component needing standard dropdown selection
 *
 * @ChangeLog
 * - 1.1.0: Updated to use external terminal arrow icon
 * - 1.0.0: Initial implementation with wireframe select dropdown
 */
import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const newSelectedOption = options.find((opt) => opt.value === value) || null
    setSelectedOption(newSelectedOption)
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Position dropdown absolutely in viewport with smart positioning
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      const dropdownHeight = 200 // Approximate dropdown height
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      // Determine if dropdown should go up or down
      const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

      setDropdownStyle({
        position: 'absolute',
        top: shouldDropUp
          ? rect.top + window.scrollY - dropdownHeight
          : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        zIndex: 9999,
        border: '1px solid var(--terminal-cyan)',
        background: 'var(--terminal-bg)',
        maxHeight: '200px',
        overflowY: 'auto',
      })
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionClick = (option: WireframeSelectOption) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        handleToggle()
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          // Move to next option
          const currentIndex = options.findIndex((opt) => opt.value === value)
          const nextIndex = Math.min(currentIndex + 1, options.length - 1)
          if (nextIndex !== currentIndex) {
            onChange(options[nextIndex].value)
          }
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) {
          // Move to previous option
          const currentIndex = options.findIndex((opt) => opt.value === value)
          const prevIndex = Math.max(currentIndex - 1, 0)
          if (prevIndex !== currentIndex) {
            onChange(options[prevIndex].value)
          }
        }
        break
    }
  }

  const containerClasses = [
    'wireframe-select-container',
    `wireframe-select-container-${size}`,
    disabled ? 'wireframe-select-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const triggerClasses = [
    'wireframe-select-trigger',
    `wireframe-select-trigger-${size}`,
    isOpen ? 'wireframe-select-trigger-open' : '',
    disabled ? 'wireframe-select-trigger-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const selectId = id || `wireframe-select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div
      className={containerClasses}
      style={{
        display: 'flex',
        alignItems: labelPosition === 'top' || labelPosition === 'none' ? 'stretch' : 'center',
        gap: label && labelPosition !== 'none' ? '0.5em' : 0,
        flexDirection:
          labelPosition === 'top'
            ? 'column'
            : labelPosition === 'right'
            ? 'row-reverse'
            : labelPosition === 'left'
            ? 'row'
            : 'row',
      }}
    >
      {label && labelPosition !== 'none' && (
        <label
          htmlFor={selectId}
          className="wireframe-select-label"
          style={{
            alignSelf:
              labelPosition === 'top'
                ? 'flex-start'
                : labelPosition === 'right'
                ? 'center'
                : labelPosition === 'left'
                ? 'center'
                : undefined,
            marginBottom: labelPosition === 'top' ? '0.25em' : 0,
            marginLeft: labelPosition === 'right' ? '0.5em' : 0,
            marginRight: labelPosition === 'left' ? '0.5em' : 0,
          }}
        >
          {label}
        </label>
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
        <div className={triggerClasses} onClick={handleToggle}>
          <span className="wireframe-select-value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="wireframe-select-arrow"></span>
        </div>

        {isOpen &&
          typeof window !== 'undefined' &&
          createPortal(
            <div className="wireframe-select-dropdown" ref={dropdownRef} style={dropdownStyle}>
              <div className="wireframe-select-options" role="listbox">
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={`wireframe-select-option ${
                      option.value === value ? 'wireframe-select-option-selected' : ''
                    }`}
                    onClick={() => handleOptionClick(option)}
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
          )}
      </div>
    </div>
  )
}

export default WireframeSelect
