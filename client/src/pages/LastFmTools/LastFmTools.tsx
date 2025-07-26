/**
 * @file LastFmTools.tsx
 * @description Last.fm integration tools page with tag search functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import React, { useState, useMemo } from 'react'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useLastFm } from '@hooks/data/useLastFm'
import { WireframePanel, WireframeButton, WireframeSingleStateSwitch } from '@components/wireframe'
import { LastFmTagSelector } from '@components/LastFmTagSelector/LastFmTagSelector'
import { PlaylistModal, PlaylistModalFormData } from '@components/PlaylistModal/PlaylistModal'
import createSpotifyApiWrapper from '@utils/spotifyApiWrapper'
import { LastFmSearchResult } from '@services/lastfm'
import { getEnvVar } from '@utils/config/env'
import '@styles/wireframe.css'
import './LastFmTools.css'


const LastFmTools: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  
  // State management - declare testingMode first
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<LastFmSearchResult[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<LastFmSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingMode, setTestingMode] = useState(false)
  
  // Use LastFm hook with testingMode
  const { 
    searchAlbumsByTags, 
    validateTag, 
    getSuggestedTags, 
    loadMoreTags,
    hasMoreTags,
    loadingMore,
    isAvailable, 
    loading: lastFmLoading,
    popularTags,
    error: lastFmError
  } = useLastFm(testingMode)
  
  // Check if Last.fm API key is configured
  const hasApiKey = useMemo(() => {
    try {
      getEnvVar('VITE_LASTFM_API_KEY')
      return true
    } catch {
      return false
    }
  }, [])
  
  // Initialize Spotify API
  const spotifyApi = useMemo(() => {
    return accessToken ? createSpotifyApiWrapper() : null
  }, [accessToken])
  
  // Modal state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false)
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false)
  const [playlistFormData, setPlaylistFormData] = useState<PlaylistModalFormData>({
    name: '',
    isPublic: false,
    albumCount: 20
  })

  // Search for albums by tags
  const handleTagSearch = async () => {
    if (searchTags.length === 0) {
      setError('Please enter at least one tag')
      return
    }

    if (!isAvailable) {
      setError('Last.fm API key is required for tag search')
      return
    }

    setLoading(true)
    setError(null)
    setSearchResults([])
    setSelectedAlbums([]) // Clear previous selections

    try {
      const results = await searchAlbumsByTags(searchTags)
      setSearchResults(results)
      
      if (results.length === 0) {
        setError('No albums found for the specified tags. Try different or more popular tags.')
      }
    } catch (err) {
      console.error('Tag search error:', err)
      setError(err instanceof Error ? err.message : 'Failed to search albums by tags')
    } finally {
      setLoading(false)
    }
  }

  // Toggle album selection
  const toggleAlbumSelection = (album: LastFmSearchResult) => {
    setSelectedAlbums(prev => {
      const isSelected = prev.some(selected => selected.id === album.id)
      if (isSelected) {
        return prev.filter(selected => selected.id !== album.id)
      } else {
        return [...prev, album]
      }
    })
  }

  // Create playlist from selected albums
  const handleCreatePlaylist = async () => {
    if (!spotifyApi || selectedAlbums.length === 0) {
      setError('Please select albums to add to playlist')
      return
    }

    setIsCreatingPlaylist(true)
    setError(null)

    try {
      // First, search for the albums on Spotify
      const tracks: string[] = []
      
      for (const album of selectedAlbums) {
        try {
          // Search for the album on Spotify
          const searchQuery = `album:"${album.name}" artist:"${album.artist}"`
          const searchResult = await spotifyApi.search.search(searchQuery, { type: ['album'], limit: 1 })
          
          if (searchResult.albums?.items && searchResult.albums.items.length > 0) {
            const spotifyAlbum = searchResult.albums.items[0]
            
            // Get all tracks from the album
            const albumTracks = await spotifyApi.albums.getTracks(spotifyAlbum.id)
            if (albumTracks.items) {
              tracks.push(...albumTracks.items.map(track => track.uri))
            }
          }
        } catch (err) {
          console.warn(`Failed to find album ${album.name} by ${album.artist} on Spotify`)
        }
      }

      if (tracks.length === 0) {
        throw new Error('No tracks found on Spotify for selected albums')
      }

      // Create the playlist
      const playlist = await spotifyApi.playlists.create(
        playlistFormData.name,
        playlistFormData.isPublic,
        `Playlist created from Last.fm tag search: ${searchTags}`
      )

      // Add tracks to playlist in batches
      const batchSize = 100
      for (let i = 0; i < tracks.length; i += batchSize) {
        const batch = tracks.slice(i, i + batchSize)
        await spotifyApi.playlists.addTracks(playlist.id, batch)
      }

      // Success - close modal and reset
      setIsPlaylistModalOpen(false)
      setSelectedAlbums([])
      setPlaylistFormData({ name: '', isPublic: false, albumCount: 20 })
      
    } catch (err) {
      console.error('Playlist creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create playlist')
    } finally {
      setIsCreatingPlaylist(false)
    }
  }

  if (!accessToken) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Authentication Required" variant="error">
          <p>Please log in with Spotify to use Last.fm tools.</p>
        </WireframePanel>
      </div>
    )
  }


  return (
    <div className={`wireframe-container lastfm-tools-container ${testingMode ? 'testing-mode' : ''}`}>
      {/* Testing Mode Toggle */}
      <WireframePanel title="Configuration" className="lastfm-config-panel">
        <div className="lastfm-config-section">
          <div className="lastfm-api-status">
            <p className={`lastfm-api-indicator ${hasApiKey ? 'has-key' : 'no-key'}`}>
              {hasApiKey ? '🔑 Last.fm API key configured' : '⚠️ No Last.fm API key found'}
            </p>
            {!hasApiKey && (
              <p className="lastfm-api-help">
                Set VITE_LASTFM_API_KEY environment variable or use testing mode
              </p>
            )}
          </div>
          <WireframeSingleStateSwitch
            states={[
              { label: "Live API", state: "live" },
              { label: "Testing Mode", state: "testing" }
            ]}
            activeState={testingMode ? 'testing' : 'live'}
            onStateChange={(state) => setTestingMode(state === 'testing')}
          />
          <p className="lastfm-toggle-description">
            {testingMode ? "Using mock data for demonstration" : hasApiKey ? "Using live Last.fm API" : "API key required for live data"}
          </p>
          {testingMode && (
            <p className="lastfm-test-notice">
              🧪 Testing mode active - using mock album data
            </p>
          )}
        </div>
      </WireframePanel>

      {/* Tag Search Section */}
      <WireframePanel title="Tag Search">
        {!isAvailable ? (
          <div className="lastfm-search-disabled">
            <p className="lastfm-disabled-message">
              🔒 Search functionality requires either a Last.fm API key or testing mode to be enabled.
            </p>
            <p className="lastfm-disabled-help">
              Enable testing mode above to try the feature with mock data, or configure your API key.
            </p>
          </div>
        ) : (
          <div className="lastfm-search-section">
            <LastFmTagSelector
              availableTags={popularTags}
              selectedTags={searchTags}
              onTagsChange={setSearchTags}
              maxTags={5}
              disabled={loading || lastFmLoading}
              className="lastfm-tag-selector"
              error={lastFmError}
              onLoadMore={loadMoreTags}
              hasMore={hasMoreTags}
              loadingMore={loadingMore}
            />
            <div className="lastfm-search-actions">
              <WireframeButton 
                onClick={handleTagSearch}
                disabled={loading || lastFmLoading || searchTags.length === 0}
                className="lastfm-search-button"
              >
                {loading || lastFmLoading ? 'Searching...' : 'Search Albums'}
              </WireframeButton>
            </div>
            <p className="lastfm-search-help">
              Select tags to discover albums. Tags are sorted by popularity on Last.fm.
            </p>
          </div>
        )}
      </WireframePanel>

      {/* Error Display */}
      {error && (
        <WireframePanel title="Error" variant="error">
          <p>{error}</p>
          <WireframeButton onClick={() => setError(null)}>
            Dismiss
          </WireframeButton>
        </WireframePanel>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <WireframePanel title={`Search Results (${searchResults.length} albums found)`}>
          <div className="lastfm-results-grid">
            {searchResults.map((album) => (
              <div 
                key={album.id} 
                className={`lastfm-album-card ${selectedAlbums.some(selected => selected.id === album.id) ? 'selected' : ''}`}
                onClick={() => toggleAlbumSelection(album)}
              >
                <div className="lastfm-album-image">
                  {album.image ? (
                    <img src={album.image} alt={`${album.name} cover`} />
                  ) : (
                    <div className="lastfm-album-placeholder">♫</div>
                  )}
                </div>
                <div className="lastfm-album-info">
                  <h3 className="lastfm-album-name">{album.name}</h3>
                  <p className="lastfm-album-artist">{album.artist}</p>
                  {album.tags && (
                    <div className="lastfm-album-tags">
                      {album.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="lastfm-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="lastfm-album-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedAlbums.some(selected => selected.id === album.id)}
                    onChange={() => toggleAlbumSelection(album)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Selection Actions */}
          {selectedAlbums.length > 0 && (
            <div className="lastfm-selection-actions">
              <p>{selectedAlbums.length} album(s) selected</p>
              <div className="lastfm-action-buttons">
                <WireframeButton onClick={() => setSelectedAlbums([])}>
                  Clear Selection
                </WireframeButton>
                <WireframeButton 
                  onClick={() => setIsPlaylistModalOpen(true)}
                  style={{ backgroundColor: 'var(--terminal-cyan)', color: 'var(--terminal-bg)' }}
                >
                  Create Playlist
                </WireframeButton>
              </div>
            </div>
          )}
        </WireframePanel>
      )}

      {/* Playlist Creation Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        isCreating={isCreatingPlaylist}
        title="Create Playlist from Selected Albums"
        initialData={playlistFormData}
        onFormChange={setPlaylistFormData}
        onConfirm={handleCreatePlaylist}
        onCancel={() => setIsPlaylistModalOpen(false)}
        summaryContent={
          <div>
            <p>Creating playlist from {selectedAlbums.length} selected albums</p>
            <div className="lastfm-modal-album-list">
              {selectedAlbums.slice(0, 5).map(album => (
                <div key={album.id} className="lastfm-modal-album-item">
                  <strong>{album.name}</strong> by {album.artist}
                </div>
              ))}
              {selectedAlbums.length > 5 && (
                <p>...and {selectedAlbums.length - 5} more albums</p>
              )}
            </div>
          </div>
        }
      />
    </div>
  )
}

export default LastFmTools