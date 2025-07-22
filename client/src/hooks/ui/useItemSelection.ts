/**
 * @file useItemSelection.ts
 * @description Custom hook for item selection logic and state management
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useMemo, useCallback } from 'react'

export interface UseItemSelectionProps<T extends { id: string }> {
  items: T[]
  selectedItems: string[]
  onSelectionChange: (itemId: string, selected: boolean) => void
  onDeselectAll: (itemIds: string[]) => void
}

export interface UseItemSelectionReturn<T extends { id: string }> {
  // Computed values
  selectedOnCurrentPage: number
  isAllSelected: boolean
  isPartiallySelected: boolean
  
  // Actions
  handleSelectAll: () => void
  handleDeselectAll: () => void
}

/**
 * Custom hook for managing item selection state and logic
 */
export const useItemSelection = <T extends { id: string }>({
  items,
  selectedItems,
  onSelectionChange,
  onDeselectAll,
}: UseItemSelectionProps<T>): UseItemSelectionReturn<T> => {
  
  // Computed selection state
  const selectedOnCurrentPage = useMemo(() => {
    return items.filter((item) => selectedItems.includes(item.id)).length
  }, [items, selectedItems])

  const isAllSelected = useMemo(() => {
    return selectedOnCurrentPage === items.length && items.length > 0
  }, [selectedOnCurrentPage, items.length])

  const isPartiallySelected = useMemo(() => {
    return selectedOnCurrentPage > 0 && selectedOnCurrentPage < items.length
  }, [selectedOnCurrentPage, items.length])

  // Actions
  const handleSelectAll = useCallback(() => {
    const allSelected = items.every((item) => selectedItems.includes(item.id))
    items.forEach((item) => {
      onSelectionChange(item.id, !allSelected)
    })
  }, [items, selectedItems, onSelectionChange])

  const handleDeselectAll = useCallback(() => {
    onDeselectAll(selectedItems)
  }, [selectedItems, onDeselectAll])

  return {
    // Computed values
    selectedOnCurrentPage,
    isAllSelected,
    isPartiallySelected,
    
    // Actions
    handleSelectAll,
    handleDeselectAll,
  }
}