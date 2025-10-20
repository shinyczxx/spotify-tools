/**
 * @file LikedSongsSorter.tsx
 * @description Page for sorting liked songs by play count using Last.fm data
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-10-20
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { WireframePanel, WireframeButton, WireframeInput, WireframeCheckbox } from '../components/wireframe'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { SpotifyApi } from 'spotify-api-lib'
import LastFmApi from 'lastfm-api-lib'
import './LikedSongsSorter.css'

interface SavedTrack {
  added_at: string
  track: {
    id: string
    name: string
    artists: Array<{ id: string; name: string }>
    album: {
      id: string
      name: string
      images: Array<{ url: string; height: number; width: number }>
    }
    duration_ms: number
    uri: string
  }
}

interface TrackWithPlayCount extends SavedTrack {
  playCount: number
}

const LikedSongsSorter: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allLikedSongs, setAllLikedSongs] = useState<SavedTrack[]>([])
  const [sortedTracks, setSortedTracks] = useState<TrackWithPlayCount[]>([])
  const [lastfmApiKey, setLastfmApiKey] = useState('')
  const [lastfmUsername, setLastfmUsername] = useState('')
  const [fetchingPlayCounts, setFetchingPlayCounts] = useState(false)
  const [progress, setProgress] = useState(0)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [createPlaylist, setCreatePlaylist] = useState(false)
  const [playlistName, setPlaylistName] = useState('Top Played Songs')
  const [playlistLimit, setPlaylistLimit] = useState(50)
  const [processing, setProcessing] = useState(false)

  // Initialize Spotify API
  const spotifyApi = useMemo(() => {
    if (!accessToken) return null
    return new SpotifyApi(accessToken)
  }, [accessToken])

  // Load Last.fm credentials from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('lastfm-api-key')
    const savedUsername = localStorage.getItem('lastfm-username')
    if (savedApiKey) setLastfmApiKey(savedApiKey)
    if (savedUsername) setLastfmUsername(savedUsername)
  }, [])

  // Save Last.fm credentials to localStorage
  const saveLastFmCredentials = () => {
    if (lastfmApiKey) localStorage.setItem('lastfm-api-key', lastfmApiKey)
    if (lastfmUsername) localStorage.setItem('lastfm-username', lastfmUsername)
  }

  // Fetch all liked songs
  const fetchAllLikedSongs = useCallback(async () => {
    if (!spotifyApi) return

    setLoading(true)
    setError(null)

    try {
      const allTracks: SavedTrack[] = []
      let offset = 0
      const limit = 50

      while (true) {
        const response = await spotifyApi.tracks.getSavedTracks({ limit, offset })

        if (response.items.length === 0) break

        allTracks.push(...response.items)

        if (response.items.length < limit) break

        offset += limit
      }

      setAllLikedSongs(allTracks)
    } catch (err: any) {
      console.error('Error fetching liked songs:', err)
      setError('Failed to load liked songs')
    } finally {
      setLoading(false)
    }
  }, [spotifyApi])

  // Fetch play counts from Last.fm
  const fetchPlayCounts = useCallback(async () => {
    if (!lastfmApiKey || !allLikedSongs.length) {
      setError('Please provide Last.fm API key and fetch liked songs first')
      return
    }

    saveLastFmCredentials()
    setFetchingPlayCounts(true)
    setError(null)
    setProgress(0)

    try {
      const lastfmApi = new LastFmApi(lastfmApiKey, lastfmUsername || undefined)
      const tracksWithCounts: TrackWithPlayCount[] = []

      // Fetch play counts in batches
      const batchSize = 5
      for (let i = 0; i < allLikedSongs.length; i += batchSize) {
        const batch = allLikedSongs.slice(i, i + batchSize)

        const batchPromises = batch.map(async (savedTrack) => {
          const artist = savedTrack.track.artists[0]?.name || ''
          const track = savedTrack.track.name

          const result = await lastfmApi.getTrackInfo(artist, track)

          let playCount = 0
          if (result.success && result.data) {
            // Prefer user play count, fallback to global play count
            const count = result.data.userplaycount || result.data.playcount || '0'
            playCount = parseInt(count, 10)
          }

          return {
            ...savedTrack,
            playCount,
          }
        })

        const batchResults = await Promise.all(batchPromises)
        tracksWithCounts.push(...batchResults)

        // Update progress
        setProgress(Math.round(((i + batchSize) / allLikedSongs.length) * 100))

        // Small delay to avoid rate limiting
        if (i + batchSize < allLikedSongs.length) {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }

      // Sort by play count
      const sorted = tracksWithCounts.sort((a, b) =>
        sortOrder === 'desc' ? b.playCount - a.playCount : a.playCount - b.playCount
      )

      setSortedTracks(sorted)
      setProgress(100)
    } catch (err: any) {
      console.error('Error fetching play counts:', err)
      setError('Failed to fetch play counts from Last.fm')
    } finally {
      setFetchingPlayCounts(false)
    }
  }, [lastfmApiKey, lastfmUsername, allLikedSongs, sortOrder])

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    if (sortedTracks.length > 0) {
      setSortedTracks([...sortedTracks].reverse())
    }
  }

  // Create playlist from sorted tracks
  const createSortedPlaylist = async () => {
    if (!spotifyApi || !user || sortedTracks.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      // Create new playlist
      const playlist = await spotifyApi.playlists.createPlaylist(user.id, {
        name: playlistName,
        description: `Top ${playlistLimit} played songs sorted by Last.fm play count - Created ${new Date().toLocaleDateString()}`,
        public: false,
      })

      // Get top N tracks
      const topTracks = sortedTracks.slice(0, playlistLimit)
      const trackUris = topTracks.map((t) => t.track.uri)

      // Add tracks in batches of 100
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100)
        await spotifyApi.playlists.addTracks(playlist.id, batch)
      }

      alert(`Playlist "${playlistName}" created successfully with ${topTracks.length} tracks!`)
    } catch (err: any) {
      console.error('Error creating playlist:', err)
      setError('Failed to create playlist')
    } finally {
      setProcessing(false)
    }
  }

  // Format duration
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  // Initial load
  useEffect(() => {
    if (spotifyApi && user && allLikedSongs.length === 0) {
      fetchAllLikedSongs()
    }
  }, [spotifyApi, user, allLikedSongs.length, fetchAllLikedSongs])

  if (loading) {
    return (
      <div className="liked-songs-sorter">
        <WireframePanel title="Liked Songs Sorter">
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading liked songs...</p>
          </div>
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="liked-songs-sorter">
      <WireframePanel title="Liked Songs Sorter by Play Count">
        <div className="sorter-content">
          <div className="info-section">
            <p className="info-text">
              Sort your liked songs by play count using Last.fm data. {allLikedSongs.length > 0 && `Found ${allLikedSongs.length} liked songs.`}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Last.fm Configuration */}
          <div className="lastfm-config">
            <h3>Last.fm Configuration</h3>
            <p className="help-text">
              Get your API key from <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer">Last.fm API</a>
            </p>
            <div className="config-inputs">
              <WireframeInput
                type="text"
                value={lastfmApiKey}
                onChange={(e) => setLastfmApiKey(e.target.value)}
                placeholder="Last.fm API Key (required)"
              />
              <WireframeInput
                type="text"
                value={lastfmUsername}
                onChange={(e) => setLastfmUsername(e.target.value)}
                placeholder="Last.fm Username (optional for user-specific counts)"
              />
            </div>
            <div className="config-actions">
              <WireframeButton
                onClick={fetchPlayCounts}
                disabled={!lastfmApiKey || allLikedSongs.length === 0 || fetchingPlayCounts}
              >
                {fetchingPlayCounts ? `Fetching... ${progress}%` : 'Fetch Play Counts'}
              </WireframeButton>
              <WireframeButton onClick={toggleSortOrder} disabled={sortedTracks.length === 0}>
                Sort: {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
              </WireframeButton>
              <WireframeButton onClick={fetchAllLikedSongs} disabled={loading}>
                Refresh Liked Songs
              </WireframeButton>
            </div>
          </div>

          {/* Playlist Creation Options */}
          {sortedTracks.length > 0 && (
            <div className="playlist-options">
              <h3>Create Playlist</h3>
              <div className="playlist-controls">
                <WireframeCheckbox
                  checked={createPlaylist}
                  onChange={() => setCreatePlaylist(!createPlaylist)}
                  label="Create playlist from sorted songs"
                />
                {createPlaylist && (
                  <>
                    <WireframeInput
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                    />
                    <WireframeInput
                      type="number"
                      value={playlistLimit}
                      onChange={(e) => setPlaylistLimit(parseInt(e.target.value) || 50)}
                      placeholder="Number of tracks"
                      min={1}
                      max={sortedTracks.length}
                    />
                    <WireframeButton onClick={createSortedPlaylist} disabled={processing}>
                      {processing ? 'Creating...' : `Create Playlist (${playlistLimit} tracks)`}
                    </WireframeButton>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results Table */}
          {sortedTracks.length > 0 && (
            <div className="results-section">
              <h3>Sorted Tracks ({sortedTracks.length})</h3>
              <div className="tracks-table">
                <div className="table-header">
                  <div className="col-rank">#</div>
                  <div className="col-artwork"></div>
                  <div className="col-title">Track</div>
                  <div className="col-artist">Artist</div>
                  <div className="col-album">Album</div>
                  <div className="col-playcount">Play Count</div>
                  <div className="col-duration">Duration</div>
                  <div className="col-added">Added</div>
                </div>
                <div className="table-body">
                  {sortedTracks.map((track, index) => (
                    <div key={track.track.id} className="track-row">
                      <div className="col-rank">{index + 1}</div>
                      <div className="col-artwork">
                        <img
                          src={track.track.album.images[0]?.url}
                          alt={track.track.album.name}
                          className="track-artwork"
                        />
                      </div>
                      <div className="col-title">{track.track.name}</div>
                      <div className="col-artist">{track.track.artists.map((a) => a.name).join(', ')}</div>
                      <div className="col-album">{track.track.album.name}</div>
                      <div className="col-playcount">{track.playCount.toLocaleString()}</div>
                      <div className="col-duration">{formatDuration(track.track.duration_ms)}</div>
                      <div className="col-added">{formatDate(track.added_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {allLikedSongs.length > 0 && sortedTracks.length === 0 && !fetchingPlayCounts && (
            <div className="empty-state">
              <p>Click "Fetch Play Counts" to sort your liked songs by Last.fm play count.</p>
            </div>
          )}
        </div>
      </WireframePanel>
    </div>
  )
}

export default LikedSongsSorter
