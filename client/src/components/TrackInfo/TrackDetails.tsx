/**
 * @file TrackDetails.tsx
 * @description Track details display component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton } from '../wireframe'
import { TrackInfo } from '../../../types/track'

interface TrackDetailsProps {
  track: TrackInfo
}

/**
 * Displays detailed track information
 */
export const TrackDetails: React.FC<TrackDetailsProps> = ({ track }) => {
  return (
    <div className="track-details-container">
      <div className="track-detail-item">
        <strong className="track-detail-label">name:</strong>
        <span className="track-detail-value">{track.name}</span>
      </div>

      <div className="track-detail-item">
        <strong className="track-detail-label">artist:</strong>
        <span className="track-detail-value">{track.artist}</span>
      </div>

      <div className="track-detail-item">
        <strong className="track-detail-label">album:</strong>
        <span className="track-detail-value">{track.album}</span>
      </div>

      <div className="track-detail-item">
        <strong className="track-detail-label">duration:</strong>
        <span className="track-detail-value">{track.duration}</span>
      </div>

      <div className="track-detail-item">
        <strong className="track-detail-label">popularity:</strong>
        <span className="track-detail-value">{track.popularity}/100</span>
      </div>

      <div className="track-detail-item">
        <strong className="track-detail-label">explicit:</strong>
        <span className="track-detail-value">{track.explicit ? 'yes' : 'no'}</span>
      </div>

      {track.external_urls?.spotify && (
        <WireframeButton
          onClick={() => window.open(track.external_urls?.spotify, '_blank')}
          variant="panel"
        >
          open in spotify
        </WireframeButton>
      )}
    </div>
  )
}