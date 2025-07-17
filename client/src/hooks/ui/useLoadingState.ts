/**
 * @file useLoadingState.ts
 * @description Custom hook for managing loading states with progress tracking
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted common loading state pattern from multiple components
 */

import { useState, useCallback } from 'react'

export interface LoadingProgress {
  current: number
  total: number
  message?: string
}

export interface UseLoadingStateReturn {
  isLoading: boolean
  isProcessing: boolean
  progress: LoadingProgress
  error: string | null
  setLoading: (loading: boolean) => void
  setProcessing: (processing: boolean) => void
  setProgress: (progress: Partial<LoadingProgress>) => void
  setError: (error: string | null) => void
  resetState: () => void
}

/**
 * Custom hook for managing loading, processing, and progress states
 * @param initialProgress - Initial progress values
 * @returns Object with loading state and control functions
 */
export function useLoadingState(
  initialProgress: LoadingProgress = { current: 0, total: 0 }
): UseLoadingStateReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgressState] = useState<LoadingProgress>(initialProgress)
  const [error, setError] = useState<string | null>(null)

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
    if (loading) {
      setError(null)
    }
  }, [])

  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing)
    if (processing) {
      setError(null)
    }
  }, [])

  const setProgress = useCallback((newProgress: Partial<LoadingProgress>) => {
    setProgressState(prev => ({ ...prev, ...newProgress }))
  }, [])

  const resetState = useCallback(() => {
    setIsLoading(false)
    setIsProcessing(false)
    setProgressState(initialProgress)
    setError(null)
  }, [initialProgress])

  return {
    isLoading,
    isProcessing,
    progress,
    error,
    setLoading,
    setProcessing,
    setProgress,
    setError,
    resetState,
  }
}