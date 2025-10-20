/**
 * @file LikeSongsManager.tsx
 * @description Page for managing liked songs, including deduplication
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-10-20
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { WireframePanel, WireframeButton, WireframeCheckbox, WireframeInput } from '../components/wireframe'
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { SpotifyApi } from 'spotify-api-lib'
import './LikeSongsManager.css'

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

interface DuplicateGroup {
  original: SavedTrack // Oldest liked version
  definiteDuplicates: SavedTrack[]
  probableDuplicates: SavedTrack[]
}

const LikeSongsManager: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allLikedSongs, setAllLikedSongs] = useState<SavedTrack[]>([])
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([])
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Map<string, Set<'definite' | 'probable'>>>(new Map())
  const [backupEnabled, setBackupEnabled] = useState(false)
  const [backupPlaylistName, setBackupPlaylistName] = useState('Removed Duplicate Songs')
  const [processing, setProcessing] = useState(false)

  // Initialize Spotify API (memoized to prevent infinite re-renders)
  const spotifyApi = useMemo(() => {
    if (!accessToken) return null
    return new SpotifyApi(accessToken)
  }, [accessToken])

  // Fetch all liked songs with pagination
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

      // Sort by added_at (oldest first) since we want to keep the oldest
      allTracks.sort((a, b) => new Date(a.added_at).getTime() - new Date(b.added_at).getTime())

      setAllLikedSongs(allTracks)
      detectDuplicates(allTracks)
    } catch (err: any) {
      console.error('Error fetching liked songs:', err)
      setError('Failed to load liked songs')
    } finally {
      setLoading(false)
    }
  }, [spotifyApi])

  // Detect duplicates
  const detectDuplicates = (tracks: SavedTrack[]) => {
    const groups: DuplicateGroup[] = []
    const processed = new Set<string>()

    tracks.forEach((track, index) => {
      if (processed.has(track.track.id)) return

      const definiteDupes: SavedTrack[] = []
      const probableDupes: SavedTrack[] = []

      // Compare with all other tracks
      for (let i = index + 1; i < tracks.length; i++) {
        const otherTrack = tracks[i]

        if (processed.has(otherTrack.track.id)) continue

        // Check for definite duplicates
        if (isDefiniteDuplicate(track, otherTrack)) {
          definiteDupes.push(otherTrack)
          processed.add(otherTrack.track.id)
        }
        // Check for probable duplicates
        else if (isProbableDuplicate(track, otherTrack)) {
          probableDupes.push(otherTrack)
          processed.add(otherTrack.track.id)
        }
      }

      // Only add to groups if there are duplicates
      if (definiteDupes.length > 0 || probableDupes.length > 0) {
        groups.push({
          original: track,
          definiteDuplicates: definiteDupes,
          probableDuplicates: probableDupes,
        })
        processed.add(track.track.id)
      }
    })

    setDuplicateGroups(groups)
  }

  // Check if two tracks are definite duplicates
  // Same name, same artists (order doesn't matter), same album, same duration
  const isDefiniteDuplicate = (track1: SavedTrack, track2: SavedTrack): boolean => {
    const t1 = track1.track
    const t2 = track2.track

    // Name match (case insensitive)
    if (t1.name.toLowerCase() !== t2.name.toLowerCase()) return false

    // Album match
    if (t1.album.name.toLowerCase() !== t2.album.name.toLowerCase()) return false

    // Duration match (within 1 second tolerance)
    if (Math.abs(t1.duration_ms - t2.duration_ms) > 1000) return false

    // Artists match (order doesn't matter)
    const artists1 = t1.artists.map(a => a.name.toLowerCase()).sort()
    const artists2 = t2.artists.map(a => a.name.toLowerCase()).sort()

    if (artists1.length !== artists2.length) return false

    for (let i = 0; i < artists1.length; i++) {
      if (artists1[i] !== artists2[i]) return false
    }

    return true
  }

  // Check if two tracks are probable duplicates
  // Same name and at least one artist in common
  const isProbableDuplicate = (track1: SavedTrack, track2: SavedTrack): boolean => {
    const t1 = track1.track
    const t2 = track2.track

    // Name match (case insensitive)
    if (t1.name.toLowerCase() !== t2.name.toLowerCase()) return false

    // At least one artist in common
    const artists1Set = new Set(t1.artists.map(a => a.name.toLowerCase()))
    const hasCommonArtist = t2.artists.some(a => artists1Set.has(a.name.toLowerCase()))

    return hasCommonArtist
  }

  // Toggle group expansion
  const toggleGroup = (trackId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(trackId)) {
        newSet.delete(trackId)
      } else {
        newSet.add(trackId)
      }
      return newSet
    })
  }

  // Toggle section expansion (definite/probable)
  const toggleSection = (trackId: string, section: 'definite' | 'probable') => {
    setExpandedSections(prev => {
      const newMap = new Map(prev)
      const sections = newMap.get(trackId) || new Set()
      const newSections = new Set(sections)

      if (newSections.has(section)) {
        newSections.delete(section)
      } else {
        newSections.add(section)
      }

      newMap.set(trackId, newSections)
      return newMap
    })
  }

  // Toggle duplicate selection
  const toggleDuplicate = (trackId: string) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev)
      if (newSet.has(trackId)) {
        newSet.delete(trackId)
      } else {
        newSet.add(trackId)
      }
      return newSet
    })
  }

  // Select all duplicates in a group
  const selectAllInGroup = (group: DuplicateGroup, type: 'definite' | 'probable' | 'all') => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev)

      if (type === 'definite' || type === 'all') {
        group.definiteDuplicates.forEach(d => newSet.add(d.track.id))
      }

      if (type === 'probable' || type === 'all') {
        group.probableDuplicates.forEach(d => newSet.add(d.track.id))
      }

      return newSet
    })
  }

  // Deselect all in a group
  const deselectAllInGroup = (group: DuplicateGroup) => {
    setSelectedDuplicates(prev => {
      const newSet = new Set(prev)
      group.definiteDuplicates.forEach(d => newSet.delete(d.track.id))
      group.probableDuplicates.forEach(d => newSet.delete(d.track.id))
      return newSet
    })
  }

  // Unlike selected duplicates
  const unlikeSelectedDuplicates = async () => {
    if (selectedDuplicates.size === 0) {
      setError('No duplicates selected')
      return
    }

    // Get the tracks that will be removed
    const tracksToRemove = allLikedSongs.filter(t => selectedDuplicates.has(t.track.id))

    // Show confirmation dialog
    const confirmed = await showConfirmationDialog(tracksToRemove)
    if (!confirmed) return

    setProcessing(true)
    setError(null)

    try {
      // Create backup playlist if enabled
      if (backupEnabled && backupPlaylistName.trim()) {
        await createBackupPlaylist(tracksToRemove)
      }

      // Unlike tracks in batches of 50 (Spotify API limit)
      const trackIds = Array.from(selectedDuplicates)
      for (let i = 0; i < trackIds.length; i += 50) {
        const batch = trackIds.slice(i, i + 50)
        await spotifyApi.tracks.removeTracks(batch)
      }

      // Refresh the liked songs list
      setSelectedDuplicates(new Set())
      await fetchAllLikedSongs()
    } catch (err: any) {
      console.error('Error removing duplicates:', err)
      setError('Failed to remove duplicates')
    } finally {
      setProcessing(false)
    }
  }

  // Create backup playlist
  const createBackupPlaylist = async (tracks: SavedTrack[]) => {
    if (!user) return

    try {
      // Create playlist
      const playlist = await spotifyApi.playlists.createPlaylist(user.id, {
        name: backupPlaylistName,
        description: `Backup of removed duplicate songs - Created ${new Date().toLocaleDateString()}`,
        public: false,
      })

      // Add tracks in batches of 100 (Spotify API limit)
      const trackUris = tracks.map(t => t.track.uri)
      for (let i = 0; i < trackUris.length; i += 100) {
        const batch = trackUris.slice(i, i + 100)
        await spotifyApi.playlists.addTracks(playlist.id, batch)
      }
    } catch (err: any) {
      console.error('Error creating backup playlist:', err)
      throw new Error('Failed to create backup playlist')
    }
  }

  // Show confirmation dialog
  const showConfirmationDialog = (tracks: SavedTrack[]): Promise<boolean> => {
    return new Promise((resolve) => {
      const trackList = tracks.map(t =>
        `${t.track.name} - ${t.track.artists.map(a => a.name).join(', ')}`
      ).join('\n')

      const message = `Are you sure you want to unlike ${tracks.length} song(s)?\n\n${trackList}\n\n${
        backupEnabled ? `These songs will be backed up to: "${backupPlaylistName}"` : ''
      }`

      resolve(confirm(message))
    })
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

  useEffect(() => {
    if (spotifyApi && user) {
      fetchAllLikedSongs()
    }
  }, [spotifyApi, user, fetchAllLikedSongs])

  if (loading) {
    return (
      <div className="like-songs-manager">
        <WireframePanel title="Like Songs Manager">
          <div className="loading-container">
            <LoadingSpinner />
            <p>Loading liked songs...</p>
          </div>
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="like-songs-manager">
      <WireframePanel title="Like Songs Manager">
        <div className="manager-content">
          <div className="manager-header">
            <p className="info-text">
              Found {allLikedSongs.length} liked songs with {duplicateGroups.length} groups containing duplicates
            </p>
            <WireframeButton onClick={fetchAllLikedSongs} disabled={processing}>
              Refresh
            </WireframeButton>
          </div>

          {error && <div className="error-message">{error}</div>}

          {duplicateGroups.length === 0 && !loading && (
            <div className="no-duplicates">
              <p>No duplicates found! Your liked songs are clean.</p>
            </div>
          )}

          {duplicateGroups.length > 0 && (
            <>
              <div className="controls">
                <div className="backup-controls">
                  <WireframeCheckbox
                    checked={backupEnabled}
                    onChange={() => setBackupEnabled(!backupEnabled)}
                    label="Backup removals to new playlist"
                  />
                  {backupEnabled && (
                    <WireframeInput
                      type="text"
                      value={backupPlaylistName}
                      onChange={(e) => setBackupPlaylistName(e.target.value)}
                      placeholder="Playlist name"
                    />
                  )}
                </div>
                <WireframeButton
                  onClick={unlikeSelectedDuplicates}
                  disabled={selectedDuplicates.size === 0 || processing}
                >
                  {processing ? 'Processing...' : `Unlike Selected (${selectedDuplicates.size})`}
                </WireframeButton>
              </div>

              <div className="duplicate-groups">
                {duplicateGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.original.track.id)
                  const expandedSects = expandedSections.get(group.original.track.id) || new Set()

                  return (
                    <div key={group.original.track.id} className="duplicate-group">
                      <div className="group-header" onClick={() => toggleGroup(group.original.track.id)}>
                        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        <img
                          src={group.original.track.album.images[0]?.url}
                          alt={group.original.track.album.name}
                          className="track-thumbnail"
                        />
                        <div className="track-info">
                          <div className="track-name">{group.original.track.name}</div>
                          <div className="track-meta">
                            {group.original.track.artists.map(a => a.name).join(', ')} • {group.original.track.album.name}
                          </div>
                          <div className="track-details">
                            {formatDuration(group.original.track.duration_ms)} • Liked {formatDate(group.original.added_at)}
                          </div>
                        </div>
                        <div className="duplicate-count">
                          {group.definiteDuplicates.length + group.probableDuplicates.length} duplicate(s)
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="group-content">
                          {group.definiteDuplicates.length > 0 && (
                            <div className="duplicate-section">
                              <div className="section-header" onClick={() => toggleSection(group.original.track.id, 'definite')}>
                                <span className="expand-icon">{expandedSects.has('definite') ? '▼' : '▶'}</span>
                                <span className="section-title">Definite Duplicates ({group.definiteDuplicates.length})</span>
                                <div className="section-actions">
                                  <WireframeButton
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      selectAllInGroup(group, 'definite')
                                    }}
                                    className="select-all-btn"
                                  >
                                    Select All
                                  </WireframeButton>
                                </div>
                              </div>

                              {expandedSects.has('definite') && (
                                <div className="duplicate-list">
                                  {group.definiteDuplicates.map((duplicate) => (
                                    <div key={duplicate.track.id} className="duplicate-item">
                                      <WireframeCheckbox
                                        checked={selectedDuplicates.has(duplicate.track.id)}
                                        onChange={() => toggleDuplicate(duplicate.track.id)}
                                        label=""
                                      />
                                      <img
                                        src={duplicate.track.album.images[0]?.url}
                                        alt={duplicate.track.album.name}
                                        className="track-thumbnail-small"
                                      />
                                      <div className="track-info">
                                        <div className="track-name">{duplicate.track.name}</div>
                                        <div className="track-meta">
                                          {duplicate.track.artists.map(a => a.name).join(', ')} • {duplicate.track.album.name}
                                        </div>
                                        <div className="track-details">
                                          {formatDuration(duplicate.track.duration_ms)} • Liked {formatDate(duplicate.added_at)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {group.probableDuplicates.length > 0 && (
                            <div className="duplicate-section">
                              <div className="section-header" onClick={() => toggleSection(group.original.track.id, 'probable')}>
                                <span className="expand-icon">{expandedSects.has('probable') ? '▼' : '▶'}</span>
                                <span className="section-title">Probable Duplicates ({group.probableDuplicates.length})</span>
                                <div className="section-actions">
                                  <WireframeButton
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      selectAllInGroup(group, 'probable')
                                    }}
                                    className="select-all-btn"
                                  >
                                    Select All
                                  </WireframeButton>
                                </div>
                              </div>

                              {expandedSects.has('probable') && (
                                <div className="duplicate-list">
                                  {group.probableDuplicates.map((duplicate) => (
                                    <div key={duplicate.track.id} className="duplicate-item">
                                      <WireframeCheckbox
                                        checked={selectedDuplicates.has(duplicate.track.id)}
                                        onChange={() => toggleDuplicate(duplicate.track.id)}
                                        label=""
                                      />
                                      <img
                                        src={duplicate.track.album.images[0]?.url}
                                        alt={duplicate.track.album.name}
                                        className="track-thumbnail-small"
                                      />
                                      <div className="track-info">
                                        <div className="track-name">{duplicate.track.name}</div>
                                        <div className="track-meta">
                                          {duplicate.track.artists.map(a => a.name).join(', ')} • {duplicate.track.album.name}
                                        </div>
                                        <div className="track-details">
                                          {formatDuration(duplicate.track.duration_ms)} • Liked {formatDate(duplicate.added_at)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </WireframePanel>
    </div>
  )
}

export default LikeSongsManager
