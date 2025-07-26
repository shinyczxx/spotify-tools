/**
 * @file SpotifyItemDetails.tsx
 * @description Displays Spotify API response data in organized, collapsible panels
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-25
 */

import React, { useState } from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'

interface SpotifyItemDetailsProps {
  item: any // Full Spotify API response object
  itemType: 'track' | 'album' | 'artist'
  onSearch?: (query: string) => void
}

export const SpotifyItemDetails: React.FC<SpotifyItemDetailsProps> = ({ item, itemType, onSearch }) => {
  const [trackInfoExpanded, setTrackInfoExpanded] = useState(true)
  const [artistInfoExpanded, setArtistInfoExpanded] = useState(true)
  const [albumInfoExpanded, setAlbumInfoExpanded] = useState(true)
  const [marketsExpanded, setMarketsExpanded] = useState(false)

  if (!item) return null

  const formatDuration = (ms: number): string => {
    if (!ms) return 'N/A'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const renderDataPanel = (header: string, info: string, isClickable: boolean = false, clickAction?: () => void) => {
    const content = isClickable ? (
      <span 
        style={{ cursor: 'pointer', textDecoration: 'underline' }}
        onClick={clickAction}
      >
        {info}
      </span>
    ) : info;

    return (
      <WireframePanel
        title={header}
        variant="data"
      >
        {content}
      </WireframePanel>
    );
  }

  const handleSpotifyUrlClick = (url: string) => {
    window.open(url, '_blank')
  }

  const handleIdClick = (id: string) => {
    if (onSearch) {
      onSearch(id)
    }
  }

  const renderTrackInfo = () => {
    if (!item) return null

    // For tracks, show the track data
    // For albums, show the album data as "track" info
    // For artists, show the artist data as "track" info
    const trackData = item
    const trackInfoPairs = []

    // Common fields
    if (trackData.id) trackInfoPairs.push({ header: 'ID', info: trackData.id })
    if (trackData.name) trackInfoPairs.push({ header: 'Name', info: trackData.name })
    if (trackData.type) trackInfoPairs.push({ header: 'Type', info: trackData.type })
    if (trackData.uri) trackInfoPairs.push({ header: 'URI', info: trackData.uri })
    if (trackData.href) trackInfoPairs.push({ header: 'API Href', info: trackData.href })
    
    // Track-specific fields
    if (trackData.duration_ms) trackInfoPairs.push({ header: 'Duration', info: formatDuration(trackData.duration_ms) })
    if (trackData.popularity !== undefined) trackInfoPairs.push({ header: 'Popularity', info: `${trackData.popularity}/100` })
    if (trackData.explicit !== undefined) trackInfoPairs.push({ header: 'Explicit', info: trackData.explicit ? 'Yes' : 'No' })
    if (trackData.track_number) trackInfoPairs.push({ header: 'Track Number', info: trackData.track_number.toString() })
    if (trackData.disc_number) trackInfoPairs.push({ header: 'Disc Number', info: trackData.disc_number.toString() })
    
    // Album-specific fields
    if (trackData.album_type) trackInfoPairs.push({ header: 'Album Type', info: trackData.album_type })
    if (trackData.release_date) trackInfoPairs.push({ header: 'Release Date', info: formatDate(trackData.release_date) })
    if (trackData.release_date_precision) trackInfoPairs.push({ header: 'Release Date Precision', info: trackData.release_date_precision })
    if (trackData.total_tracks) trackInfoPairs.push({ header: 'Total Tracks', info: trackData.total_tracks.toString() })
    
    // Artist-specific fields
    if (trackData.followers?.total !== undefined) trackInfoPairs.push({ header: 'Followers', info: trackData.followers.total.toLocaleString() })
    if (trackData.genres && Array.isArray(trackData.genres) && trackData.genres.length > 0) {
      trackInfoPairs.push({ header: 'Genres', info: trackData.genres.join(', ') })
    }

    // External URLs
    if (trackData.external_urls) {
      Object.entries(trackData.external_urls).forEach(([platform, url]) => {
        trackInfoPairs.push({ header: `${platform} URL`, info: url as string })
      })
    }

    // External IDs (for tracks)
    if (trackData.external_ids) {
      Object.entries(trackData.external_ids).forEach(([type, id]) => {
        trackInfoPairs.push({ header: `External ID (${type})`, info: id as string })
      })
    }

    // Preview URL
    if (trackData.preview_url) trackInfoPairs.push({ header: 'Preview URL', info: trackData.preview_url })

    // Images
    if (trackData.images && Array.isArray(trackData.images) && trackData.images.length > 0) {
      trackData.images.forEach((image: any, index: number) => {
        trackInfoPairs.push({ 
          header: `Image ${index + 1} (${image.width}x${image.height})`, 
          info: image.url 
        })
      })
    }

    const getTitle = () => {
      if (itemType === 'track') return 'Track Info'
      if (itemType === 'album') return 'Album Info'
      if (itemType === 'artist') return 'Artist Info'
      return 'Primary Info'
    }

    return (
      <WireframePanel 
        title={getTitle()}
        isCollapsible={true}
        isExpanded={trackInfoExpanded}
        onToggle={() => setTrackInfoExpanded(!trackInfoExpanded)}
      >
        {trackInfoExpanded && (
          <>
            <div className="spotify-info-2col-grid">
              {trackInfoPairs.map((pair, index) => {
                // Check if this is an ID or Spotify URL for click functionality
                const isSpotifyUrl = pair.header.toLowerCase().includes('url') && pair.info.includes('spotify.com')
                const isId = pair.header.toLowerCase() === 'id'
                
                return (
                  <div key={index}>
                    {renderDataPanel(
                      pair.header, 
                      pair.info, 
                      isSpotifyUrl || isId,
                      isSpotifyUrl ? () => handleSpotifyUrlClick(pair.info) : 
                      isId ? () => handleIdClick(pair.info) : undefined
                    )}
                  </div>
                )
              })}
            </div>
            
            {/* Available Markets - Full Width */}
            {trackData.available_markets && Array.isArray(trackData.available_markets) && trackData.available_markets.length > 0 && (
              <div className="markets-section">
                <div className="markets-header">
                  <strong>Available Markets ({trackData.available_markets.length})</strong>
                  <WireframeButton
                    onClick={() => setMarketsExpanded(!marketsExpanded)}
                    variant="secondary"
                    size="small"
                  >
                    {marketsExpanded ? 'Collapse' : 'Expand'}
                  </WireframeButton>
                </div>
                {marketsExpanded && (
                  <div className="markets-grid">
                    {trackData.available_markets.map((market: string) => (
                      <div key={market} className="market-code">
                        {market}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </WireframePanel>
    )
  }

  const renderArtistInfo = () => {
    if (!item.artists || !Array.isArray(item.artists) || item.artists.length === 0) return null

    return item.artists.map((artist: any, artistIndex: number) => (
      <WireframePanel 
        key={artist.id || artistIndex}
        title={`Artist Info${item.artists.length > 1 ? ` ${artistIndex + 1}` : ''}`}
        isCollapsible={true}
        isExpanded={artistInfoExpanded}
        onToggle={() => setArtistInfoExpanded(!artistInfoExpanded)}
      >
        {artistInfoExpanded && (
          <div className="spotify-info-2col-grid">
            {artist.id && renderDataPanel("ID", artist.id, true, () => handleIdClick(artist.id))}
            {artist.name && renderDataPanel("Name", artist.name)}
            {artist.type && renderDataPanel("Type", artist.type)}
            {artist.uri && renderDataPanel("URI", artist.uri)}
            {artist.href && renderDataPanel("API Href", artist.href)}
            {artist.external_urls && Object.entries(artist.external_urls).map(([platform, url]) => (
              <div key={platform}>
                {renderDataPanel(`${platform} URL`, url as string, true, () => handleSpotifyUrlClick(url as string))}
              </div>
            ))}
            {artist.followers?.total !== undefined && renderDataPanel("Followers", artist.followers.total.toLocaleString())}
            {artist.popularity !== undefined && renderDataPanel("Popularity", `${artist.popularity}/100`)}
            {artist.genres && Array.isArray(artist.genres) && artist.genres.length > 0 && renderDataPanel("Genres", artist.genres.join(', '))}
            {artist.images && Array.isArray(artist.images) && artist.images.map((image: any, index: number) => (
              <div key={index}>
                {renderDataPanel(`Image ${index + 1} (${image.width}x${image.height})`, image.url)}
              </div>
            ))}
          </div>
        )}
      </WireframePanel>
    ))
  }

  const renderAlbumInfo = () => {
    if (!item.album) return null

    const album = item.album

    return (
      <WireframePanel 
        title="Album Info"
        isCollapsible={true}
        isExpanded={albumInfoExpanded}
        onToggle={() => setAlbumInfoExpanded(!albumInfoExpanded)}
      >
        {albumInfoExpanded && (
          <div className="spotify-info-2col-grid">
            {album.id && renderDataPanel("ID", album.id, true, () => handleIdClick(album.id))}
            {album.name && renderDataPanel("Name", album.name)}
            {album.type && renderDataPanel("Type", album.type)}
            {album.uri && renderDataPanel("URI", album.uri)}
            {album.href && renderDataPanel("API Href", album.href)}
            {album.album_type && renderDataPanel("Album Type", album.album_type)}
            {album.release_date && renderDataPanel("Release Date", formatDate(album.release_date))}
            {album.release_date_precision && renderDataPanel("Release Date Precision", album.release_date_precision)}
            {album.total_tracks && renderDataPanel("Total Tracks", album.total_tracks.toString())}
            {album.external_urls && Object.entries(album.external_urls).map(([platform, url]) => (
              <div key={platform}>
                {renderDataPanel(`${platform} URL`, url as string, true, () => handleSpotifyUrlClick(url as string))}
              </div>
            ))}
            {album.images && Array.isArray(album.images) && album.images.map((image: any, index: number) => (
              <div key={index}>
                {renderDataPanel(`Image ${index + 1} (${image.width}x${image.height})`, image.url)}
              </div>
            ))}
            {album.artists && Array.isArray(album.artists) && album.artists.map((artist: any, index: number) => (
              <div key={artist.id || index}>
                {renderDataPanel(`Artist ${index + 1}`, artist.name)}
              </div>
            ))}
          </div>
        )}
      </WireframePanel>
    )
  }

  // Order panels based on primary search type
  const renderOrderedPanels = () => {
    const panels = []

    if (itemType === 'track') {
      panels.push(renderTrackInfo())
      panels.push(renderArtistInfo())
      panels.push(renderAlbumInfo())
    } else if (itemType === 'artist') {
      panels.push(renderTrackInfo()) // Artist data as "primary" info
      panels.push(renderAlbumInfo())
    } else if (itemType === 'album') {
      panels.push(renderTrackInfo()) // Album data as "primary" info
      panels.push(renderArtistInfo())
    }

    return panels.filter(panel => panel !== null)
  }

  return (
    <div className="spotify-item-details-container">
      {renderOrderedPanels()}
    </div>
  )
}