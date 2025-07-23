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
import { WireframePanel, WireframeButton, WireframeTagInput } from '@components/wireframe'
import { PlaylistModal, PlaylistModalFormData } from '@components/PlaylistModal/PlaylistModal'
import { SpotifyApi } from 'spotify-api-lib'
import { SpotifyAlbum } from 'spotify-api-lib'
import { LastFmSearchResult } from '@services/lastfm'
import '@styles/wireframe.css'
import './LastFmTools.css'


const LastFmTools: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  const { 
    searchAlbumsByTags, 
    validateTag, 
    getSuggestedTags, 
    isAvailable, 
    loading: lastFmLoading,
    popularTags 
  } = useLastFm()
  
  // Initialize Spotify API
  const spotifyApi = useMemo(() => {
    return accessToken ? new SpotifyApi(accessToken) : null
  }, [accessToken])

  // State management
  const [searchTags, setSearchTags] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<LastFmSearchResult[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<LastFmSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
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
          const searchResult = await spotifyApi.search.searchAll(searchQuery, ['album'], 1)
          
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
      const playlist = await spotifyApi.playlists.createPlaylist(
        user?.id || '',
        playlistFormData.name,
        playlistFormData.isPublic,
        `Playlist created from Last.fm tag search: ${searchTags}`
      )

      // Add tracks to playlist in batches
      const batchSize = 100
      for (let i = 0; i < tracks.length; i += batchSize) {
        const batch = tracks.slice(i, i + batchSize)
        await spotifyApi.playlists.addTracksToPlaylist(playlist.id, batch)
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

  if (!isAvailable) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Last.fm API Key Required" variant="error">
          <p>Last.fm API key is not configured. Please add VITE_LASTFM_API_KEY to your environment variables.</p>
          <p className="lastfm-env-help">
            Get your free API key from <a href="https://www.last.fm/api" target="_blank" rel="noopener noreferrer">Last.fm API</a>
          </p>
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="wireframe-container lastfm-tools-container">
      {/* Tag Search Section */}
      <WireframePanel title="Tag Search">
        <div className="lastfm-search-section">
          <div className="lastfm-search-input-group">
            <WireframeTagInput
              tags={searchTags}
              onTagsChange={setSearchTags}
              placeholder="Add music tags (e.g., rock, electronic, jazz)..."
              maxTags={5}
              suggestions={getSuggestedTags(searchTags.length > 0 ? searchTags[searchTags.length - 1] : '')}
              validateTag={validateTag}
              showSuggestions={true}
              className="lastfm-tag-input"
            />
            <WireframeButton 
              onClick={handleTagSearch}
              disabled={loading || lastFmLoading || searchTags.length === 0}
              className="lastfm-search-button"
            >
              {loading || lastFmLoading ? 'Searching...' : 'Search Albums'}
            </WireframeButton>
          </div>
          <p className="lastfm-search-help">
            Add music tags to discover albums. Popular tags: {popularTags.slice(0, 6).join(', ')}
          </p>
        </div>
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