/**
 * @file useBreakpoint.ts
 * @description Custom hook for responsive breakpoint detection
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - 1.0.0: Initial extraction from ControlledFlowLayout.tsx
 */

import { useState, useCallback } from 'react'
export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
}

export function useBreakpoint(initialWidth: number): [Breakpoint, (width: number) => void] {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
    if (initialWidth <= BREAKPOINTS.mobile) return 'mobile'
    if (initialWidth <= BREAKPOINTS.tablet) return 'tablet'
    return 'desktop'
  })

  const updateBreakpoint = useCallback((width: number) => {
    if (width <= BREAKPOINTS.mobile) {
      setCurrentBreakpoint('mobile')
    } else if (width <= BREAKPOINTS.tablet) {
      setCurrentBreakpoint('tablet')
    } else {
      setCurrentBreakpoint('desktop')
    }
  }, [])

  return [currentBreakpoint, updateBreakpoint]
}
