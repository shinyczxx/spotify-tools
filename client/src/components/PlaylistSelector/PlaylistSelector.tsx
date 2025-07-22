/**
 * @file PlaylistSelector.tsx
 * @description Global selectable table component for albums or playlists
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 * 
 * @ChangeLog
 * - 2.0.0: Modularized component - extracted hooks and sub-components
 * - 1.0.0: Initial implementation with integrated table functionality
 */

import React, { useMemo } from 'react'
import { sortPlaylistSelectorItems } from './playlistSelectorUtils'
import { usePagination } from '../../hooks/ui/usePagination'
import { useTableSort } from '../../hooks/ui/useTableSort'
import { useItemSelection } from '../../hooks/ui/useItemSelection'
import { DynamicTableHeader, TableHeaderConfig } from './tableHeaderUtils'
import { TableCell } from './TableCell'
import { SelectionSummary } from './SelectionSummary'
import { ActionButtons } from './ActionButtons'
import { Pagination } from './Pagination'
import './PlaylistSelector.css'
import type { BaseItem, PlaylistItem, AlbumItem } from 'types/playlist'

// Re-export types for backward compatibility
export type { BaseItem, PlaylistItem, AlbumItem }

interface PlaylistSelectorProps {
  type: 'playlist' | 'album'
  items: PlaylistItem[] | AlbumItem[]
  selectedItems: string[]
  onSelectionChange: (itemId: string, selected: boolean) => void
  onDeselectAll: (itemIds: string[]) => void
  itemsPerPage?: number
  showActionButton?: boolean
  onActionClick?: (forceRefresh?: boolean) => void
  isProcessing?: boolean
  showForceRefresh?: boolean
  actionButtonText?: string
  forceRefreshText?: string
  headerConfigs: TableHeaderConfig[]
  // New props for integrated search and refresh
  searchValue?: string
  onSearchChange?: (value: string) => void
  onRefresh?: () => void
  showRefresh?: boolean
  showDeselectAll?: boolean
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  type,
  items,
  selectedItems,
  onSelectionChange,
  onDeselectAll,
  itemsPerPage = 10,
  showActionButton = false,
  onActionClick,
  isProcessing = false,
  showForceRefresh = false,
  actionButtonText = 'Create',
  forceRefreshText = 'Force Refresh',
  headerConfigs,
  // New integrated search and refresh props
  searchValue = '',
  onSearchChange,
  onRefresh,
  showRefresh = false,
  showDeselectAll = false,
}) => {
  // Extract sorting logic
  const {
    sortBy,
    sortOrder,
    sortedItems,
    handleSort,
    getSortIndicator,
  } = useTableSort({
    items,
    sortFunction: sortPlaylistSelectorItems,
    type,
  })

  // Extract pagination logic
  const {
    currentPage,
    totalPages,
    itemsPerPage: currentItemsPerPage,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage: handleItemsPerPageChange,
    isFirstPage,
    isLastPage,
    hasMultiplePages,
  } = usePagination({
    items: sortedItems,
    initialItemsPerPage: itemsPerPage,
  })

  // Extract selection logic
  const {
    isAllSelected,
    isPartiallySelected,
    handleSelectAll,
    handleDeselectAll,
  } = useItemSelection({
    items: paginatedItems,
    selectedItems,
    onSelectionChange,
    onDeselectAll,
  })

  // Calculate proportional grid-template-columns string for columns
  const gridTemplateColumns = useMemo(() => {
    return headerConfigs
      .map((h) => {
        if (h.minWidth) return `${h.minWidth}px`
        if (h.widthWeight) return `${h.widthWeight}fr`
        return '1fr'
      })
      .join(' ')
  }, [headerConfigs])

  return (
    <div className="album-playlist-select">
      {/* CRITICAL NOTE: DO NOT WRAP THIS COMPONENT IN ANY PANEL - IT IS THE PANEL */}

      {/* Selection Summary and Controls */}
      <SelectionSummary
        type={type}
        selectedCount={selectedItems.length}
        onDeselectAll={handleDeselectAll}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onRefresh={onRefresh}
        showRefresh={showRefresh}
      />

      {/* Action Buttons */}
      <ActionButtons
        selectedItems={selectedItems}
        showActionButton={showActionButton}
        onActionClick={onActionClick}
        isProcessing={isProcessing}
        showForceRefresh={showForceRefresh}
        actionButtonText={actionButtonText}
        forceRefreshText={forceRefreshText}
      />

      {/* Items Table */}
      <div className="items-table" style={{ ['--playlist-grid' as any]: gridTemplateColumns, ['--album-grid' as any]: gridTemplateColumns }}>
        {/* Header */}
        <DynamicTableHeader
          headerConfigs={headerConfigs}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          getSortIndicator={getSortIndicator}
          isAllSelected={isAllSelected}
          isPartiallySelected={isPartiallySelected}
          onSelectAll={handleSelectAll}
          className={type === 'playlist' ? 'playlist-layout' : 'album-layout'}
        />
        
        {/* Scrollable Table Body */}
        <div className="table-body">
          {paginatedItems.map((item) => {
            const isSelected = selectedItems.includes(item.id)
            const isPlaylist = type === 'playlist'
            const nameNeedsTruncation = item.name.length > 40

            return (
              <div
                key={item.id}
                className={`table-row ${isSelected ? 'selected' : ''} ${
                  type === 'playlist' ? 'playlist-layout' : 'album-layout'
                }`}
                onClick={() => onSelectionChange(item.id, !isSelected)}
                role="row"
                aria-selected={isSelected}
                tabIndex={0}
              >
                {headerConfigs.map((header) => (
                  <div
                    key={header.key}
                    className={`table-row-cell ${header.className || ''} ${header.colClass || ''}`.trim()}
                    role="cell"
                  >
                    <TableCell
                      header={header}
                      item={item}
                      isSelected={isSelected}
                      isPlaylist={isPlaylist}
                      nameNeedsTruncation={nameNeedsTruncation}
                      onSelectionToggle={() => onSelectionChange(item.id, !isSelected)}
                    />
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedItems.length}
        itemsPerPage={currentItemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        hasMultiplePages={hasMultiplePages}
      />
    </div>
  )
}

export default PlaylistSelector
