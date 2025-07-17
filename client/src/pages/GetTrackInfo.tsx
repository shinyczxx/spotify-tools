/**
 * @file GetTrackInfo.tsx
 * @description Wireframe track information page for album shuffle app
 * @author GitHub Copilot
 * @version 3.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 3.0.0: Converted to wireframe theme
 * - 2.0.0: Basic track information page for MVP
 * - 1.0.0: Initial implementation
 */

import React, { useState } from 'react'
import { 
  WireframePanel, 
  WireframeButton, 
  WireframeBox,
  WireframeSelect
} from '../components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { SpotifyApi } from 'spotify-api-lib'
import '../styles/wireframe.css'

interface TrackInfo {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  popularity: number
  energy?: number
  danceability?: number
  valence?: number
  tempo?: number
  acousticness?: number
  instrumentalness?: number
  speechiness?: number
  liveness?: number
  explicit: boolean
  preview_url?: string
  external_urls?: {
    spotify: string
  }
}

interface SearchResult {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  popularity: number
  explicit: boolean
  preview_url?: string
  external_urls: {
    spotify: string
  }
}

const GetTrackInfo: React.FC = () => {
  const { accessToken } = useSpotifyAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo | null>(null)
  const [audioFeatures, setAudioFeatures] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)
  const [searchType, setSearchType] = useState('track')

  const spotifyApi = accessToken ? new SpotifyApi(accessToken) : null

  const handleSearch = async () => {
    if (!searchQuery.trim() || !spotifyApi) return

    setIsSearching(true)
    setSearchResults([])
    
    try {
      const results = await spotifyApi.search.search(searchQuery, {
        type: searchType as any,
        limit: 10
      })
      
      if (results.tracks) {
        const formattedResults: SearchResult[] = results.tracks.items.map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          duration_ms: track.duration_ms,
          popularity: track.popularity,
          explicit: track.explicit,
          preview_url: track.preview_url || undefined,
          external_urls: track.external_urls
        }))
        setSearchResults(formattedResults)
      }
    } catch (error) {
      console.error('Error searching tracks:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTrackSelect = async (track: SearchResult) => {
    setIsLoadingFeatures(true)
    
    const trackInfo: TrackInfo = {
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      duration: formatDuration(track.duration_ms),
      popularity: track.popularity,
      explicit: track.explicit,
      preview_url: track.preview_url,
      external_urls: track.external_urls
    }
    
    setSelectedTrack(trackInfo)
    
    // Get audio features
    if (spotifyApi) {
      try {
        const features = await spotifyApi.tracks.getAudioFeatures(track.id)
        setAudioFeatures(features)
        
        // Update track info with audio features
        setSelectedTrack(prev => prev ? {
          ...prev,
          energy: features.energy,
          danceability: features.danceability,
          valence: features.valence,
          tempo: features.tempo,
          acousticness: features.acousticness,
          instrumentalness: features.instrumentalness,
          speechiness: features.speechiness,
          liveness: features.liveness
        } : null)
      } catch (error) {
        console.error('Error getting audio features:', error)
      }
    }
    
    setIsLoadingFeatures(false)
  }

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatAudioFeature = (value: number, isPercentage = true): string => {
    if (isPercentage) {
      return `${Math.round(value * 100)}%`
    }
    return value.toFixed(2)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  if (!accessToken) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Authentication Required" variant="error">
          <p>please log in with spotify to search for track information.</p>
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="wireframe-container">
      <WireframePanel title="track information" variant="header">
        <p style={{ marginBottom: '20px', opacity: 0.8 }}>
          search for tracks to get detailed information and audio features
        </p>
      </WireframePanel>

      {/* Search Section */}
      <WireframePanel title="search tracks">
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                color: 'var(--terminal-cyan-bright)',
                fontSize: '12px'
              }}>
                search query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="enter track name or artist..."
                disabled={isSearching}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'var(--terminal-medium)',
                  border: '1px solid var(--terminal-cyan)',
                  color: 'var(--text-cyan)',
                  fontFamily: 'var(--terminal-font)',
                  fontSize: '14px',
                  textTransform: 'lowercase'
                }}
              />
            </div>
            
            <div style={{ minWidth: '150px' }}>
              <WireframeSelect
                value={searchType}
                onChange={(value) => setSearchType(value as string)}
                options={[
                  { value: 'track', label: 'tracks' },
                  { value: 'artist', label: 'artists' },
                  { value: 'album', label: 'albums' },
                ]}
                label="search type"
              />
            </div>
            
            <WireframeButton onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? 'searching...' : 'search'}
            </WireframeButton>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <WireframeBox boxType="panel">
            <h4 style={{ 
              color: 'var(--terminal-cyan-bright)', 
              margin: '0 0 15px 0',
              fontSize: '14px'
            }}>
              search results ({searchResults.length} found)
            </h4>
            
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(track)}
                  style={{
                    padding: '10px',
                    marginBottom: '5px',
                    border: '1px solid var(--terminal-cyan-dim)',
                    backgroundColor: 'var(--terminal-dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--terminal-cyan-bright)'
                    e.currentTarget.style.backgroundColor = 'var(--terminal-medium)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--terminal-cyan-dim)'
                    e.currentTarget.style.backgroundColor = 'var(--terminal-dark)'
                  }}
                >
                  {track.album.images[0] && (
                    <img 
                      src={track.album.images[0].url} 
                      alt={track.album.name}
                      style={{ width: '40px', height: '40px', border: '1px solid var(--terminal-cyan-dim)' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: 'var(--terminal-cyan-bright)', fontSize: '13px' }}>
                      {track.name}
                    </div>
                    <div style={{ opacity: 0.7, fontSize: '11px' }}>
                      {track.artists[0]?.name} • {track.album.name}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6 }}>
                    {formatDuration(track.duration_ms)}
                  </div>
                </div>
              ))}
            </div>
          </WireframeBox>
        )}
      </WireframePanel>

      {/* Track Details */}
      {selectedTrack && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          
          {/* Basic Information */}
          <WireframePanel title="track details">
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>name:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.name}</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>artist:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.artist}</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>album:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.album}</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>duration:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.duration}</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>popularity:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.popularity}/100</span>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: 'var(--terminal-cyan-bright)' }}>explicit:</strong>
                <span style={{ marginLeft: '10px' }}>{selectedTrack.explicit ? 'yes' : 'no'}</span>
              </div>
              
              {selectedTrack.external_urls?.spotify && (
                <WireframeButton 
                  onClick={() => window.open(selectedTrack.external_urls?.spotify, '_blank')}
                  variant="panel"
                >
                  open in spotify
                </WireframeButton>
              )}
            </div>
          </WireframePanel>

          {/* Audio Features */}
          <WireframePanel title="audio features">
            {isLoadingFeatures ? (
              <p style={{ textAlign: 'center', opacity: 0.7 }}>loading audio features...</p>
            ) : selectedTrack.energy !== undefined ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>energy:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.energy || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>danceability:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.danceability || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>valence:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.valence || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>tempo:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.tempo || 0, false)} bpm</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>acousticness:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.acousticness || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>instrumentalness:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.instrumentalness || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>speechiness:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.speechiness || 0)}</span>
                </div>
                
                <div>
                  <strong style={{ color: 'var(--terminal-cyan-bright)' }}>liveness:</strong>
                  <span style={{ marginLeft: '10px' }}>{formatAudioFeature(selectedTrack.liveness || 0)}</span>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.7 }}>no audio features available</p>
            )}
          </WireframePanel>

          {/* Preview Player */}
          {selectedTrack.preview_url && (
            <WireframePanel title="preview">
              <div style={{ textAlign: 'center' }}>
                <audio 
                  controls 
                  style={{ 
                    width: '100%',
                    marginBottom: '15px',
                    filter: 'sepia(100%) hue-rotate(180deg)'
                  }}
                >
                  <source src={selectedTrack.preview_url} type="audio/mpeg" />
                  your browser does not support the audio element.
                </audio>
                <p style={{ fontSize: '12px', opacity: 0.7 }}>
                  30-second preview provided by spotify
                </p>
              </div>
            </WireframePanel>
          )}
        </div>
      )}
      
      {!selectedTrack && !isSearching && searchResults.length === 0 && searchQuery && (
        <WireframeBox boxType="panel">
          <p style={{ textAlign: 'center', opacity: 0.7 }}>
            no results found. try a different search term.
          </p>
        </WireframeBox>
      )}
    </div>
  )
}

export default GetTrackInfo
