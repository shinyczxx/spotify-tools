/**
 * @file useAnimatedProgress.ts
 * @description Custom hook for animating progress changes
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect } from 'react'

interface UseAnimatedProgressProps {
  progress: number
  animated: boolean
}

/**
 * Custom hook for smoothly animating progress value changes
 */
export const useAnimatedProgress = ({ progress, animated }: UseAnimatedProgressProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(progress)
    }
  }, [progress, animated])

  return { animatedProgress }
}