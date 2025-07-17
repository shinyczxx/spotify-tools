/**
 * @file useBreakpoint.ts
 * @description Custom hook for responsive breakpoint detection
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - 1.0.0: Initial extraction from ControlledFlowLayout.tsx
 */

import { useState, useCallback } from 'react'
import { GRID_CONFIG } from '@config/flowLayoutConfig'

export type Breakpoint = 'mobile' | 'tablet' | 'desktop'

export function useBreakpoint(initialWidth: number): [Breakpoint, (width: number) => void] {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(() => {
    if (initialWidth <= GRID_CONFIG.mobileBreakpoint) return 'mobile'
    if (initialWidth <= GRID_CONFIG.tabletBreakpoint) return 'tablet'
    return 'desktop'
  })

  const updateBreakpoint = useCallback((width: number) => {
    if (width <= GRID_CONFIG.mobileBreakpoint) {
      setCurrentBreakpoint('mobile')
    } else if (width <= GRID_CONFIG.tabletBreakpoint) {
      setCurrentBreakpoint('tablet')
    } else {
      setCurrentBreakpoint('desktop')
    }
  }, [])

  return [currentBreakpoint, updateBreakpoint]
}
