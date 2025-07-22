/**
 * @file AlbumHistoryModal.tsx
 * @description Modal for viewing and managing cached album search history
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-21
 *
 * @ChangeLog
 * - Version 2.0.0: Complete rewrite with smart caching system and hash-based validation
 * - Version 1.0.0: Initial implementation with circuit board theme
 */

import React, { useState, useEffect } from 'react'
import { WireframePanel, WireframeButton } from '../wireframe'
import { TooltipIcon } from '../wireframe/TooltipIcon'
import {
  getSearchHistoryCacheStats,
  clearSearchHistory,
} from '@utils/playlistSearchHistory'
import './AlbumHistoryModal.css'

interface AlbumHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadFromHistory?: (playlistIds: string[]) => void
}

interface CacheStats {
  totalEntries: number
  totalSize: string
  oldestEntry?: number
  newestEntry?: number
}

export const AlbumHistoryModal: React.FC<AlbumHistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadFromHistory,
}) => {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setStats(getSearchHistoryCacheStats())
    }
  }, [isOpen])

  const handleClearHistory = async () => {
    setIsClearing(true)
    try {
      clearSearchHistory()
      setStats(getSearchHistoryCacheStats())
      alert('Search history cleared successfully!')
    } catch (error) {
      console.error('Error clearing history:', error)
      alert('Failed to clear search history')
    } finally {
      setIsClearing(false)
    }
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown'
    return new Date(timestamp).toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay-base album-history-modal-overlay">
      <div className="modal-container-base album-history-modal">
        <WireframePanel title="album search history">
          <div className="album-history-content">
            <div className="cache-stats-header">
              <h3 className="cache-stats-title">
                cache statistics
              </h3>
              <TooltipIcon
                contents={
                  <div className="tooltip-content-container">
                    <div><strong>Smart caching system:</strong></div>
                    <div>• Stores album data using SHA-256 hashes</div>
                    <div>• Compares playlist changes to determine cache validity</div>
                    <div>• Automatically expires entries after 30 days</div>
                    <div>• Compresses data to minimize storage usage</div>
                    <div className="tooltip-footer">
                      This prevents unnecessary Spotify API calls when playlists haven't changed.
                    </div>
                  </div>
                }
                size={14}
                direction="right"
                ariaLabel="Cache system explanation"
              />
            </div>

            {stats ? (
              <div className="cache-stats-grid">
                <div>
                  <strong>Total Entries:</strong> {stats.totalEntries}
                </div>
                <div>
                  <strong>Cache Size:</strong> {stats.totalSize}
                </div>
                <div>
                  <strong>Oldest Entry:</strong> {formatDate(stats.oldestEntry)}
                </div>
                <div>
                  <strong>Newest Entry:</strong> {formatDate(stats.newestEntry)}
                </div>
              </div>
            ) : (
              <div className="cache-loading">
                Loading cache statistics...
              </div>
            )}

            <div className="how-it-works-section">
              <h4 className="how-it-works-title">
                how it works
              </h4>
              <div className="how-it-works">
                <p>
                  • When you search playlists, all albums and tracks are cached with a unique hash
                </p>
                <p>
                  • The hash is based on playlist ID, track count, and last modified date
                </p>
                <p>
                  • If playlists haven't changed, cached results are used instantly
                </p>
                <p>
                  • Cache automatically cleans up old entries to save storage space
                </p>
              </div>
            </div>

            {stats && stats.totalEntries === 0 ? (
              <div className="no-history-message">
                <p className="no-history-title">No search history found</p>
                <p className="no-history-subtitle">
                  Use album shuffle to build up your search cache automatically.
                </p>
              </div>
            ) : (
              <div className="cache-active-message">
                <p className="cache-active-title">
                  Cache Active
                </p>
                <p className="cache-active-description">
                  Your search history is helping speed up album retrieval. Future searches 
                  on unchanged playlists will be nearly instant!
                </p>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <div className="modal-actions-left">
              {stats && stats.totalEntries > 0 && (
                <WireframeButton
                  onClick={handleClearHistory}
                  disabled={isClearing}
                  className="clear-cache-button"
                >
                  {isClearing ? 'clearing...' : 'clear cache'}
                </WireframeButton>
              )}
            </div>

            <WireframeButton onClick={onClose} variant="panel">
              close
            </WireframeButton>
          </div>
        </WireframePanel>
      </div>
    </div>
  )
}

export default AlbumHistoryModal
