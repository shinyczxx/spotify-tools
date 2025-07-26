/**
 * @file useDropdownPosition.ts
 * @description Custom hook for positioning dropdown menus
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useEffect, useState } from 'react'

interface UseDropdownPositionProps {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLElement>
}

/**
 * Custom hook for calculating optimal dropdown positioning
 */
export const useDropdownPosition = ({ isOpen, triggerRef }: UseDropdownPositionProps) => {
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const dropdownHeight = 200 // Approximate dropdown height
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      
      // Check if dropdown would overflow horizontally
      const dropdownWidth = Math.max(rect.width, 150)
      const spaceRight = window.innerWidth - rect.left
      const shouldShiftLeft = spaceRight < dropdownWidth

      // Determine if dropdown should go up or down
      const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

      setDropdownStyle({
        position: 'fixed', // Use fixed instead of absolute for better portal positioning
        top: shouldDropUp
          ? rect.top - dropdownHeight
          : rect.bottom,
        left: shouldShiftLeft
          ? Math.max(0, rect.right - dropdownWidth)
          : rect.left,
        minWidth: rect.width,
        maxWidth: Math.min(dropdownWidth, spaceRight - 10),
        zIndex: 9999,
        border: '1px solid var(--terminal-cyan)',
        background: 'var(--terminal-bg)',
        maxHeight: '200px',
        overflowY: 'auto',
        boxShadow: '0 4px 12px rgba(0, 255, 255, 0.2)',
      })
    }
  }, [isOpen, triggerRef])

  return { dropdownStyle }
}