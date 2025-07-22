/**
 * @file PreviewPlayer.tsx
 * @description Audio preview player component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface PreviewPlayerProps {
  previewUrl: string
}

/**
 * Audio player for track previews
 */
export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ previewUrl }) => {
  return (
    <div className="preview-container">
      <audio controls className="preview-audio">
        <source src={previewUrl} type="audio/mpeg" />
        your browser does not support the audio element.
      </audio>
      <p className="preview-description">30-second preview provided by spotify</p>
    </div>
  )
}