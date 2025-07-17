/**
 * @file AlbumHistoryModal.tsx
 * @description Modal component for displaying album history with circuit board theme
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - Version 1.0.0: Initial implementation with circuit board theme
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '../wireframe'
import './AlbumHistoryModal.css'

export interface AlbumHistoryEntry {
  timestamp: string
  albums: any[]
  playlistNames: string[]
}

interface AlbumHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  history: AlbumHistoryEntry[]
  onHistorySelect?: (albums: any[], playlistNames: string[]) => void
}

export const AlbumHistoryModal: React.FC<AlbumHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onHistorySelect,
}) => {
  if (!isOpen) return null

  const handleHistoryClick = (entry: AlbumHistoryEntry) => {
    if (onHistorySelect) {
      onHistorySelect(entry.albums, entry.playlistNames)
    }
    onClose()
  }

  return (
    <div className="album-history-modal-overlay">
      <div className="album-history-modal">
        <WireframePanel title="Album History" variant="panel" className="history-modal-panel">
          <div className="history-modal-content">
            {history.length === 0 ? (
              <div className="no-history">
                <p>No album history available yet.</p>
                <p>Create some shuffles to see them here!</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="history-entry"
                    onClick={() => handleHistoryClick(entry)}
                  >
                    <div className="history-date">{new Date(entry.timestamp).toLocaleString()}</div>
                    <div className="history-details">
                      <span className="album-count">{entry.albums.length} albums</span>
                      <span className="playlist-names">from {entry.playlistNames.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <WireframeButton onClick={onClose}>close</WireframeButton>
            </div>
          </div>
        </WireframePanel>
      </div>
    </div>
  )
}

export default AlbumHistoryModal
