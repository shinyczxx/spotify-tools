/**
 * @file useTableSort.ts
 * @description Custom hook for table sorting logic and state management
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useMemo, useCallback } from 'react'

export type SortBy = 'default' | 'name' | 'tracks' | 'date' | 'owner'
export type SortOrder = 'asc' | 'desc'

export interface UseTableSortProps<T> {
  items: T[]
  initialSortBy?: SortBy
  initialSortOrder?: SortOrder
  sortFunction: (items: T[], sortBy: SortBy, sortOrder: SortOrder, type: string) => T[]
  type: string
}

export interface UseTableSortReturn<T> {
  // State
  sortBy: SortBy
  sortOrder: SortOrder
  
  // Computed values
  sortedItems: T[]
  
  // Actions
  handleSort: (column: string) => void
  getSortIndicator: (column: string) => string
}

/**
 * Custom hook for managing table sorting state and logic
 * Implements 3-state sorting: default -> asc -> desc -> default
 */
export const useTableSort = <T>({
  items,
  initialSortBy = 'default',
  initialSortOrder = 'desc',
  sortFunction,
  type,
}: UseTableSortProps<T>): UseTableSortReturn<T> => {
  const [sortBy, setSortBy] = useState<SortBy>(initialSortBy)
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder)

  // Memoized sorted items
  const sortedItems = useMemo(
    () => sortFunction(items, sortBy, sortOrder, type),
    [items, sortBy, sortOrder, type, sortFunction],
  )

  // 3-state sort: default -> asc -> desc -> default
  const handleSort = useCallback((column: string) => {
    if (column === 'default') {
      setSortBy('default')
      setSortOrder('asc')
    } else if (sortBy !== column) {
      setSortBy(column as SortBy)
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortBy('default')
      setSortOrder('asc')
    }
  }, [sortBy, sortOrder])

  const getSortIndicator = useCallback((column: string) => {
    if (sortBy !== column || column === 'default') return ''
    if (sortOrder === 'asc') return ' ↑'
    if (sortOrder === 'desc') return ' ↓'
    return ''
  }, [sortBy, sortOrder])

  return {
    // State
    sortBy,
    sortOrder,
    
    // Computed values
    sortedItems,
    
    // Actions
    handleSort,
    getSortIndicator,
  }
}