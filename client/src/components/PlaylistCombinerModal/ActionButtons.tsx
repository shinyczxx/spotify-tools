/**
 * @file ActionButtons.tsx
 * @description Action buttons section for playlist combiner modal
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton, WireframeCheckbox } from '@components/wireframe'

interface ActionButtonsProps {
  combinedTracks: any[]
  onCombinePlaylists: () => void
  onCreatePlaylist: () => void
  onClose: () => void
  processing: boolean
  enableLastFm: boolean
  onEnableLastFmChange: (enabled: boolean) => void
}

/**
 * Action buttons with Last.fm integration toggle
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  combinedTracks,
  onCombinePlaylists,
  onCreatePlaylist,
  onClose,
  processing,
  enableLastFm,
  onEnableLastFmChange,
}) => (
  <div className="action-buttons-section">
    <div className="primary-actions">
      <WireframeButton onClick={onCombinePlaylists} disabled={processing}>
        {processing
          ? 'processing...'
          : combinedTracks.length > 0
          ? 'reshuffle'
          : 'combine playlists'}
      </WireframeButton>
      {combinedTracks.length > 0 && (
        <WireframeButton
          onClick={onCreatePlaylist}
          disabled={processing}
          className="create-playlist-button"
        >
          create playlist
        </WireframeButton>
      )}
    </div>

    {/* Last.fm Integration (MVP: Coming Soon) */}
    <div className="lastfm-toggle">
      <WireframeCheckbox
        checked={enableLastFm}
        onChange={(e) => onEnableLastFmChange(e.target.checked)}
        label="last.fm"
        disabled={true}
        className="lastfm-checkbox"
        title="Last.fm integration coming soon! Will provide genre detection and similar album suggestions."
      />
    </div>

    <WireframeButton onClick={onClose} variant="panel">
      close
    </WireframeButton>
  </div>
)