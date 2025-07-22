/**
 * @file SelectTrigger.tsx
 * @description Trigger button for wireframe select
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface SelectTriggerProps {
  isOpen: boolean
  disabled: boolean
  size: 'small' | 'medium' | 'large'
  selectedLabel: string
  placeholder: string
  onClick: () => void
}

/**
 * Clickable trigger for opening/closing select dropdown
 */
export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  isOpen,
  disabled,
  size,
  selectedLabel,
  placeholder,
  onClick,
}) => {
  const triggerClasses = [
    'wireframe-select-trigger',
    `wireframe-select-trigger-${size}`,
    isOpen ? 'wireframe-select-trigger-open' : '',
    disabled ? 'wireframe-select-trigger-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={triggerClasses} onClick={onClick}>
      <span className="wireframe-select-value">
        {selectedLabel || placeholder}
      </span>
      <span className="wireframe-select-arrow"></span>
    </div>
  )
}