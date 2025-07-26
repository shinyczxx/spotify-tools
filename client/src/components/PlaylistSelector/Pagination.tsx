/**
 * @file Pagination.tsx
 * @description Pagination controls for PlaylistSelector component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeSelect, WireframeButton } from '../wireframe'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
  isFirstPage: boolean
  isLastPage: boolean
  hasMultiplePages: boolean
}

/**
 * Pagination controls with page navigation and items per page selector
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isFirstPage,
  isLastPage,
  hasMultiplePages,
}) => {
  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div className="pagination">
      <WireframeButton
        onClick={handlePrevious}
        disabled={isFirstPage || !hasMultiplePages}
        className="page-btn"
        title="previous page"
      >
        previous
      </WireframeButton>

      <span className="page-info">
        {hasMultiplePages
          ? `page ${currentPage} of ${totalPages}`
          : `${totalItems} item${totalItems !== 1 ? 's' : ''}`}
        {hasMultiplePages && ` (${totalItems} total)`}
      </span>

      <div className="per-page-next-button-holder">
        <WireframeSelect
          value={itemsPerPage}
          onChange={(value) => onItemsPerPageChange(Number(value))}
          options={[
            { value: 5, label: '5' },
            { value: 10, label: '10' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
          ]}
          label="per page:"
          labelPosition="left"
          size="small"
          className="items-per-page-select"
        />
        <WireframeButton
          onClick={handleNext}
          disabled={isLastPage || !hasMultiplePages}
          className="page-btn"
          title="next page"
        >
          next
        </WireframeButton>
      </div>
    </div>
  )
}