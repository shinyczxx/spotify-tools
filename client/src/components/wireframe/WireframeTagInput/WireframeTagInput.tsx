/**
 * @file WireframeTagInput.tsx
 * @description Tag input component for wireframe UI that allows users to add/remove tags
 * with suggestions and validation
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import './WireframeTagInput.css'

export interface WireframeTagInputProps {
  /** Current tags */
  tags: string[]
  /** Callback when tags change */
  onTagsChange: (tags: string[]) => void
  /** Placeholder text for input */
  placeholder?: string
  /** Maximum number of tags allowed */
  maxTags?: number
  /** Suggested tags to show */
  suggestions?: string[]
  /** Function to validate a tag */
  validateTag?: (tag: string) => boolean | string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Whether to show suggestions dropdown */
  showSuggestions?: boolean
}

export const WireframeTagInput: React.FC<WireframeTagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags,
  suggestions = [],
  validateTag,
  disabled = false,
  className = '',
  showSuggestions = true,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input and existing tags
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion) &&
      inputValue.length > 0
  )

  // Handle adding a tag
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase()
    
    if (!trimmedTag) return
    
    // Check for duplicates
    if (tags.includes(trimmedTag)) {
      setValidationError('Tag already exists')
      return
    }
    
    // Check max tags limit
    if (maxTags && tags.length >= maxTags) {
      setValidationError(`Maximum ${maxTags} tags allowed`)
      return
    }
    
    // Validate tag if validator provided
    if (validateTag) {
      const validation = validateTag(trimmedTag)
      if (validation !== true) {
        setValidationError(typeof validation === 'string' ? validation : 'Invalid tag')
        return
      }
    }
    
    // Add the tag
    onTagsChange([...tags, trimmedTag])
    setInputValue('')
    setValidationError(null)
    setShowDropdown(false)
  }

  // Handle removing a tag
  const removeTag = (indexToRemove: number) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove))
  }

  // Handle key press events
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove last tag on backspace when input is empty
      removeTag(tags.length - 1)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setInputValue('')
    }
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setValidationError(null)
    
    if (showSuggestions && filteredSuggestions.length > 0) {
      setShowDropdown(true)
    } else {
      setShowDropdown(false)
    }
  }

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      setShowDropdown(true)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`wireframe-tag-input ${className}`}>
      <div className="wireframe-tag-input-container">
        {/* Render existing tags */}
        <div className="wireframe-tag-input-tags">
          {tags.map((tag, index) => (
            <span key={index} className="wireframe-tag-input-tag">
              <span className="wireframe-tag-input-tag-text">{tag}</span>
              <button
                type="button"
                className="wireframe-tag-input-tag-remove"
                onClick={() => removeTag(index)}
                disabled={disabled}
                aria-label={`Remove tag ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          className="wireframe-tag-input-field"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={tags.length === 0 ? placeholder : ''}
          disabled={disabled || (maxTags ? tags.length >= maxTags : false)}
        />
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div ref={dropdownRef} className="wireframe-tag-input-dropdown">
          {filteredSuggestions.slice(0, 8).map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="wireframe-tag-input-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="wireframe-tag-input-error">
          {validationError}
        </div>
      )}

      {/* Tag count indicator */}
      {maxTags && (
        <div className="wireframe-tag-input-count">
          {tags.length}/{maxTags} tags
        </div>
      )}
    </div>
  )
}