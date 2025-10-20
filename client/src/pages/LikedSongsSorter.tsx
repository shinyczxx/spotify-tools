/**
 * @file LikedSongsSorter.tsx
 * @description Page for sorting liked songs by play count using Last.fm data
 * With proper rate limiting, caching, and cancel functionality for large libraries
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-10-20
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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

const CACHE_KEY = 'lastfm-play-counts-cache'
const CACHE_TIMESTAMP_KEY = 'lastfm-play-counts-cache-timestamp'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

const LikedSongsSorter: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allLikedSongs, setAllLikedSongs] = useState<SavedTrack[]>([])
  const [sortedTracks, setSortedTracks] = useState<TrackWithPlayCount[]>([])
  const [lastfmApiKey, setLastfmApiKey] = useState('')
  const [lastfmUsername, setLastfmUsername] = useState('')
  const [fetchingPlayCounts, setFetchingPlayCounts] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [createPlaylist, setCreatePlaylist] = useState(false)
  const [playlistName, setPlaylistName] = useState('Top Played Songs')
  const [playlistLimit, setPlaylistLimit] = useState(50)
  const [processing, setProcessing] = useState(false)
  const [maxSongsToFetch, setMaxSongsToFetch] = useState<number | 'all'>('all')
  const [useCachedData, setUseCachedData] = useState(true)

  const cancelRef = useRef(false)
  const startTimeRef = useRef<number>(0)

  // Initialize Spotify API
  const spotifyApi = useMemo(() => {
    if (!accessToken) return null
    return new SpotifyApi(accessToken)
  }, [accessToken])

  // Load Last.fm credentials and cache from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('lastfm-api-key')
    const savedUsername = localStorage.getItem('lastfm-username')
    if (savedApiKey) setLastfmApiKey(savedApiKey)
    if (savedUsername) setLastfmUsername(savedUsername)

    // Load cached data if available and not expired
    if (useCachedData) {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp)
        if (age < CACHE_DURATION) {
          try {
            const parsed = JSON.parse(cachedData)
            if (parsed && parsed.length > 0) {
              setSortedTracks(parsed)
            }
          } catch (e) {
            console.error('Failed to parse cached data:', e)
          }
        }
      }
    }
  }, [useCachedData])

  // Save Last.fm credentials to localStorage
  const saveLastFmCredentials = () => {
    if (lastfmApiKey) localStorage.setItem('lastfm-api-key', lastfmApiKey)
    if (lastfmUsername) localStorage.setItem('lastfm-username', lastfmUsername)
  }

  // Save play counts to cache
  const cachePlayCounts = (tracks: TrackWithPlayCount[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(tracks))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (e) {
      console.error('Failed to cache play counts:', e)
    }
  }

  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    setSortedTracks([])
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

  // Fetch play counts from Last.fm with rate limiting and cancel support
  const fetchPlayCounts = useCallback(async () => {
    if (!lastfmApiKey || !allLikedSongs.length) {
      setError('Please provide Last.fm API key and fetch liked songs first')
      return
    }

    saveLastFmCredentials()
    setFetchingPlayCounts(true)
    setError(null)
    setProgress({ current: 0, total: 0 })
    cancelRef.current = false
    startTimeRef.current = Date.now()

    try {
      const lastfmApi = new LastFmApi(lastfmApiKey, lastfmUsername || undefined)

      // Determine how many songs to fetch
      const songsToProcess =
        maxSongsToFetch === 'all' ? allLikedSongs : allLikedSongs.slice(0, maxSongsToFetch)

      setProgress({ current: 0, total: songsToProcess.length })

      // Estimate time (2 requests per second)
      const estimatedSeconds = Math.ceil(songsToProcess.length / 2)
      const estimatedMinutes = Math.floor(estimatedSeconds / 60)
      setEstimatedTime(
        estimatedMinutes > 0
          ? `~${estimatedMinutes}min ${estimatedSeconds % 60}s`
          : `~${estimatedSeconds}s`
      )

      // Prepare tracks for batch processing
      const tracksForApi = songsToProcess.map((savedTrack) => ({
        artist: savedTrack.track.artists[0]?.name || '',
        track: savedTrack.track.name,
        id: savedTrack.track.id,
      }))

      // Fetch play counts with progress callback and cancel check
      const playCountMap = await lastfmApi.getBatchTrackPlayCounts(
        tracksForApi,
        (current, total) => {
          setProgress({ current, total })

          // Update time estimate based on actual progress
          const elapsed = Date.now() - startTimeRef.current
          const rate = current / (elapsed / 1000) // tracks per second
          const remaining = total - current
          const estimatedRemaining = Math.ceil(remaining / rate)
          const minutes = Math.floor(estimatedRemaining / 60)
          const seconds = Math.ceil(estimatedRemaining % 60)
          setEstimatedTime(
            minutes > 0 ? `~${minutes}min ${seconds}s remaining` : `~${seconds}s remaining`
          )
        },
        () => cancelRef.current
      )

      if (cancelRef.current) {
        setError('Operation cancelled by user')
        setFetchingPlayCounts(false)
        return
      }

      // Combine tracks with play counts
      const tracksWithCounts: TrackWithPlayCount[] = songsToProcess.map((savedTrack) => ({
        ...savedTrack,
        playCount: playCountMap.get(savedTrack.track.id) || 0,
      }))

      // Sort by play count
      const sorted = tracksWithCounts.sort((a, b) =>
        sortOrder === 'desc' ? b.playCount - a.playCount : a.playCount - b.playCount
      )

      setSortedTracks(sorted)
      cachePlayCounts(sorted)
      setProgress({ current: sorted.length, total: sorted.length })
      setEstimatedTime('Complete!')
    } catch (err: any) {
      console.error('Error fetching play counts:', err)
      setError('Failed to fetch play counts from Last.fm. Please try again.')
    } finally {
      setFetchingPlayCounts(false)
    }
  }, [lastfmApiKey, lastfmUsername, allLikedSongs, sortOrder, maxSongsToFetch])

  // Cancel fetching
  const cancelFetching = () => {
    cancelRef.current = true
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    if (sortedTracks.length > 0) {
      const reversed = [...sortedTracks].reverse()
      setSortedTracks(reversed)
      cachePlayCounts(reversed)
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
              Sort your liked songs by play count using Last.fm data.{' '}
              {allLikedSongs.length > 0 && `Found ${allLikedSongs.length} liked songs.`}
            </p>
            {allLikedSongs.length > 1000 && (
              <p className="warning-text">
                ⚠️ You have {allLikedSongs.length} liked songs. Fetching play counts will take approximately{' '}
                {Math.ceil(allLikedSongs.length / 2 / 60)} minutes due to Last.fm API rate limits (2 requests/second).
              </p>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Last.fm Configuration */}
          <div className="lastfm-config">
            <h3>Last.fm Configuration</h3>
            <p className="help-text">
              Get your API key from{' '}
              <a href="https://www.last.fm/api/account/create" target="_blank" rel="noopener noreferrer">
                Last.fm API
              </a>
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
              {allLikedSongs.length > 500 && (
                <WireframeInput
                  type="number"
                  value={maxSongsToFetch === 'all' ? allLikedSongs.length : maxSongsToFetch}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    setMaxSongsToFetch(val > 0 ? val : 'all')
                  }}
                  placeholder={`Limit songs to fetch (default: all ${allLikedSongs.length})`}
                  min={1}
                  max={allLikedSongs.length}
                />
              )}
            </div>
            <div className="config-actions">
              {!fetchingPlayCounts ? (
                <>
                  <WireframeButton
                    onClick={fetchPlayCounts}
                    disabled={!lastfmApiKey || allLikedSongs.length === 0}
                  >
                    Fetch Play Counts
                  </WireframeButton>
                  <WireframeButton onClick={toggleSortOrder} disabled={sortedTracks.length === 0}>
                    Sort: {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
                  </WireframeButton>
                  <WireframeButton onClick={fetchAllLikedSongs} disabled={loading}>
                    Refresh Liked Songs
                  </WireframeButton>
                  {sortedTracks.length > 0 && (
                    <WireframeButton onClick={clearCache}>Clear Cache</WireframeButton>
                  )}
                </>
              ) : (
                <WireframeButton onClick={cancelFetching}>Cancel</WireframeButton>
              )}
            </div>
            {fetchingPlayCounts && (
              <div className="progress-info">
                <p className="progress-text">
                  Progress: {progress.current} / {progress.total} ({Math.round((progress.current / progress.total) * 100)}%)
                </p>
                <p className="time-estimate">{estimatedTime}</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
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
