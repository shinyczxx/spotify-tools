/**
 * @file useSelectKeyboard.ts
 * @description Custom hook for keyboard navigation in select dropdowns
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { WireframeSelectOption } from '../../components/wireframe/WireframeSelect/WireframeSelect'

interface UseSelectKeyboardProps {
  disabled: boolean
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  options: WireframeSelectOption[]
  value: string | number
  onChange: (value: string | number) => void
}

/**
 * Custom hook for handling keyboard navigation in select components
 */
export const useSelectKeyboard = ({
  disabled,
  isOpen,
  onToggle,
  onClose,
  options,
  value,
  onChange,
}: UseSelectKeyboardProps) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onToggle()
        break
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          onToggle()
        } else {
          // Move to next option
          const currentIndex = options.findIndex((opt) => opt.value === value)
          const nextIndex = Math.min(currentIndex + 1, options.length - 1)
          if (nextIndex !== currentIndex) {
            onChange(options[nextIndex].value)
          }
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (isOpen) {
          // Move to previous option
          const currentIndex = options.findIndex((opt) => opt.value === value)
          const prevIndex = Math.max(currentIndex - 1, 0)
          if (prevIndex !== currentIndex) {
            onChange(options[prevIndex].value)
          }
        }
        break
    }
  }

  return { handleKeyDown }
}