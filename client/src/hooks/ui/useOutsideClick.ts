/**
 * @file useOutsideClick.ts
 * @description Custom hook for detecting clicks outside elements
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useEffect } from 'react'

interface UseOutsideClickProps {
  refs: React.RefObject<HTMLElement>[]
  onOutsideClick: () => void
}

/**
 * Custom hook for detecting clicks outside specified elements
 */
export const useOutsideClick = ({ refs, onOutsideClick }: UseOutsideClickProps) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      )

      if (isOutside) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [refs, onOutsideClick])
}