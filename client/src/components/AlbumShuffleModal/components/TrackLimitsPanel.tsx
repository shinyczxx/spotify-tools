/**
 * @file TrackLimitsPanel.tsx
 * @description Panel for configuring album count and track limits
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import { Toggle } from '@components/Toggle'
import { ShuffleConfig, TrackLimitInfo } from 'types/albumShuffle'
import { AlbumWithTrackCount, SPOTIFY_PLAYLIST_LIMITS } from '@utils/playlist/playlistAlbumFetcher'
import './TrackLimitsPanel.css'

interface TrackLimitsPanelProps {
  shuffleConfig: ShuffleConfig
  onShuffleConfigChange: (config: Partial<ShuffleConfig>) => void
  trackLimitInfo: TrackLimitInfo
  allRetrievedAlbums: AlbumWithTrackCount[]
  disabled?: boolean
}

export const TrackLimitsPanel: React.FC<TrackLimitsPanelProps> = ({
  shuffleConfig,
  onShuffleConfigChange,
  trackLimitInfo,
  allRetrievedAlbums,
  disabled = false,
}) => {
  const handleRandomAlbumCount = () => {
    const randomCount =
      Math.floor(Math.random() * Math.min(50, allRetrievedAlbums.length)) + 10
    onShuffleConfigChange({ numberOfAlbums: randomCount })
  }

  const handleRandomTrackCount = () => {
    const avgTracksPerAlbum =
      allRetrievedAlbums.length > 0
        ? Math.round(
            allRetrievedAlbums.reduce(
              (sum, album) => sum + album.estimatedTrackCount,
              0,
            ) / allRetrievedAlbums.length,
          )
        : 12
    const randomTrackCount =
      Math.floor(Math.random() * 3000) + avgTracksPerAlbum * 10
    onShuffleConfigChange({
      maxTracks: Math.min(randomTrackCount, SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS),
    })
  }

  return (
    <WireframePanel title="album & track limits" className="track-limits-panel">
      <div className="track-limits-content">
        {/* Album Count */}
        <div className="limit-setting">
          <label className="limit-label">max albums:</label>
          <input
            type="number"
            min="1"
            max="200"
            value={shuffleConfig.numberOfAlbums}
            onChange={(e) =>
              onShuffleConfigChange({
                numberOfAlbums: parseInt(e.target.value) || 25,
              })
            }
            disabled={disabled}
            className="limit-input album-count-input"
          />
          <WireframeButton
            onClick={handleRandomAlbumCount}
            disabled={disabled || allRetrievedAlbums.length === 0}
            className="random-button"
          >
            random
          </WireframeButton>
          <span className="limit-note">(0 for unlimited)</span>
        </div>

        {/* Max Tracks Setting */}
        <div className="limit-setting">
          <label className="limit-label">max tracks:</label>
          <input
            type="number"
            min="100"
            max={SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS}
            value={shuffleConfig.maxTracks}
            onChange={(e) =>
              onShuffleConfigChange({
                maxTracks: parseInt(e.target.value) || SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS,
              })
            }
            disabled={disabled}
            className="limit-input track-count-input"
          />
          <WireframeButton
            onClick={handleRandomTrackCount}
            disabled={disabled || allRetrievedAlbums.length === 0}
            className="random-button"
          >
            random
          </WireframeButton>
          <span className="limit-note">
            (Spotify limit: {SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS.toLocaleString()})
          </span>
        </div>

        {/* Track Limit Mode */}
        <div className="limit-setting track-limit-mode">
          <div className="mode-label-group">
            <label className="limit-label">limit mode:</label>
            <TooltipIcon
              contents={
                <div className="mode-tooltip">
                  <div>
                    <strong>Soft cap:</strong> Allow albums to exceed track limit
                  </div>
                  <div>
                    <strong>Hard cap:</strong> Strict limit, exclude albums that would exceed
                  </div>
                </div>
              }
              size={16}
              direction="left"
              ariaLabel="Track limit mode help"
            />
          </div>
          <div className="toggle-container">
            <Toggle
              leftLabel="soft cap"
              rightLabel="hard cap"
              selected={shuffleConfig.trackLimitMode === 'hard' ? 'right' : 'left'}
              onToggle={(selected) =>
                onShuffleConfigChange({
                  trackLimitMode: selected === 'right' ? 'hard' : 'soft',
                })
              }
              disabled={disabled}
            />
          </div>
        </div>

        {/* Track Limit Status */}
        {trackLimitInfo.totalTracks > 0 && (
          <div className={`track-status ${trackLimitInfo.limitReached ? 'warning' : 'success'}`}>
            <span className="status-icon">
              {trackLimitInfo.limitReached ? '⚠️' : '✅'}
            </span>
            <span className="status-text">
              {trackLimitInfo.totalTracks.toLocaleString()} estimated tracks
              {trackLimitInfo.limitReached && (
                <span className="excluded-count">
                  • {trackLimitInfo.excludedAlbums.length} albums excluded
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </WireframePanel>
  )
}