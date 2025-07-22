/**
 * @file SelectLabel.tsx
 * @description Label component for wireframe select
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface SelectLabelProps {
  label: string
  htmlFor: string
  labelPosition: 'left' | 'right' | 'top' | 'none'
}

/**
 * Styled label for select components with position-aware styling
 */
export const SelectLabel: React.FC<SelectLabelProps> = ({
  label,
  htmlFor,
  labelPosition,
}) => (
  <label
    htmlFor={htmlFor}
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
)