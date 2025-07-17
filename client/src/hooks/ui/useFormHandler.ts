/**
 * @file useFormHandler.ts
 * @description Custom hook for handling form input changes with state management
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted common form handling pattern from multiple components
 */

import { useCallback } from 'react'

export interface UseFormHandlerOptions<T> {
  setState: React.Dispatch<React.SetStateAction<T>>
  validateField?: (name: string, value: any) => string | null
}

export interface UseFormHandlerReturn {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  handleFieldChange: (name: string, value: any) => void
}

/**
 * Custom hook for handling form input changes with automatic state updates
 * @param options - Configuration options including setState function
 * @returns Object with input change handlers
 */
export function useFormHandler<T extends Record<string, any>>(
  options: UseFormHandlerOptions<T>
): UseFormHandlerReturn {
  const { setState, validateField } = options

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target
      const processedValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
        ? parseFloat(value) || 0
        : value

      // Run validation if provided
      if (validateField) {
        const error = validateField(name, processedValue)
        if (error) {
          console.warn(`Validation error for ${name}: ${error}`)
          return
        }
      }

      setState(prev => ({ ...prev, [name]: processedValue }))
    },
    [setState, validateField]
  )

  const handleFieldChange = useCallback(
    (name: string, value: any) => {
      // Run validation if provided
      if (validateField) {
        const error = validateField(name, value)
        if (error) {
          console.warn(`Validation error for ${name}: ${error}`)
          return
        }
      }

      setState(prev => ({ ...prev, [name]: value }))
    },
    [setState, validateField]
  )

  return {
    handleInputChange,
    handleFieldChange,
  }
}