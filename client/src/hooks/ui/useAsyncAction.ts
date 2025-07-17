/**
 * @file useAsyncAction.ts
 * @description Custom hook for handling async actions with loading states and error handling
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted common async action pattern from multiple components
 */

import { useState, useCallback } from 'react'

export interface UseAsyncActionOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  throwOnError?: boolean
}

export interface UseAsyncActionReturn<T = any> {
  execute: (action: () => Promise<T>) => Promise<T | null>
  isLoading: boolean
  error: Error | null
  clearError: () => void
}

/**
 * Custom hook for executing async actions with automatic loading state and error handling
 * @param options - Configuration options for success/error callbacks
 * @returns Object with execute function and state
 */
export function useAsyncAction<T = any>(
  options: UseAsyncActionOptions = {}
): UseAsyncActionReturn<T> {
  const { onSuccess, onError, throwOnError = false } = options
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (action: () => Promise<T>): Promise<T | null> => {
      if (isLoading) {
        console.warn('Action already in progress')
        return null
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await action()
        
        if (onSuccess) {
          onSuccess(result)
        }
        
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        
        if (onError) {
          onError(error)
        }
        
        if (throwOnError) {
          throw error
        }
        
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, onSuccess, onError, throwOnError]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    clearError,
  }
}