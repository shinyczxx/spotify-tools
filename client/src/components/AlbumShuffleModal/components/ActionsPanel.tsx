/**
 * @file ActionsPanel.tsx
 * @description Panel for shuffle and playlist creation actions
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { ShuffledTrack } from 'types/playlist'
import { AlbumWithTrackCount } from '@utils/playlistAlbumFetcher'
import './ActionsPanel.css'

interface ActionsPanelProps {
  onReshuffle: () => void
  onCreatePlaylist: () => void
  selectedAlbums: AlbumWithTrackCount[]
  shuffledTracks: ShuffledTrack[]
  isShuffling: boolean
  processing: boolean
  shuffleButtonGlitch: boolean
  createdPlaylistUrl: string | null
  disabled?: boolean
}

export const ActionsPanel: React.FC<ActionsPanelProps> = ({
  onReshuffle,
  onCreatePlaylist,
  selectedAlbums,
  shuffledTracks,
  isShuffling,
  processing,
  shuffleButtonGlitch,
  createdPlaylistUrl,
  disabled = false,
}) => {
  const handleOpenSpotify = () => {
    if (createdPlaylistUrl) {
      window.open(createdPlaylistUrl, '_blank')
    }
  }

  return (
    <WireframePanel title="actions" className="actions-panel">
      <div className="actions-content">
        <div className="action-buttons">
          <WireframeButton
            onClick={onReshuffle}
            disabled={disabled || selectedAlbums.length === 0 || isShuffling}
            className={`reshuffle-button ${shuffleButtonGlitch ? 'button-glitch-active' : ''} ${isShuffling ? 'shuffle-button-loading' : ''}`}
          >
            {isShuffling ? 'shuffling...' : 'reshuffle albums'}
          </WireframeButton>

          <div className="create-actions">
            <WireframeButton
              onClick={onCreatePlaylist}
              disabled={disabled || processing || shuffledTracks.length === 0}
              className={`create-button ${shuffledTracks.length > 0 ? 'ready' : 'disabled'}`}
            >
              {processing ? 'creating...' : 'create playlist'}
            </WireframeButton>

            {createdPlaylistUrl && (
              <WireframeButton
                onClick={handleOpenSpotify}
                className="spotify-button"
              >
                open in spotify
              </WireframeButton>
            )}
          </div>
        </div>
      </div>
    </WireframePanel>
  )
}