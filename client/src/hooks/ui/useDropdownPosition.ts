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

      // Determine if dropdown should go up or down
      const shouldDropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

      setDropdownStyle({
        position: 'absolute',
        top: shouldDropUp
          ? rect.top + window.scrollY - dropdownHeight
          : rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        minWidth: rect.width,
        zIndex: 9999,
        border: '1px solid var(--terminal-cyan)',
        background: 'var(--terminal-bg)',
        maxHeight: '200px',
        overflowY: 'auto',
      })
    }
  }, [isOpen, triggerRef])

  return { dropdownStyle }
}