/**
 * @file useLoadingDots.ts
 * @description Custom hook for animated loading dots
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect } from 'react'

export interface UseLoadingDotsProps {
  isLoading: boolean
  interval?: number
}

/**
 * Custom hook for animated loading dots (...) effect
 */
export const useLoadingDots = ({
  isLoading,
  interval = 500,
}: UseLoadingDotsProps): string => {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setDots((prev) => {
          if (prev === '...') return ''
          return prev + '.'
        })
      }, interval)
      
      return () => clearInterval(intervalId)
    } else {
      setDots('')
    }
  }, [isLoading, interval])

  return dots
}