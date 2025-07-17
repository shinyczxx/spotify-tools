/**
 * @file PlaylistTools.tsx
 * @description Comprehensive playlist tools page with modal-based creation workflow
 * @author Caleb Price
 * @version 5.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 5.0.0: Refactored to playlist-first workflow with modal-based creation
 * - 4.0.0: Complete wireframe theme implementation with all shuffle tools and filters
 * - 3.0.0: Wireframe design implementation with combined tools
 * - 2.0.0: Basic layout conversion
 * - 1.0.0: Circuit board layout
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { getCachedPlaylistsWithTTL, setCachedPlaylistsWithTTL } from '@utils/playlistCache'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { WireframePanel, WireframeButton, WireframeCheckbox } from '@components/wireframe'
import { AlbumShuffleModal } from '@components/AlbumShuffleModal'
import { PlaylistSelector } from '@components/PlaylistSelector'
import { SpotifyApi } from 'spotify-api-lib'
import type { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'
import { TableHeaderConfig } from '@components/PlaylistSelector/tableHeaderUtils'
import type {
  PlaylistItem,
  AlbumShuffleSettings,
  ShuffleSettings,
  ShuffledTrack,
} from 'types/playlist'
import { saveAlbumHistory } from '@utils/albumHistory'
import '@styles/wireframe.css'

type ModalType = 'album-shuffle' | 'playlist-combiner' | null

const PlaylistTools: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  // Playlist creation state
  const [playlistName, setPlaylistName] = useState('shuffled playlist')
  const [playlistPublic, setPlaylistPublic] = useState(false)
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  const [playlistAlbums, setPlaylistAlbums] = useState<Record<string, SpotifyAlbum[]>>({})
  const [shuffledTracks, setShuffledTracks] = useState<ShuffledTrack[]>([])
  const [combinedTracks, setCombinedTracks] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Album shuffle settings
  const [albumShuffleSettings, setAlbumShuffleSettings] = useState<AlbumShuffleSettings>({
    allowSingles: true,
    allowCompilations: true,
    numberOfAlbums: 50,
  })

  // Shuffle settings for playlist combiner
  const [shuffleSettings, setShuffleSettings] = useState<ShuffleSettings>({
    algorithm: 'smart',
  })

  // Search state for playlist selector
  const [playlistSearch, setPlaylistSearch] = useState('')
  const filteredPlaylists = playlistSearch
    ? playlists.filter((p) => p.name.toLowerCase().includes(playlistSearch.toLowerCase()))
    : playlists

  // Last.fm integration state (MVP: Coming Soon)
  const [enableLastFm, setEnableLastFm] = useState(false)

  // Clear results when switching modals
  useEffect(() => {
    setShuffledTracks([])
    setCombinedTracks([])
    setError(null)
  }, [activeModal])

  // Initialize Spotify API (memoized to prevent infinite re-renders)
  const spotifyApi = useMemo(() => {
    return accessToken ? new SpotifyApi(accessToken) : null
  }, [accessToken])

  // Load playlists on mount, using TTL cache
  const loadDataWithCache = useCallback(
    async (forceRefresh = false) => {
      setLoading(true)
      setError(null)

      // Try cache first
      if (!forceRefresh) {
        const cached = getCachedPlaylistsWithTTL()
        if (cached && cached.playlists && cached.playlists.length > 0) {
          setPlaylists(cached.playlists)
          setLoading(false)
          return
        }
      }

      try {
        // Load user's playlists (API lib now handles rate limiting)
        if (!spotifyApi) {
          throw new Error('Spotify API not initialized')
        }
        const userPlaylists = await spotifyApi.playlists.getUserPlaylists({ limit: 50 })
        let playlistItems: PlaylistItem[] = userPlaylists.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          images: (playlist.images || []).map((img: any) => ({
            url: img.url,
            height: img.height || undefined,
            width: img.width || undefined,
          })),
          owner: {
            display_name: playlist.owner.display_name || 'Unknown',
            id: playlist.owner.id,
          },
          tracks: {
            total: playlist.tracks.total,
          },
        }))

        // Fetch Liked Songs as a pseudo-playlist and insert at the top
        let likedSongs: any = null
        try {
          const likedTracksResp = await spotifyApi.tracks.getSavedTracks({ limit: 1 })
          likedSongs = {
            id: 'liked-songs',
            name: 'Liked Songs',
            description: 'Your liked songs',
            images: [{ url: '/liked-songs.png', height: 64, width: 64 }],
            owner: { display_name: 'You', id: 'me' },
            tracks: { total: likedTracksResp.total },
          }
        } catch (err: any) {
          likedSongs = null
        }
        if (likedSongs) {
          playlistItems = [likedSongs, ...playlistItems]
        }
        setPlaylists(playlistItems)
        setCachedPlaylistsWithTTL(playlistItems)
      } catch (err) {
        setError('Failed to load playlists')
      } finally {
        setLoading(false)
      }
    },
    [spotifyApi],
  )

  // Memoized refresh handler to prevent infinite re-renders
  const handleRefresh = useCallback(() => {
    loadDataWithCache(true)
  }, [loadDataWithCache])

  useEffect(() => {
    if (spotifyApi && user) {
      loadDataWithCache()
    }
  }, [spotifyApi, user]) // Removed loadDataWithCache from dependencies to prevent infinite loop

  // Find the real album for a track by searching artist's albums
  const findRealAlbum = async (track: SpotifyTrack): Promise<SpotifyTrack> => {
    if (!spotifyApi || !track.artists?.[0]?.id) return track

    try {
      // Get all albums by the primary artist
      const artistAlbums = await spotifyApi.artists.getAlbums(track.artists[0].id, {
        include_groups: ['album'],
        limit: 50,
      })

      // Search through each album for this track
      for (const album of artistAlbums.items) {
        const albumTracks = await spotifyApi.albums.getTracks(album.id, { limit: 50 })
        const foundTrack = albumTracks.items.find(
          (t: any) => t.name.toLowerCase() === track.name.toLowerCase(),
        )

        if (foundTrack) {
          // Update track with real album info
          return {
            ...track,
            album: album,
          }
        }
      }
    } catch (err) {
      console.warn('Failed to find real album for track:', track.name)
    }

    return track
  }

  const shuffleAlbums = async () => {
    if (!spotifyApi || selectedPlaylists.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      const allTracks: ShuffledTrack[] = []

      // Get tracks from each selected playlist
      for (const playlistId of selectedPlaylists) {
        let tracksResponse
        if (playlistId === 'liked-songs') {
          const savedTracks = await spotifyApi.tracks.getSavedTracks({ limit: 50 })
          tracksResponse = { items: savedTracks.items.map((item: any) => ({ track: item.track })) }
        } else {
          tracksResponse = await spotifyApi.playlists.getTracks(playlistId, { limit: 50 })
        }

        // Convert to ShuffledTrack format with album info
        let tracksWithAlbumInfo: ShuffledTrack[] = tracksResponse.items.map((item: any) => ({
          ...item.track,
          albumName: item.track.album?.name || 'Unknown Album',
          albumId: item.track.album?.id || 'unknown',
        }))

        // If settings allow, find real albums for singles/compilations
        if (albumShuffleSettings.allowSingles || albumShuffleSettings.allowCompilations) {
          const processedTracks = []
          for (const track of tracksWithAlbumInfo) {
            if (track.album?.album_type === 'single' || track.album?.album_type === 'compilation') {
              const realTrack = await findRealAlbum(track)
              processedTracks.push({
                ...realTrack,
                albumName: realTrack.album?.name || track.albumName,
                albumId: realTrack.album?.id || track.albumId,
              })
            } else {
              processedTracks.push(track)
            }
          }
          tracksWithAlbumInfo = processedTracks
        }

        allTracks.push(...tracksWithAlbumInfo)
      }

      // Group tracks by album
      const albumGroups = new Map<string, ShuffledTrack[]>()
      allTracks.forEach((track) => {
        const albumKey = track.albumId
        if (!albumGroups.has(albumKey)) {
          albumGroups.set(albumKey, [])
        }
        albumGroups.get(albumKey)!.push(track)
      })

      // Filter albums based on settings
      let albumKeys = Array.from(albumGroups.keys())

      if (!albumShuffleSettings.allowSingles) {
        albumKeys = albumKeys.filter((key) => {
          const tracks = albumGroups.get(key) || []
          return tracks.length > 3 // Assume albums with >3 tracks are not singles
        })
      }

      if (!albumShuffleSettings.allowCompilations) {
        albumKeys = albumKeys.filter((key) => {
          const tracks = albumGroups.get(key) || []
          const firstTrack = tracks[0]
          return firstTrack?.album?.album_type !== 'compilation'
        })
      }

      // Limit to specified number of albums
      if (
        albumShuffleSettings.numberOfAlbums > 0 &&
        albumKeys.length > albumShuffleSettings.numberOfAlbums
      ) {
        albumKeys = albumKeys.slice(0, albumShuffleSettings.numberOfAlbums)
      }

      // Shuffle albums, then concatenate tracks in album order
      const shuffledAlbumKeys = albumKeys.sort(() => Math.random() - 0.5)

      const shuffledResult: ShuffledTrack[] = []
      shuffledAlbumKeys.forEach((albumKey) => {
        const albumTracks = albumGroups.get(albumKey) || []
        shuffledResult.push(...albumTracks)
      })

      setShuffledTracks(shuffledResult)
    } catch (err) {
      console.error('Error shuffling albums:', err)
      setError('Failed to shuffle albums')
    } finally {
      setProcessing(false)
    }
  }

  const combinePlaylists = async () => {
    if (!spotifyApi || selectedPlaylists.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      const allTracks: SpotifyTrack[] = []

      // Get tracks from each selected playlist
      for (const playlistId of selectedPlaylists) {
        let tracksResponse
        if (playlistId === 'liked-songs') {
          const savedTracks = await spotifyApi.tracks.getSavedTracks({ limit: 50 })
          tracksResponse = { items: savedTracks.items.map((item: any) => ({ track: item.track })) }
        } else {
          tracksResponse = await spotifyApi.playlists.getTracks(playlistId, { limit: 50 })
        }
        allTracks.push(...tracksResponse.items.map((item: any) => item.track))
      }

      // Remove duplicates by track ID
      const uniqueTracks = allTracks.filter(
        (track, index, self) => index === self.findIndex((t) => t.id === track.id),
      )

      // Apply shuffle settings
      let finalTracks = uniqueTracks
      if (shuffleSettings.algorithm === 'random') {
        finalTracks = [...uniqueTracks].sort(() => Math.random() - 0.5)
      } else if (shuffleSettings.algorithm === 'smart') {
        finalTracks = applySmartShuffle(
          uniqueTracks.map((track) => ({
            ...track,
            albumName: track.album?.name || 'Unknown Album',
            albumId: track.album?.id || 'unknown',
          })),
        )
      }
      // 'none' keeps original order

      setCombinedTracks(finalTracks)
    } catch (err) {
      console.error('Error combining playlists:', err)
      setError('Failed to combine playlists')
    } finally {
      setProcessing(false)
    }
  }

  const createPlaylistFromTracks = async (
    tracks: SpotifyTrack[],
    name: string,
    isPublic: boolean,
  ) => {
    if (!spotifyApi || tracks.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      // Create new playlist
      const newPlaylist = await spotifyApi.playlists.create(name, {
        description: `Created with Album Shuffle on ${new Date().toLocaleDateString()}`,
        public: isPublic,
      })

      // Add tracks to playlist in batches (Spotify limit is 100 per request)
      const batchSize = 100
      for (let i = 0; i < tracks.length; i += batchSize) {
        const batch = tracks.slice(i, i + batchSize)
        const trackUris = batch.map((track) => track.uri)
        await spotifyApi.playlists.addTracks(newPlaylist.id, trackUris)
      }

      // Refresh playlists and close modal
      await loadDataWithCache()
      setActiveModal(null)

      alert(`Playlist "${name}" created successfully with ${tracks.length} tracks!`)
    } catch (err) {
      console.error('Error creating playlist:', err)
      setError('Failed to create playlist')
    } finally {
      setProcessing(false)
    }
  }

  const applySmartShuffle = (tracks: ShuffledTrack[]): ShuffledTrack[] => {
    // Simple smart shuffle: avoid consecutive tracks from same artist
    const shuffled = [...tracks].sort(() => Math.random() - 0.5)

    // Try to separate tracks from the same artist
    for (let i = 1; i < shuffled.length; i++) {
      if (shuffled[i].artists[0]?.name === shuffled[i - 1].artists[0]?.name) {
        // Find a different track to swap with
        for (let j = i + 1; j < shuffled.length; j++) {
          if (shuffled[j].artists[0]?.name !== shuffled[i - 1].artists[0]?.name) {
            // Swap tracks
            const temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
            break
          }
        }
      }
    }

    return shuffled
  }

  // Table header configurations
  const playlistHeaders: TableHeaderConfig[] = [
    { key: 'checkbox', label: '', widthWeight: 0.5, minWidth: 40 },
    {
      key: 'thumbnail',
      label: '',
      widthWeight: 0.5,
      minWidth: 60,
      tooltip: 'hover for description',
    },
    { key: 'name', label: 'Name', widthWeight: 3, sortable: true },
    { key: 'owner', label: 'Owner', widthWeight: 2, sortable: true },
    { key: 'tracks', label: 'Tracks', widthWeight: 1, sortable: true },
  ]

  if (!accessToken) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Authentication Required" variant="error">
          <p>please log in with spotify to use playlist tools.</p>
          {error && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                background: 'var(--terminal-red-dim)',
                border: '1px solid var(--terminal-red)',
              }}
            >
              <p style={{ color: 'var(--terminal-red-bright)', fontWeight: 600 }}>{error}</p>
            </div>
          )}
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="wireframe-container" style={{ overflowY: 'auto', maxHeight: '100vh' }}>
      {/* Tool Buttons Row - 4 sections: Album Shuffle | Playlist Combiner | Blank Space | Retrieved Album History */}
      <div
        style={{
          display: 'flex',
          gap: '1em',
          marginBottom: '1.25em',
          alignItems: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Album Shuffle Button */}
        <WireframeButton
          onClick={() => setActiveModal('album-shuffle')}
          disabled={selectedPlaylists.length === 0}
          title={selectedPlaylists.length === 0 ? 'select at least 1 playlist' : ''}
          style={{
            background: 'var(--terminal-bg)',
            border: '1px solid var(--terminal-cyan)',
            color: 'var(--terminal-cyan)',
            fontSize: 'var(--terminal-font-size)',
            padding: '0.75em 1em',
            flex: '1',
            minWidth: 'max-content',
          }}
        >
          album shuffle
        </WireframeButton>

        {/* Playlist Combiner Button */}
        <WireframeButton
          onClick={() => setActiveModal('playlist-combiner')}
          disabled={selectedPlaylists.length === 0}
          title={selectedPlaylists.length === 0 ? 'select at least 1 playlist' : ''}
          style={{
            background: 'var(--terminal-bg)',
            border: '1px solid var(--terminal-cyan)',
            color: 'var(--terminal-cyan)',
            fontSize: 'var(--terminal-font-size)',
            padding: '0.75em 1em',
            flex: '1',
            minWidth: 'max-content',
          }}
        >
          playlist combiner
        </WireframeButton>

        {/* Blank Space */}
        <div style={{ flex: '1' }}></div>

        {/* Retrieved Album History Button */}
        <WireframeButton
          onClick={() => {
            // TODO: Implement history functionality
            console.log('Show album history')
          }}
          disabled={true} // Will be enabled when history exists
          title="no history"
          style={{
            fontSize: 'var(--terminal-font-size)',
            padding: '0.75em 1em',
            flex: '1',
            minWidth: 'max-content',
            opacity: 0.5,
          }}
        >
          retrieved album history
        </WireframeButton>
      </div>

      {error && (
        <WireframePanel title="error" variant="error">
          <p>{error}</p>
          <WireframeButton onClick={() => loadDataWithCache()} disabled={loading}>
            retry
          </WireframeButton>
        </WireframePanel>
      )}

      {/* Playlist Selector - CRITICAL: This component IS the panel, not wrapped in one */}
      {playlists.length > 0 ? (
        // The PlaylistSelector component handles its own panel styling internally.
        // Any wrapper styling here creates an ugly double-panel effect.
        <div
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            height:
              'calc(100vh - 300px)' /* Use height instead of maxHeight for proper flex sizing */,
            display: 'flex',
            flexDirection: 'column',
            margin: '20px 0',
            paddingBottom: '20px' /* Add padding to prevent bottom border cutoff */,
            overflow: 'visible' /* Allow PlaylistSelector to manage its own overflow */,
          }}
        >
          <PlaylistSelector
            type="playlist"
            items={filteredPlaylists}
            selectedItems={selectedPlaylists}
            onSelectionChange={(playlistId, selected) => {
              setSelectedPlaylists((prev) =>
                selected ? [...prev, playlistId] : prev.filter((id) => id !== playlistId),
              )
            }}
            onDeselectAll={() => setSelectedPlaylists([])}
            headerConfigs={playlistHeaders}
            itemsPerPage={15}
            searchValue={playlistSearch}
            onSearchChange={setPlaylistSearch}
            onRefresh={handleRefresh}
            showRefresh={true}
            showDeselectAll={true}
          />
        </div>
      ) : loading ? (
        <div
          style={{
            margin: '20px 0',
            padding: '20px',
            border: '1px solid var(--terminal-cyan-dim)',
            background: 'var(--terminal-gray-dim)',
            color: 'var(--text-cyan)',
          }}
        >
          <p>loading playlists...</p>
        </div>
      ) : (
        <div
          style={{
            margin: '20px 0',
            padding: '20px',
            border: '1px solid var(--terminal-cyan-dim)',
            background: 'var(--terminal-gray-dim)',
            color: 'var(--text-cyan)',
          }}
        >
          <p>no playlists found.</p>
        </div>
      )}

      {/* Album Shuffle Modal */}
      <AlbumShuffleModal
        isOpen={activeModal === 'album-shuffle'}
        onClose={() => setActiveModal(null)}
        selectedPlaylists={selectedPlaylists}
        playlistAlbums={playlistAlbums}
        onCreatePlaylist={async (tracks, name, isPublic) => {
          try {
            const result = await createPlaylistFromTracks(tracks as any, name, isPublic)
            return result
          } catch (error) {
            console.error('Error creating playlist:', error)
            return null
          }
        }}
        processing={processing}
      />

      {/* Playlist Combiner Modal */}
      {activeModal === 'playlist-combiner' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 8, 17, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--terminal-bg)',
              border: '2px solid var(--terminal-cyan)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <WireframePanel title="playlist combiner settings">
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  shuffle mode:
                  <select
                    value={shuffleSettings.algorithm}
                    onChange={(e) =>
                      setShuffleSettings((prev) => ({
                        ...prev,
                        algorithm: e.target.value as 'random' | 'smart' | 'none',
                      }))
                    }
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--terminal-cyan)',
                      background: 'var(--terminal-bg)',
                      color: 'var(--terminal-cyan)',
                    }}
                  >
                    <option value="smart">smart shuffle</option>
                    <option value="random">random shuffle</option>
                    <option value="none">no shuffle</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  playlist name:
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--terminal-cyan)',
                      background: 'var(--terminal-bg)',
                      color: 'var(--terminal-cyan)',
                      minWidth: '200px',
                    }}
                    placeholder="combined playlist"
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  visibility:
                  <select
                    value={playlistPublic ? 'public' : 'private'}
                    onChange={(e) => setPlaylistPublic(e.target.value === 'public')}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--terminal-cyan)',
                      background: 'var(--terminal-bg)',
                      color: 'var(--terminal-cyan)',
                    }}
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                  </select>
                </label>
              </div>

              {combinedTracks.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ color: 'var(--terminal-cyan-bright)', marginBottom: '10px' }}>
                    preview ({combinedTracks.length} tracks)
                  </h3>
                  <div
                    style={{
                      maxHeight: '300px',
                      overflow: 'auto',
                      border: '1px solid var(--terminal-cyan)',
                      padding: '10px',
                    }}
                  >
                    {combinedTracks.map((track, index) => (
                      <div
                        key={`${track.id}-${index}`}
                        style={{
                          padding: '4px 0',
                          borderBottom: '1px solid var(--terminal-cyan-dim)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '14px',
                        }}
                      >
                        <span>
                          {index + 1}. {track.name}
                        </span>
                        <span style={{ opacity: 0.7 }}>{track.artists[0]?.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <WireframeButton onClick={combinePlaylists} disabled={processing}>
                    {processing
                      ? 'processing...'
                      : combinedTracks.length > 0
                      ? 'reshuffle'
                      : 'combine playlists'}
                  </WireframeButton>
                  {combinedTracks.length > 0 && (
                    <WireframeButton
                      onClick={() =>
                        createPlaylistFromTracks(
                          combinedTracks,
                          playlistName || 'combined playlist',
                          playlistPublic,
                        )
                      }
                      disabled={processing}
                      style={{
                        background: 'var(--terminal-green)',
                        color: 'var(--terminal-bg)',
                        fontWeight: 700,
                      }}
                    >
                      create playlist
                    </WireframeButton>
                  )}
                </div>

                {/* Last.fm Integration (MVP: Coming Soon) */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <WireframeCheckbox
                    checked={enableLastFm}
                    onChange={(e) => setEnableLastFm(e.target.checked)}
                    label="last.fm"
                    disabled={true}
                    style={{
                      opacity: 0.6,
                      cursor: 'not-allowed',
                    }}
                    title="Last.fm integration coming soon! Will provide genre detection and similar album suggestions."
                  />
                </div>

                <WireframeButton onClick={() => setActiveModal(null)} variant="panel">
                  close
                </WireframeButton>
              </div>
            </WireframePanel>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlaylistTools
