/**
 * @file PlaylistSelector.tsx
 * @description Global selectable table component for albums or
 * playlists with thumbnail, metadata columns, and electric blue
 * highlighting for selected items. Supports force refresh
 * functionality for cached results and is used across shuffle and
 * combiner pages.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import React, { useState, useMemo } from 'react'
import { HoverDisplay } from '../HoverDisplay'
import { WireframeCheckbox, WireframeSelect, WireframeButton } from '../wireframe'
import {
  cleanDescription,
  decodeHtmlEntities,
  stripHtmlTags,
  sortPlaylistSelectorItems,
} from './playlistSelectorUtils'
import './PlaylistSelector.css'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import { DynamicTableHeader, TableHeaderConfig } from './tableHeaderUtils'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'tracks' | 'date' | 'owner'>('default')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage)

  // Memoized sorted and paginated items
  const sortedItems = useMemo(
    () => sortPlaylistSelectorItems(items, sortBy, sortOrder, type),
    [items, sortBy, sortOrder, type],
  )

  const totalPages = Math.ceil(sortedItems.length / currentItemsPerPage)
  const startIndex = (currentPage - 1) * currentItemsPerPage
  const paginatedItems = sortedItems.slice(startIndex, startIndex + currentItemsPerPage)

  // 3-state sort: default -> asc -> desc -> default
  const handleSort = (column: string) => {
    if (column === 'default') {
      setSortBy('default')
      setSortOrder('asc')
    } else if (sortBy !== column) {
      setSortBy(column as typeof sortBy)
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortBy('default')
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handleSelectAll = () => {
    const allSelected = paginatedItems.every((item) => selectedItems.includes(item.id))
    paginatedItems.forEach((item) => {
      onSelectionChange(item.id, !allSelected)
    })
  }

  const handleDeselectAll = () => {
    onDeselectAll(selectedItems)
  }

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const getSortIndicator = (column: string) => {
    if (sortBy !== column || column === 'default') return ''
    if (sortOrder === 'asc') return ' ↑'
    if (sortOrder === 'desc') return ' ↓'
    return ''
  }

  const selectedOnCurrentPage = paginatedItems.filter((item) =>
    selectedItems.includes(item.id),
  ).length
  const isAllSelected = selectedOnCurrentPage === paginatedItems.length && paginatedItems.length > 0
  const isPartiallySelected =
    selectedOnCurrentPage > 0 && selectedOnCurrentPage < paginatedItems.length

  // Calculate proportional grid-template-columns string for columns
  const gridTemplateColumns = useMemo(() => {
    // Use fr units for proportional columns, px for fixed minWidth
    return headerConfigs
      .map((h) => {
        if (h.minWidth) return `${h.minWidth}px`
        if (h.widthWeight) return `${h.widthWeight}fr`
        return '1fr'
      })
      .join(' ')
  }, [headerConfigs])

  // Cell renderer for each column
  const renderCell = (
    header: TableHeaderConfig,
    item: PlaylistItem | AlbumItem,
    isSelected: boolean,
    isPlaylist: boolean,
    playlistItem: PlaylistItem,
    albumItem: AlbumItem,
    nameNeedsTruncation: boolean,
  ) => {
    switch (header.key) {
      case 'checkbox':
        return (
          <div className="row-checkbox">
            <WireframeCheckbox checked={isSelected} onChange={() => {}} />
          </div>
        )
      case 'thumbnail':
        return (
          <div className="row-thumbnail">
            {isPlaylist ? (
              <HoverDisplay
                content={
                  playlistItem.description
                    ? cleanDescription(playlistItem.description, 200)
                    : `Playlist: ${playlistItem.name}\nOwner: ${playlistItem.owner.display_name}\nTracks: ${playlistItem.tracks.total}`
                }
                position="right"
                followMouse={true}
              >
                {/* Show first letter for 0-track playlists instead of trying to display full name */}
                {playlistItem.tracks.total === 0 ? (
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--terminal-bg)',
                      border: '1px solid var(--terminal-cyan-dim)',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: 'var(--terminal-cyan)',
                    }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <img
                    src={
                      item.id === 'liked-songs'
                        ? 'https://misc.scdn.co/liked-songs/liked-songs-64.png'
                        : item.images[0]?.url || '/placeholder-album.png'
                    }
                    alt={`${item.name} thumbnail`}
                    onError={(e) => {
                      e.currentTarget.src =
                        item.id === 'liked-songs'
                          ? 'https://misc.scdn.co/liked-songs/liked-songs-64.png'
                          : '/placeholder-album.png'
                    }}
                  />
                )}
              </HoverDisplay>
            ) : (
              <HoverDisplay
                content={`Album: ${albumItem.name}\nArtist: ${
                  albumItem.artists[0]?.name || 'Unknown Artist'
                }\nTracks: ${albumItem.total_tracks}\nRelease Date: ${
                  albumItem.release_date || 'Unknown'
                }`}
                position="right"
                followMouse={true}
              >
                <img
                  src={item.images[0]?.url || '/placeholder-album.png'}
                  alt={`${item.name} thumbnail`}
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-album.png'
                  }}
                />
              </HoverDisplay>
            )}
          </div>
        )
      case 'name':
        return (
          <div className="row-name">
            {nameNeedsTruncation ? (
              <HoverDisplay content={item.name} position="top">
                <span className="item-name">{item.name}</span>
              </HoverDisplay>
            ) : (
              <span className="item-name">{item.name}</span>
            )}
          </div>
        )
      case 'owner':
        return (
          <div className="row-metadata">
            {isPlaylist
              ? playlistItem.owner.display_name
              : albumItem.artists[0]?.name || 'Unknown Artist'}
          </div>
        )
      case 'tracks':
        return (
          <div className="row-tracks">
            {isPlaylist ? playlistItem.tracks.total : albumItem.total_tracks}
          </div>
        )
      default:
        return <div />
    }
  }

  return (
    <div
      className="album-playlist-select"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: '100%', // Prevent horizontal overflow
        boxSizing: 'border-box', // Include borders in width calculation
      }}
    >
      {/* CRITICAL NOTE: DO NOT WRAP THIS COMPONENT IN ANY PANEL - IT IS THE PANEL */}

      {/* Combined Controls: Selection Count + Search/Refresh */}
      <div className="select-summary">
        <div className="selection-info">
          <span className="selection-count">
            {selectedItems.length} {type === 'playlist' ? 'playlist' : 'album'}
            {selectedItems.length !== 1 ? 's' : ''} selected
          </span>
          {selectedItems.length > 0 && (
            <button
              className="wireframe-button"
              onClick={handleDeselectAll}
              title="deselect all items"
              aria-label="deselect all items"
              type="button"
              style={{
                background: 'var(--terminal-bg)',
                border: '1px solid var(--terminal-cyan)',
                color: 'var(--terminal-cyan)',
              }}
            >
              deselect all
            </button>
          )}
        </div>

        {/* Search and Refresh Controls - Moved inline with selection count */}
        {(onSearchChange || onRefresh) && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Search input */}
            {onSearchChange && (
              <input
                type="text"
                placeholder={`search ${type}s...`}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                style={{
                  minWidth: 180,
                  height: '2.25em', // Use em for font-size responsiveness (36px/16 = 2.25em)
                  padding: '0.5em 0.75em', // Adjusted padding for better proportions with em units
                  border: '1px solid var(--terminal-cyan)',
                  borderRadius: 0,
                  background: 'var(--terminal-bg)',
                  color: 'var(--terminal-cyan)',
                  fontSize: '14px',
                  fontFamily: 'var(--terminal-font)',
                }}
              />
            )}

            {/* Refresh button - Now to the right of search */}
            {showRefresh && onRefresh && (
              <WireframeButton
                onClick={onRefresh}
                style={{
                  background: 'var(--terminal-bg)',
                  color: 'var(--terminal-orange)',
                  border: '1px solid var(--terminal-orange)',
                  fontWeight: 700,
                  height: '2.25em',
                  padding: '0.5em 1em',
                }}
              >
                Refresh Cache
              </WireframeButton>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActionButton && selectedItems.length > 0 && (
        <div
          className="action-buttons"
          style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}
        >
          <button
            className="wireframe-button"
            onClick={() => onActionClick?.(false)}
            disabled={isProcessing}
            type="button"
            aria-label={isProcessing ? 'processing' : actionButtonText.toLowerCase()}
          >
            {isProcessing ? 'processing...' : actionButtonText.toLowerCase()}
          </button>

          {showForceRefresh && (
            <button
              className="wireframe-button"
              onClick={() => onActionClick?.(true)}
              disabled={isProcessing}
              title="bypass cache and fetch fresh results"
              aria-label="force refresh"
              type="button"
            >
              {forceRefreshText.toLowerCase()}
            </button>
          )}
        </div>
      )}

      {/* Sort Controls */}

      {/* Items Table */}
      <div
        className="items-table"
        style={{
          ['--playlist-grid' as any]: gridTemplateColumns,
          ['--album-grid' as any]: gridTemplateColumns,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100%', // Prevent horizontal overflow
          overflowX: 'hidden', // Explicitly prevent horizontal scrolling
        }}
      >
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
        <div
          className="table-body"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden', // Prevent horizontal scrolling
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {paginatedItems.map((item) => {
            const isSelected = selectedItems.includes(item.id)
            const isPlaylist = type === 'playlist'
            const playlistItem = item as PlaylistItem
            const albumItem = item as AlbumItem
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
                    className={`table-row-cell ${header.className || ''} ${
                      header.colClass || ''
                    }`.trim()}
                    role="cell"
                  >
                    {renderCell(
                      header,
                      item,
                      isSelected,
                      isPlaylist,
                      playlistItem,
                      albumItem,
                      nameNeedsTruncation,
                    )}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination - Always visible */}
      <div className="pagination">
        <button
          className="wireframe-button"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1 || totalPages <= 1}
          type="button"
          aria-label="previous page"
          style={{
            background: 'var(--terminal-bg)',
            border: '1px solid var(--terminal-cyan)',
            color: 'var(--terminal-cyan)',
          }}
        >
          previous
        </button>

        <span className="page-info">
          {totalPages > 1
            ? `page ${currentPage} of ${totalPages}`
            : `${sortedItems.length} item${sortedItems.length !== 1 ? 's' : ''}`}
          {totalPages > 1 && ` (${sortedItems.length} total)`}
        </span>
        <div
          className="per-page-next-button-holder"
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <WireframeSelect
            value={currentItemsPerPage}
            onChange={(value) => handleItemsPerPageChange(Number(value))}
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
          <button
            className="wireframe-button"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages <= 1}
            type="button"
            aria-label="next page"
            style={{
              background: 'var(--terminal-bg)',
              border: '1px solid var(--terminal-cyan)',
              color: 'var(--terminal-cyan)',
            }}
          >
            next
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlaylistSelector
