/**
 * @file TrackPreviewSection.tsx
 * @description Track preview list section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import type { SpotifyTrack } from 'types'

interface TrackPreviewSectionProps {
  combinedTracks: SpotifyTrack[]
}

/**
 * Preview of combined playlist tracks
 */
export const TrackPreviewSection: React.FC<TrackPreviewSectionProps> = ({
  combinedTracks,
}) => {
  if (combinedTracks.length === 0) return null

  return (
    <div className="track-preview-section">
      <h3 className="preview-title">
        preview ({combinedTracks.length} tracks)
      </h3>
      <div className="preview-container">
        {combinedTracks.map((track, index) => (
          <div key={`${track.id}-${index}`} className="preview-track-item">
            <span className="track-position">
              {index + 1}. {track.name}
            </span>
            <span className="track-artist">{track.artists[0]?.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}