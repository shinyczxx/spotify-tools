/**
 * @file PlaylistSettingsPanel.tsx
 * @description Panel for configuring playlist name and visibility settings
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { Toggle } from '@components/Toggle'
import { generateFunPlaylistName } from '@utils/playlistNameGenerator'
import './PlaylistSettingsPanel.css'

interface PlaylistSettingsPanelProps {
  playlistName: string
  onPlaylistNameChange: (name: string) => void
  isPublic: boolean
  onIsPublicChange: (isPublic: boolean) => void
  disabled?: boolean
}

export const PlaylistSettingsPanel: React.FC<PlaylistSettingsPanelProps> = ({
  playlistName,
  onPlaylistNameChange,
  isPublic,
  onIsPublicChange,
  disabled = false,
}) => {
  const handleRandomName = () => {
    onPlaylistNameChange(generateFunPlaylistName())
  }

  const handleDateTimeName = () => {
    const now = new Date()
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(now.getDate()).padStart(2, '0')} ${String(
      now.getHours(),
    ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    onPlaylistNameChange(formatted)
  }

  return (
    <WireframePanel title="playlist settings" className="playlist-settings-panel">
      <div className="playlist-settings-content">
        {/* Playlist Name */}
        <div className="playlist-name-setting">
          <label className="setting-label">playlist name:</label>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => onPlaylistNameChange(e.target.value)}
            disabled={disabled}
            className="playlist-name-input"
            placeholder="enter playlist name"
          />
          <div className="name-buttons">
            <WireframeButton
              onClick={handleRandomName}
              disabled={disabled}
              className="name-button"
            >
              random name
            </WireframeButton>
            <WireframeButton
              onClick={handleDateTimeName}
              disabled={disabled}
              className="name-button"
            >
              current date time
            </WireframeButton>
          </div>
        </div>

        {/* Public/Private Toggle */}
        <div className="visibility-setting">
          <label className="setting-label">playlist visibility:</label>
          <div className="visibility-toggle">
            <Toggle
              leftLabel="private"
              rightLabel="public"
              selected={isPublic ? 'right' : 'left'}
              onToggle={(selected) => onIsPublicChange(selected === 'right')}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </WireframePanel>
  )
}