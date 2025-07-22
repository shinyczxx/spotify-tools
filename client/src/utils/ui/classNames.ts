/**
 * @file classNames.ts
 * @description Utility functions for CSS class name manipulation
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted from WireframeCheckbox and other components
 */

/**
 * Concatenates class names, filtering out falsy values
 * @param classes - Array of class names (can include undefined, false, or empty strings)
 * @returns Combined class string
 */
export const cx = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Conditionally applies classes based on boolean conditions
 * @param baseClasses - Base class names that are always applied
 * @param conditionalClasses - Object with class names as keys and boolean conditions as values
 * @returns Combined class string
 */
export const conditionalClasses = (
  baseClasses: string,
  conditionalClasses: Record<string, boolean>
): string => {
  const conditional = Object.entries(conditionalClasses)
    .filter(([, condition]) => condition)
    .map(([className]) => className)
    .join(' ')
  
  return cx(baseClasses, conditional)
}

/**
 * Creates a class name based on a variant system
 * @param base - Base class name
 * @param variant - Variant name
 * @param size - Optional size modifier
 * @returns Formatted class string
 */
export const variantClass = (
  base: string,
  variant?: string,
  size?: string
): string => {
  return cx(
    base,
    variant && `${base}--${variant}`,
    size && `${base}--${size}`
  )
}