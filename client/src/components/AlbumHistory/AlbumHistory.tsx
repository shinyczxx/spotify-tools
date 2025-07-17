/**
 * @file AlbumHistory.tsx
 * @description Component for displaying and managing album retrieval history
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 */

import React, { useState, useEffect } from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { AlbumHistoryModal } from '@components/AlbumHistoryModal'
import { getAlbumHistory, deleteHistoryEntry, getAlbumsByHash } from '@utils/albumHistory'
import type { AlbumHistoryEntry } from 'types/albumHistory'
import type { SpotifyAlbum } from 'spotify-api-lib'

interface AlbumHistoryProps {
  onHistorySelect: (albums: SpotifyAlbum[], playlistNames: string[]) => void
}

export const AlbumHistory: React.FC<AlbumHistoryProps> = ({ onHistorySelect }) => {
  const [history, setHistory] = useState<AlbumHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Load history on mount
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    try {
      const entries = getAlbumHistory()
      setHistory(entries)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleHistoryClick = async (entry: AlbumHistoryEntry) => {
    setLoading(true)
    try {
      const albums = getAlbumsByHash(entry.albumsHash)
      if (albums) {
        onHistorySelect(albums, entry.playlistNames)
      } else {
        console.warn('Albums not found in cache for hash:', entry.albumsHash)
      }
    } catch (error) {
      console.error('Error loading albums from history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEntry = (entryId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    deleteHistoryEntry(entryId)
    loadHistory()
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      )
    } catch {
      return dateString
    }
  }

  return (
    <>
      <WireframePanel title="retrieved albums history" variant="panel">
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {history.length === 0 ? (
            <p style={{ color: 'var(--terminal-cyan-dim)', textAlign: 'center', padding: '20px' }}>
              no album retrieval history yet
            </p>
          ) : (
            <>
              <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <WireframeButton
                  onClick={() => setShowModal(true)}
                  style={{ fontSize: 'var(--terminal-font-size-small)', padding: '6px 12px' }}
                >
                  view full history
                </WireframeButton>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleHistoryClick(entry)}
                    style={{
                      padding: '12px',
                      border: '1px solid var(--terminal-cyan-dim)',
                      background: 'var(--terminal-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--terminal-cyan-bright)'
                      e.currentTarget.style.backgroundColor = 'rgba(0, 255, 255, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--terminal-cyan-dim)'
                      e.currentTarget.style.backgroundColor = 'var(--terminal-bg)'
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'var(--terminal-font-size-small)',
                        color: 'var(--terminal-cyan-bright)',
                        marginBottom: '4px',
                      }}
                    >
                      {formatDate(entry.date)}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--terminal-font-size)',
                        color: 'var(--terminal-cyan)',
                        marginBottom: '4px',
                      }}
                    >
                      {entry.playlistNames.join(', ')}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--terminal-font-size-small)',
                        color: 'var(--terminal-cyan-dim)',
                      }}
                    >
                      {entry.albumCount} albums retrieved
                    </div>
                    <button
                      onClick={(e) => handleDeleteEntry(entry.id, e)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'transparent',
                        border: '1px solid var(--terminal-cyan-dim)',
                        color: 'var(--terminal-cyan-dim)',
                        width: '20px',
                        height: '20px',
                        borderRadius: '0',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--terminal-red)'
                        e.currentTarget.style.color = 'var(--terminal-red)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--terminal-cyan-dim)'
                        e.currentTarget.style.color = 'var(--terminal-cyan-dim)'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {history.length > 0 && (
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <WireframeButton
              onClick={() => {
                if (confirm('Clear all album history?')) {
                  require('@utils/albumHistory').clearAlbumHistory()
                  loadHistory()
                }
              }}
              style={{ fontSize: 'var(--terminal-font-size-small)', padding: '6px 12px' }}
            >
              clear history
            </WireframeButton>
          </div>
        )}
      </WireframePanel>

      <AlbumHistoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        history={history.map((entry) => ({
          timestamp: entry.date,
          albums: getAlbumsByHash(entry.albumsHash) || [],
          playlistNames: entry.playlistNames,
        }))}
        onHistorySelect={(albums, playlistNames) => {
          setLoading(true)
          try {
            onHistorySelect(albums, playlistNames)
          } finally {
            setLoading(false)
          }
        }}
      />
    </>
  )
}
