/**
 * @file usePagination.ts
 * @description Custom hook for pagination logic and state management
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted pagination pattern from PlaylistSelector component
 */

import { useState, useMemo, useCallback } from 'react'

export interface UsePaginationOptions {
  initialPage?: number
  itemsPerPage?: number
}

export interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  startIndex: number
  endIndex: number
  paginatedItems: T[]
  canGoNext: boolean
  canGoPrevious: boolean
  goToPage: (page: number) => void
  goToNext: () => void
  goToPrevious: () => void
  goToFirst: () => void
  goToLast: () => void
  setItemsPerPage: (count: number) => void
}

/**
 * Custom hook for managing pagination state and logic
 * @param items - Array of items to paginate
 * @param options - Configuration options
 * @returns Object with pagination state and control functions
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialPage = 1, itemsPerPage: initialItemsPerPage = 10 } = options
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / itemsPerPage) || 1
  }, [items.length, itemsPerPage])

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage
  }, [currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage, items.length)
  }, [startIndex, itemsPerPage, items.length])

  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex)
  }, [items, startIndex, endIndex])

  const canGoNext = currentPage < totalPages
  const canGoPrevious = currentPage > 1

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }, [totalPages])

  const goToNext = useCallback(() => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1)
    }
  }, [canGoNext])

  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      setCurrentPage(prev => prev - 1)
    }
  }, [canGoPrevious])

  const goToFirst = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const goToLast = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  const handleSetItemsPerPage = useCallback((count: number) => {
    setItemsPerPage(count)
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(items.length / count) || 1
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages)
    }
  }, [items.length, currentPage])

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    paginatedItems,
    canGoNext,
    canGoPrevious,
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    setItemsPerPage: handleSetItemsPerPage,
  }
}