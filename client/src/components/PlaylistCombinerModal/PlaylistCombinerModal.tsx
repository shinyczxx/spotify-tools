/**
 * @file PlaylistCombinerModal.tsx
 * @description Modal component for combining playlists with modular components
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 2.0.0: Modularized with sub-components and CSS styling
 * - 1.0.0: Initial implementation with inline styles
 */

import React from 'react'
import { WireframePanel } from '@components/wireframe'
import { ShuffleSettingsSection } from './ShuffleSettingsSection'
import { PlaylistMetadataSection } from './PlaylistMetadataSection'
import { TrackPreviewSection } from './TrackPreviewSection'
import { ActionButtons } from './ActionButtons'
import type { SpotifyTrack, ShuffleSettings } from 'types'
import './PlaylistCombinerModal.css'

interface PlaylistCombinerModalProps {
  isOpen: boolean
  onClose: () => void
  shuffleSettings: ShuffleSettings
  onShuffleSettingsChange: (settings: ShuffleSettings) => void
  playlistName: string
  onPlaylistNameChange: (name: string) => void
  playlistPublic: boolean
  onPlaylistPublicChange: (isPublic: boolean) => void
  combinedTracks: SpotifyTrack[]
  onCombinePlaylists: () => void
  onCreatePlaylist: () => void
  processing: boolean
  enableLastFm: boolean
  onEnableLastFmChange: (enabled: boolean) => void
}

export const PlaylistCombinerModal: React.FC<PlaylistCombinerModalProps> = ({
  isOpen,
  onClose,
  shuffleSettings,
  onShuffleSettingsChange,
  playlistName,
  onPlaylistNameChange,
  playlistPublic,
  onPlaylistPublicChange,
  combinedTracks,
  onCombinePlaylists,
  onCreatePlaylist,
  processing,
  enableLastFm,
  onEnableLastFmChange,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <WireframePanel title="playlist combiner settings">
          <ShuffleSettingsSection
            shuffleSettings={shuffleSettings}
            onShuffleSettingsChange={onShuffleSettingsChange}
          />

          <PlaylistMetadataSection
            playlistName={playlistName}
            onPlaylistNameChange={onPlaylistNameChange}
            playlistPublic={playlistPublic}
            onPlaylistPublicChange={onPlaylistPublicChange}
          />

          <TrackPreviewSection combinedTracks={combinedTracks} />

          <ActionButtons
            combinedTracks={combinedTracks}
            onCombinePlaylists={onCombinePlaylists}
            onCreatePlaylist={onCreatePlaylist}
            onClose={onClose}
            processing={processing}
            enableLastFm={enableLastFm}
            onEnableLastFmChange={onEnableLastFmChange}
          />
        </WireframePanel>
      </div>
    </div>
  )
}

export default PlaylistCombinerModal