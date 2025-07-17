/**
 * @file WireframeCheckbox.tsx
 * @description SVG-based wireframe themed checkbox component with 80s terminal aesthetic
 * @author Caleb Price
 * @version 2.1.0
 * @date 2025-07-07
 *
 * @UsedBy
 * - AlbumShuffleFilters.tsx
 * - PlaylistCombinerModal.tsx
 * - PlaylistSelector.tsx
 * - Any component needing checkbox inputs
 *
 * @ChangeLog
 * - 2.1.0: Updated to use external SVG icon from assets
 * - 2.0.0: Enhanced with SVG-based checkbox for authentic 80s terminal look
 * - 1.0.0: Initial implementation with wireframe checkbox styling
 */
import React, { forwardRef, useEffect, useRef } from 'react'
import { CheckboxIcon } from '@icons'
import '../styles/select-checkbox-merged.css'

export interface WireframeCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  labelClassName?: string
  checkboxClassName?: string
  containerClassName?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'compact'
}

export const WireframeCheckbox = forwardRef<
  HTMLInputElement,
  WireframeCheckboxProps & { indeterminate?: boolean }
>(
  (
    {
      label,
      labelClassName = '',
      checkboxClassName = '',
      containerClassName = '',
      size = 'medium',
      variant = 'default',
      id,
      className = '',
      checked,
      indeterminate = false,
      onChange,
      ...props
    },
    ref,
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
    const inputRef = useRef<HTMLInputElement>(null)
    // Support both forwarded ref and local ref
    useEffect(() => {
      const el = (
        ref && typeof ref !== 'function' ? ref.current : inputRef.current
      ) as HTMLInputElement | null
      if (el) {
        el.indeterminate = !!indeterminate && !checked
      }
    }, [indeterminate, checked, ref])
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e)
      }
    }

    const containerClasses = [
      'wireframe-checkbox-container',
      `wireframe-checkbox-container-${size}`,
      `wireframe-checkbox-container-${variant}`,
      containerClassName,
    ]
      .filter(Boolean)
      .join(' ')

    const checkboxClasses = [
      'wireframe-checkbox',
      `wireframe-checkbox-${size}`,
      checkboxClassName,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const labelClasses = [
      'wireframe-checkbox-label',
      `wireframe-checkbox-label-${size}`,
      labelClassName,
    ]
      .filter(Boolean)
      .join(' ')

    const CheckboxSVG = () => (
      <CheckboxIcon
        checked={checked || false}
        size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
        className="wireframe-checkbox-svg"
      />
    )
    if (label) {
      return (
        <div className={containerClasses}>
          <div className="wireframe-checkbox-wrapper">
            <input
              type="checkbox"
              id={checkboxId}
              className={checkboxClasses}
              ref={ref || inputRef}
              checked={checked || false}
              onChange={handleChange}
              {...props}
            />
            <CheckboxSVG />
          </div>
          <label htmlFor={checkboxId} className={labelClasses}>
            {label}
          </label>
        </div>
      )
    }
    return (
      <div className="wireframe-checkbox-wrapper">
        <input
          type="checkbox"
          id={checkboxId}
          className={checkboxClasses}
          ref={ref || inputRef}
          checked={checked || false}
          onChange={handleChange}
          {...props}
        />
        <CheckboxSVG />
      </div>
    )
  },
)

WireframeCheckbox.displayName = 'WireframeCheckbox'

export default WireframeCheckbox
