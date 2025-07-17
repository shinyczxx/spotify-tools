/**
 * @file AlbumPreview.tsx
 * @description Condensed album preview component showing retrieved albums with thumbnails
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-16
 */

import React from 'react'
import type { SpotifyAlbum } from 'spotify-api-lib'
import './AlbumPreview.css'

interface AlbumPreviewProps {
  albums: SpotifyAlbum[]
  title?: string
  maxHeight?: string
}

const AlbumPreview: React.FC<AlbumPreviewProps> = ({
  albums,
  title = 'retrieved albums',
  maxHeight = '300px'
}) => {
  if (albums.length === 0) {
    return null
  }

  return (
    <div 
      className="album-preview"
      style={{
        maxHeight,
        overflow: 'auto',
        border: '1px solid var(--circuit-color-dim)',
        background: 'rgba(0, 255, 255, 0.05)',
        padding: '0.5em'
      }}
    >
      <div className="album-preview__header">
        <span className="album-preview__title">
          {title} ({albums.length} albums)
        </span>
      </div>
      
      <div className="album-preview__list">
        {albums.map((album) => (
          <div key={album.id} className="album-preview__item">
            <div className="album-preview__thumbnail">
              {album.images && album.images.length > 0 ? (
                <img
                  src={album.images[album.images.length - 1]?.url}
                  alt={`${album.name} cover`}
                  className="album-preview__image"
                  loading="lazy"
                />
              ) : (
                <div className="album-preview__no-image">
                  <span>♪</span>
                </div>
              )}
            </div>
            
            <div className="album-preview__details">
              <div className="album-preview__name">
                {album.name}
              </div>
              <div className="album-preview__meta">
                <span className="album-preview__artist">
                  {album.artists?.[0]?.name || 'Unknown Artist'}
                </span>
                <span className="album-preview__separator">•</span>
                <span className="album-preview__year">
                  {album.release_date?.slice(0, 4) || 'Unknown'}
                </span>
                <span className="album-preview__separator">•</span>
                <span className="album-preview__type">
                  {album.album_type}
                </span>
                {album.total_tracks && (
                  <>
                    <span className="album-preview__separator">•</span>
                    <span className="album-preview__tracks">
                      {album.total_tracks} tracks
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlbumPreview