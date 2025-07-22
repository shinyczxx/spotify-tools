/**
 * @file PlaylistMetadataSection.tsx
 * @description Playlist metadata settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface PlaylistMetadataSectionProps {
  playlistName: string
  onPlaylistNameChange: (name: string) => void
  playlistPublic: boolean
  onPlaylistPublicChange: (isPublic: boolean) => void
}

/**
 * Playlist name and visibility settings section
 */
export const PlaylistMetadataSection: React.FC<PlaylistMetadataSectionProps> = ({
  playlistName,
  onPlaylistNameChange,
  playlistPublic,
  onPlaylistPublicChange,
}) => (
  <div className="playlist-metadata-section">
    <label className="form-field">
      playlist name:
      <input
        type="text"
        value={playlistName}
        onChange={(e) => onPlaylistNameChange(e.target.value)}
        className="form-input playlist-name-input"
        placeholder="combined playlist"
      />
    </label>
    <label className="form-field">
      visibility:
      <select
        value={playlistPublic ? 'public' : 'private'}
        onChange={(e) => onPlaylistPublicChange(e.target.value === 'public')}
        className="form-select"
      >
        <option value="public">public</option>
        <option value="private">private</option>
      </select>
    </label>
  </div>
)