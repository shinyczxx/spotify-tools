/**
 * @file AudioFeatures.tsx
 * @description Audio features display component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { TrackInfo } from '../../../types/track'

interface AudioFeaturesProps {
  track: TrackInfo
  isLoading: boolean
  formatAudioFeature: (value: number, isPercentage?: boolean) => string
}

/**
 * Displays audio features for a track
 */
export const AudioFeatures: React.FC<AudioFeaturesProps> = ({
  track,
  isLoading,
  formatAudioFeature,
}) => {
  if (isLoading) {
    return <p className="audio-features-loading">loading audio features...</p>
  }

  if (track.energy === undefined) {
    return <p className="audio-features-unavailable">no audio features available</p>
  }

  return (
    <div className="audio-features-grid">
      <div>
        <strong className="audio-feature-label">energy:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.energy || 0)}</span>
      </div>

      <div>
        <strong className="audio-feature-label">danceability:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.danceability || 0)}</span>
      </div>

      <div>
        <strong className="audio-feature-label">valence:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.valence || 0)}</span>
      </div>

      <div>
        <strong className="audio-feature-label">tempo:</strong>
        <span className="audio-feature-value">
          {formatAudioFeature(track.tempo || 0, false)} bpm
        </span>
      </div>

      <div>
        <strong className="audio-feature-label">acousticness:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.acousticness || 0)}</span>
      </div>

      <div>
        <strong className="audio-feature-label">instrumentalness:</strong>
        <span className="audio-feature-value">
          {formatAudioFeature(track.instrumentalness || 0)}
        </span>
      </div>

      <div>
        <strong className="audio-feature-label">speechiness:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.speechiness || 0)}</span>
      </div>

      <div>
        <strong className="audio-feature-label">liveness:</strong>
        <span className="audio-feature-value">{formatAudioFeature(track.liveness || 0)}</span>
      </div>
    </div>
  )
}