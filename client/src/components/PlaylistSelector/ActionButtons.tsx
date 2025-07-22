/**
 * @file ActionButtons.tsx
 * @description Action buttons for PlaylistSelector component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface ActionButtonsProps {
  selectedItems: string[]
  showActionButton?: boolean
  onActionClick?: (forceRefresh?: boolean) => void
  isProcessing?: boolean
  showForceRefresh?: boolean
  actionButtonText?: string
  forceRefreshText?: string
}

/**
 * Action buttons that appear when items are selected
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedItems,
  showActionButton = false,
  onActionClick,
  isProcessing = false,
  showForceRefresh = false,
  actionButtonText = 'Create',
  forceRefreshText = 'Force Refresh',
}) => {
  if (!showActionButton || selectedItems.length === 0) {
    return null
  }

  return (
    <div className="action-buttons">
      <button
        className="create-shuffle-btn"
        onClick={() => onActionClick?.(false)}
        disabled={isProcessing}
        type="button"
        aria-label={isProcessing ? 'processing' : actionButtonText.toLowerCase()}
      >
        {isProcessing ? 'processing...' : actionButtonText.toLowerCase()}
      </button>

      {showForceRefresh && (
        <button
          className="force-refresh-btn"
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
  )
}