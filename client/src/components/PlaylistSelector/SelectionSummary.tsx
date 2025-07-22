/**
 * @file SelectionSummary.tsx
 * @description Selection summary and controls for PlaylistSelector component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton } from '../wireframe'

interface SelectionSummaryProps {
  type: 'playlist' | 'album'
  selectedCount: number
  onDeselectAll: () => void
  searchValue?: string
  onSearchChange?: (value: string) => void
  onRefresh?: () => void
  showRefresh?: boolean
}

/**
 * Displays selection count and provides deselect all functionality
 */
export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  type,
  selectedCount,
  onDeselectAll,
  searchValue = '',
  onSearchChange,
  onRefresh,
  showRefresh = false,
}) => {
  return (
    <div className="select-summary">
      <div className="selection-info">
        <span className="selection-count">
          {selectedCount} {type === 'playlist' ? 'playlist' : 'album'}
          {selectedCount !== 1 ? 's' : ''} selected
        </span>
        {selectedCount > 0 && (
          <button
            className="deselect-all-btn"
            onClick={onDeselectAll}
            title="deselect all items"
            aria-label="deselect all items"
            type="button"
          >
            deselect all
          </button>
        )}
      </div>

      {/* Search and Refresh Controls */}
      {(onSearchChange || onRefresh) && (
        <div className="search-refresh-controls">
          {/* Search input */}
          {onSearchChange && (
            <input
              type="text"
              placeholder={`search ${type}s...`}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input"
            />
          )}

          {/* Refresh button */}
          {showRefresh && onRefresh && (
            <WireframeButton
              onClick={onRefresh}
              className="refresh-btn"
            >
              Refresh Cache
            </WireframeButton>
          )}
        </div>
      )}
    </div>
  )
}