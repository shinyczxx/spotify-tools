/**
 * @file AlbumShuffleModal.tsx
 * @description Comprehensive album shuffle modal with organized panel structure
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with 6-panel structure
 */

import React, { useState, useEffect, useRef } from 'react'
import { WireframeButton, WireframePanel, WireframeCheckbox } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import LoadingSpinner from '@components/LoadingSpinner'
import { AlbumPreview } from '@components/AlbumPreview'
import { Toggle } from '@components/Toggle'
import { AlbumShuffleSettings, ShuffledTrack, ShuffleAlgorithm } from 'types/playlist'
import { shuffleTracksWithAlgorithm } from '@utils/shuffleUtils'
import { generateFunPlaylistName } from '@utils/playlistNameGenerator'
import { saveAlbumHistory } from '@utils/albumHistory'
import {
  fetchAlbumsFromPlaylists,
  selectAlbumsWithTrackLimits,
  SPOTIFY_PLAYLIST_LIMITS,
  type AlbumWithTrackCount,
  type TrackLimitMode,
} from '@utils/playlistAlbumFetcher'
import '@styles/buttonGlitches.css'

interface AlbumShuffleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlaylists: string[]
  onCreatePlaylist: (
    tracks: ShuffledTrack[],
    name: string,
    isPublic: boolean,
  ) => Promise<{ external_urls: { spotify: string } } | null>
  processing: boolean
  // New props for history support
  preloadedAlbums?: AlbumWithTrackCount[]
  fromHistory?: boolean
}

interface ShuffleConfig extends AlbumShuffleSettings {
  algorithm: ShuffleAlgorithm
  trackLimitMode: TrackLimitMode
  maxTracks: number
}

export const AlbumShuffleModal: React.FC<AlbumShuffleModalProps> = ({
  isOpen,
  onClose,
  selectedPlaylists,
  onCreatePlaylist,
  processing,
  preloadedAlbums,
  fromHistory = false,
}) => {
  // State management
  const [shuffleConfig, setShuffleConfig] = useState<ShuffleConfig>({
    allowSingles: false, // Default to unchecked as requested
    allowCompilations: false,
    numberOfAlbums: 25,
    algorithm: 'random',
    trackLimitMode: 'soft' as TrackLimitMode,
    maxTracks: SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS,
  })

  const [playlistName, setPlaylistName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [allRetrievedAlbums, setAllRetrievedAlbums] = useState<AlbumWithTrackCount[]>([])
  const [selectedAlbums, setSelectedAlbums] = useState<AlbumWithTrackCount[]>([])
  const [shuffledTracks, setShuffledTracks] = useState<ShuffledTrack[]>([])
  const [trackLimitInfo, setTrackLimitInfo] = useState<{
    totalTracks: number
    limitReached: boolean
    excludedAlbums: AlbumWithTrackCount[]
  }>({ totalTracks: 0, limitReached: false, excludedAlbums: [] })
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null)
  const [shuffleButtonGlitch, setShuffleButtonGlitch] = useState(false)
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0 })
  const [isFetching, setIsFetching] = useState(false)

  // Ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Generate initial playlist name
  useEffect(() => {
    if (isOpen && !playlistName) {
      setPlaylistName(generateFunPlaylistName())
    }
  }, [isOpen, playlistName])

  // Shuffle albums when settings change and we have all albums
  useEffect(() => {
    if (allRetrievedAlbums.length > 0) {
      handleShuffleAndSelect()
    }
  }, [
    allRetrievedAlbums,
    shuffleConfig.allowSingles,
    shuffleConfig.allowCompilations,
    shuffleConfig.numberOfAlbums,
    shuffleConfig.maxTracks,
    shuffleConfig.trackLimitMode,
    shuffleConfig.algorithm,
  ])

  // Shuffle and select albums based on current settings
  const handleShuffleAndSelect = async () => {
    if (allRetrievedAlbums.length === 0) return

    // Filter albums based on type preferences
    let filteredAlbums = allRetrievedAlbums

    if (!shuffleConfig.allowSingles) {
      filteredAlbums = filteredAlbums.filter((album) => album.album_type !== 'single')
    }

    if (!shuffleConfig.allowCompilations) {
      filteredAlbums = filteredAlbums.filter((album) => album.album_type !== 'compilation')
    }

    // Convert to SpotifyAlbum format for shuffling
    const albumsForShuffle = filteredAlbums.map(({ estimatedTrackCount, ...album }) => album)

    // Shuffle ALL albums first using the selected algorithm
    const shuffledAlbums = await shuffleTracksWithAlgorithm(
      albumsForShuffle,
      shuffleConfig.algorithm,
    )

    // Extract unique albums from shuffled tracks (removes duplicates)
    const uniqueShuffledAlbums = []
    const seenAlbumIds = new Set()

    for (const track of shuffledAlbums) {
      if (!seenAlbumIds.has(track.albumId)) {
        seenAlbumIds.add(track.albumId)
        // Find the original album with track count
        const originalAlbum = filteredAlbums.find((a) => a.id === track.albumId)
        if (originalAlbum) {
          uniqueShuffledAlbums.push(originalAlbum)
        }
      }
    }

    // Apply track limits and album count to shuffled albums
    const selectionResult = selectAlbumsWithTrackLimits(
      uniqueShuffledAlbums,
      shuffleConfig.numberOfAlbums,
      shuffleConfig.maxTracks,
      shuffleConfig.trackLimitMode,
      true, // preserveOrder = true to maintain shuffled order
    )

    setSelectedAlbums(selectionResult.selectedAlbums)
    setTrackLimitInfo({
      totalTracks: selectionResult.totalTracks,
      limitReached: selectionResult.limitReached,
      excludedAlbums: selectionResult.excludedAlbums,
    })

    // Generate final shuffled tracks from selected albums
    if (selectionResult.selectedAlbums.length > 0) {
      const albumsForFinalShuffle = selectionResult.selectedAlbums.map(
        ({ estimatedTrackCount, ...album }) => album,
      )
      const finalTracks = await shuffleTracksWithAlgorithm(
        albumsForFinalShuffle,
        shuffleConfig.algorithm,
      )
      setShuffledTracks(finalTracks)
    } else {
      setShuffledTracks([])
    }

    console.debug('🔄 Updated album selection and shuffle:', {
      allRetrieved: allRetrievedAlbums.length,
      filtered: filteredAlbums.length,
      shuffled: uniqueShuffledAlbums.length,
      selected: selectionResult.selectedAlbums.length,
      estimatedTracks: selectionResult.totalTracks,
      limitReached: selectionResult.limitReached,
    })
  }

  // Get Albums functionality
  const handleGetAlbums = async () => {
    if (selectedPlaylists.length === 0) return

    setIsFetching(true)
    setIsLoadingAlbums(true)
    setFetchProgress({ current: 0, total: selectedPlaylists.length })

    try {
      console.debug('🎯 Starting album fetch for playlists:', selectedPlaylists)

      // Use the new fetcher utility with progress callback
      const result = await fetchAlbumsFromPlaylists(selectedPlaylists, (current, total) => {
        if (isMountedRef.current) {
          setFetchProgress({ current, total })
        }
      })

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      console.debug('📊 Retrieved all albums:', {
        totalAlbums: result.albumsWithTrackCounts.length,
        totalTracks: result.totalTracks,
        fromCache: result.fromCache,
      })

      // Store all retrieved albums - filtering will happen in useEffect
      setAllRetrievedAlbums(result.albumsWithTrackCounts)

      console.debug('✅ Album fetch complete:', {
        totalTracks: result.totalTracks,
        uniqueAlbums: result.albumsWithTrackCounts.length,
        fromCache: result.fromCache,
      })

      // Save to history
      const playlistNames = selectedPlaylists.map((id) => `Playlist ${id}`)
      saveAlbumHistory(playlistNames, selectedPlaylists, result.albums)
    } catch (error) {
      console.error('❌ Error getting albums:', error)
      if (isMountedRef.current) {
        // Could add error state here if needed
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingAlbums(false)
        setIsFetching(false)
        setFetchProgress({ current: 0, total: 0 })
      }
    }
  }

  // Reshuffle albums with glitch effect
  const handleReshuffle = async () => {
    if (allRetrievedAlbums.length === 0) return

    // Trigger glitch effect
    setShuffleButtonGlitch(true)
    setTimeout(() => setShuffleButtonGlitch(false), 150) // Quick glitch

    setIsShuffling(true)
    try {
      await handleShuffleAndSelect()
    } catch (error) {
      console.error('Error reshuffling albums:', error)
    } finally {
      setIsShuffling(false)
    }
  }

  // Create playlist functionality
  const handleCreatePlaylist = async () => {
    if (shuffledTracks.length === 0) return

    try {
      const result = await onCreatePlaylist(shuffledTracks, playlistName, isPublic)
      if (result?.external_urls?.spotify) {
        setCreatedPlaylistUrl(result.external_urls.spotify)
      }
    } catch (error) {
      console.error('Error creating playlist:', error)
    }
  }

  // Initialize albums from history if provided
  useEffect(() => {
    if (isOpen && preloadedAlbums && fromHistory) {
      console.debug('🔄 Loading preloaded albums from history:', preloadedAlbums.length)

      // Deduplicate albums across multiple playlists by album ID
      const uniqueAlbums = preloadedAlbums.reduce((acc, album) => {
        const existing = acc.find((a) => a.id === album.id)
        if (!existing) {
          acc.push(album)
        } else {
          // Keep the album with higher track count if duplicates found
          if (album.estimatedTrackCount > existing.estimatedTrackCount) {
            const index = acc.findIndex((a) => a.id === album.id)
            acc[index] = album
          }
        }
        return acc
      }, [] as AlbumWithTrackCount[])

      console.debug('🎯 Deduplicated albums from history:', {
        original: preloadedAlbums.length,
        deduplicated: uniqueAlbums.length,
      })

      setAllRetrievedAlbums(uniqueAlbums)
      setShuffledTracks([])
      setSelectedAlbums([])
      setTrackLimitInfo({ totalTracks: 0, limitReached: false, excludedAlbums: [] })
      setCreatedPlaylistUrl(null)
      setPlaylistName(generateFunPlaylistName())
      isMountedRef.current = true
    } else if (isOpen && !fromHistory) {
      setShuffledTracks([])
      setAllRetrievedAlbums([])
      setSelectedAlbums([])
      setTrackLimitInfo({ totalTracks: 0, limitReached: false, excludedAlbums: [] })
      setCreatedPlaylistUrl(null)
      setPlaylistName(generateFunPlaylistName())
      isMountedRef.current = true
    }
  }, [isOpen, preloadedAlbums, fromHistory])

  // Don't interrupt fetching when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Mark component as unmounted to prevent state updates
      isMountedRef.current = false
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
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
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--terminal-bg)',
          border: '2px solid var(--circuit-color)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Row 1: Album Types + Get Albums */}
        <WireframePanel
          title={fromHistory ? 'album types (loaded from history)' : 'album types & retrieval'}
        >
          <div style={{ display: 'flex', gap: '1em' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1em' }}>
              <div style={{ display: 'flex', gap: '2em', flexWrap: 'wrap', alignItems: 'center' }}>
                <WireframeCheckbox
                  checked={shuffleConfig.allowSingles}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log('Singles checkbox changed:', e.target.checked)
                    setShuffleConfig((prev) => ({ ...prev, allowSingles: e.target.checked }))
                  }}
                  label="include singles"
                />
                <WireframeCheckbox
                  checked={shuffleConfig.allowCompilations}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    console.log('Compilations checkbox changed:', e.target.checked)
                    setShuffleConfig((prev) => ({ ...prev, allowCompilations: e.target.checked }))
                  }}
                  label="include compilations"
                />
                <TooltipIcon
                  contents="If a type is unchecked, the tool will search for full albums containing songs from that type and substitute the single/compilation with the full album"
                  size={16}
                  direction="left"
                  ariaLabel="Album type filtering help"
                />
              </div>

              {!fromHistory && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                  <WireframeButton
                    onClick={handleGetAlbums}
                    disabled={isLoadingAlbums || selectedPlaylists.length === 0}
                  >
                    {isLoadingAlbums
                      ? `loading albums... (${fetchProgress.current}/${fetchProgress.total})`
                      : 'get albums from selected playlists'}
                  </WireframeButton>
                </div>
              )}

              {fromHistory && (
                <div
                  style={{
                    padding: '0.5em',
                    border: '1px solid var(--terminal-green)',
                    background: 'rgba(0, 255, 0, 0.1)',
                    fontSize: '0.9em',
                    color: 'var(--terminal-green)',
                  }}
                >
                  ✅ Albums loaded from history ({allRetrievedAlbums.length} unique albums)
                </div>
              )}
            </div>

            {/* Loading animation on the right side */}
            {isFetching && (
              <div
                style={{
                  width: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1em',
                  border: '1px solid var(--circuit-color-dim)',
                  background: 'rgba(0, 255, 255, 0.05)',
                }}
              >
                <LoadingSpinner size="small" />
                <div
                  style={{
                    marginTop: '0.5em',
                    fontSize: '0.8em',
                    color: 'var(--circuit-color-dim)',
                    textAlign: 'center',
                  }}
                >
                  fetching...
                  <br />
                  {fetchProgress.current}/{fetchProgress.total}
                </div>
              </div>
            )}
          </div>
        </WireframePanel>

        {/* Remaining panels - dimmed if no albums retrieved */}
        <div
          style={{
            opacity: allRetrievedAlbums.length > 0 ? 1 : 0.4,
            pointerEvents: allRetrievedAlbums.length > 0 ? 'auto' : 'none',
          }}
        >
          {/* Row 2: Shuffle Algorithm Settings */}
          <WireframePanel title="shuffle algorithm" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                <select
                  value={shuffleConfig.algorithm}
                  onChange={(e) =>
                    setShuffleConfig((prev) => ({
                      ...prev,
                      algorithm: e.target.value as ShuffleAlgorithm,
                    }))
                  }
                  style={{
                    padding: '0.5em',
                    border: '1px solid var(--circuit-color)',
                    background: 'var(--terminal-bg)',
                    color: 'var(--circuit-color)',
                    fontSize: 'var(--terminal-font-size)',
                    width: '300px',
                  }}
                >
                  <option value="random">random shuffle</option>
                  <option value="weighted-newer">weighted (newer albums preferred)</option>
                  <option value="weighted-older">weighted (older albums preferred)</option>
                  <option value="chronological">chronological (with randomness)</option>
                  <option value="spiral-dance">
                    spiral dance (alphabetical + chronological weave)
                  </option>
                </select>
                <TooltipIcon
                  contents={
                    <div>
                      <div>
                        <strong>Random:</strong> Pure random shuffle
                      </div>
                      <div>
                        <strong>Weighted Newer:</strong> Prefers recent releases
                      </div>
                      <div>
                        <strong>Weighted Older:</strong> Prefers classic albums
                      </div>
                      <div>
                        <strong>Chronological:</strong> Release date order with 30% randomness
                      </div>
                      <div>
                        <strong>Spiral Dance:</strong> Weaves between alphabetical and chronological
                        order
                      </div>
                    </div>
                  }
                  size={16}
                  direction="left"
                  ariaLabel="Shuffle algorithm help"
                />
              </div>
              <div
                style={{
                  fontSize: '0.85em',
                  color: 'var(--circuit-color-dim)',
                  maxWidth: '500px',
                }}
              >
                {shuffleConfig.algorithm === 'random' && 'Pure random shuffle of all albums'}
                {shuffleConfig.algorithm === 'weighted-newer' &&
                  'Prefers recently released albums with randomness'}
                {shuffleConfig.algorithm === 'weighted-older' &&
                  'Prefers classic/vintage albums with randomness'}
                {shuffleConfig.algorithm === 'chronological' &&
                  'Orders by release date with 30% randomness'}
                {shuffleConfig.algorithm === 'spiral-dance' &&
                  'Creates a spiral pattern alternating between alphabetical and chronological order'}
              </div>
            </div>
          </WireframePanel>

          {/* Row 3: Album & Track Limits */}
          <WireframePanel title="album & track limits" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
              {/* Album Count */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <label style={{ color: 'var(--circuit-color)', whiteSpace: 'nowrap' }}>
                  max albums:
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={shuffleConfig.numberOfAlbums}
                  onChange={(e) =>
                    setShuffleConfig((prev) => ({
                      ...prev,
                      numberOfAlbums: parseInt(e.target.value) || 25,
                    }))
                  }
                  style={{
                    width: '80px',
                    padding: '0.5em',
                    border: '1px solid var(--circuit-color)',
                    background: 'var(--terminal-bg)',
                    color: 'var(--circuit-color)',
                    fontSize: 'var(--terminal-font-size)',
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                  }}
                />
                <WireframeButton
                  onClick={() => {
                    const randomCount =
                      Math.floor(Math.random() * Math.min(50, allRetrievedAlbums.length)) + 10
                    setShuffleConfig((prev) => ({ ...prev, numberOfAlbums: randomCount }))
                  }}
                  disabled={allRetrievedAlbums.length === 0}
                  style={{
                    background: 'var(--terminal-bg)',
                    border: '1px solid var(--terminal-cyan)',
                    color: 'var(--terminal-cyan)',
                  }}
                >
                  random
                </WireframeButton>
                <span style={{ color: 'var(--circuit-color-dim)', fontSize: '0.9em' }}>
                  (0 for unlimited)
                </span>
              </div>

              {/* Max Tracks Setting */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <label style={{ color: 'var(--circuit-color)', whiteSpace: 'nowrap' }}>
                  max tracks:
                </label>
                <input
                  type="number"
                  min="100"
                  max={SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS}
                  value={shuffleConfig.maxTracks}
                  onChange={(e) =>
                    setShuffleConfig((prev) => ({
                      ...prev,
                      maxTracks: parseInt(e.target.value) || SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS,
                    }))
                  }
                  style={{
                    width: '100px',
                    padding: '0.5em',
                    border: '1px solid var(--circuit-color)',
                    background: 'var(--terminal-bg)',
                    color: 'var(--circuit-color)',
                    fontSize: 'var(--terminal-font-size)',
                    MozAppearance: 'textfield',
                    WebkitAppearance: 'none',
                  }}
                />
                <WireframeButton
                  onClick={() => {
                    const avgTracksPerAlbum =
                      allRetrievedAlbums.length > 0
                        ? Math.round(
                            allRetrievedAlbums.reduce(
                              (sum, album) => sum + album.estimatedTrackCount,
                              0,
                            ) / allRetrievedAlbums.length,
                          )
                        : 12
                    const randomTrackCount =
                      Math.floor(Math.random() * 3000) + avgTracksPerAlbum * 10
                    setShuffleConfig((prev) => ({
                      ...prev,
                      maxTracks: Math.min(randomTrackCount, SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS),
                    }))
                  }}
                  disabled={allRetrievedAlbums.length === 0}
                  style={{
                    background: 'var(--terminal-bg)',
                    border: '1px solid var(--terminal-cyan)',
                    color: 'var(--terminal-cyan)',
                  }}
                >
                  random
                </WireframeButton>
                <span style={{ color: 'var(--circuit-color-dim)', fontSize: '0.9em' }}>
                  (Spotify limit: {SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS.toLocaleString()})
                </span>
              </div>

              {/* Track Limit Mode */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                  <label style={{ color: 'var(--circuit-color)', whiteSpace: 'nowrap' }}>
                    limit mode:
                  </label>
                  <TooltipIcon
                    contents={
                      <div>
                        <div>
                          <strong>Soft cap:</strong> Allow albums to exceed track limit
                        </div>
                        <div>
                          <strong>Hard cap:</strong> Strict limit, exclude albums that would exceed
                        </div>
                      </div>
                    }
                    size={16}
                    direction="left"
                    ariaLabel="Track limit mode help"
                  />
                </div>
                <div style={{ width: '200px' }}>
                  <Toggle
                    leftLabel="soft cap"
                    rightLabel="hard cap"
                    selected={shuffleConfig.trackLimitMode === 'hard' ? 'right' : 'left'}
                    onToggle={(selected) =>
                      setShuffleConfig((prev) => ({
                        ...prev,
                        trackLimitMode: selected === 'right' ? 'hard' : 'soft',
                      }))
                    }
                  />
                </div>
              </div>

              {/* Track Limit Status */}
              {trackLimitInfo.totalTracks > 0 && (
                <div
                  style={{
                    padding: '0.5em',
                    border: `1px solid ${
                      trackLimitInfo.limitReached ? 'var(--warning)' : 'var(--circuit-color-dim)'
                    }`,
                    background: trackLimitInfo.limitReached
                      ? 'rgba(255, 165, 0, 0.1)'
                      : 'rgba(0, 255, 255, 0.05)',
                    fontSize: '0.9em',
                  }}
                >
                  <div
                    style={{
                      color: trackLimitInfo.limitReached
                        ? 'var(--warning)'
                        : 'var(--circuit-color)',
                    }}
                  >
                    {trackLimitInfo.limitReached ? '⚠️' : '✅'}{' '}
                    {trackLimitInfo.totalTracks.toLocaleString()} estimated tracks
                    {trackLimitInfo.limitReached && (
                      <span> • {trackLimitInfo.excludedAlbums.length} albums excluded</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </WireframePanel>

          {/* Row 4: Playlist Settings */}
          <WireframePanel title="playlist settings" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5em' }}>
              {/* Playlist Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <label style={{ color: 'var(--circuit-color)', whiteSpace: 'nowrap' }}>
                  playlist name:
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  style={{
                    padding: '0.5em',
                    border: '1px solid var(--circuit-color)',
                    background: 'var(--terminal-bg)',
                    color: 'var(--circuit-color)',
                    minWidth: '300px',
                    fontSize: 'var(--terminal-font-size)',
                  }}
                  placeholder="enter playlist name"
                />
                <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'nowrap' }}>
                  <WireframeButton
                    onClick={() => setPlaylistName(generateFunPlaylistName())}
                    style={{
                      background: 'var(--terminal-bg)',
                      border: '1px solid var(--terminal-cyan)',
                      color: 'var(--terminal-cyan)',
                    }}
                  >
                    random name
                  </WireframeButton>
                  <WireframeButton
                    onClick={() => {
                      const now = new Date()
                      const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                        2,
                        '0',
                      )}-${String(now.getDate()).padStart(2, '0')} ${String(
                        now.getHours(),
                      ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                      setPlaylistName(formatted)
                    }}
                    style={{
                      background: 'var(--terminal-bg)',
                      border: '1px solid var(--terminal-cyan)',
                      color: 'var(--terminal-cyan)',
                    }}
                  >
                    current date time
                  </WireframeButton>
                </div>
              </div>

              {/* Public/Private Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
                <label style={{ color: 'var(--circuit-color)', whiteSpace: 'nowrap' }}>
                  playlist visibility:
                </label>
                <div style={{ width: '200px' }}>
                  <Toggle
                    leftLabel="private"
                    rightLabel="public"
                    selected={isPublic ? 'right' : 'left'}
                    onToggle={(selected) => setIsPublic(selected === 'right')}
                  />
                </div>
              </div>
            </div>
          </WireframePanel>

          {/* Albums Preview - shows actual shuffled order */}
          {selectedAlbums.length > 0 && (
            <WireframePanel
              title="playlist will contain:"
              style={{ borderTop: 'none' }}
              padding="small"
            >
              <AlbumPreview
                albums={selectedAlbums}
                title={`${
                  selectedAlbums.length
                } albums in shuffled order (${trackLimitInfo.totalTracks.toLocaleString()} estimated tracks)`}
                maxHeight="250px"
              />
            </WireframePanel>
          )}

          {/* Row 5: Actions */}
          <WireframePanel title="actions" style={{ borderTop: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', alignItems: 'center' }}>
                <WireframeButton
                  onClick={handleReshuffle}
                  disabled={selectedAlbums.length === 0 || isShuffling}
                  className={shuffleButtonGlitch ? 'button-glitch-active' : ''}
                  style={{
                    background: 'var(--terminal-bg)',
                    border: '1px solid var(--terminal-cyan)',
                    color: 'var(--terminal-cyan)',
                  }}
                >
                  {isShuffling ? 'shuffling...' : 'reshuffle albums'}
                </WireframeButton>

                <div style={{ marginLeft: 'auto' }}>
                  <WireframeButton
                    onClick={handleCreatePlaylist}
                    disabled={processing || shuffledTracks.length === 0}
                    style={{
                      background: 'var(--terminal-bg)',
                      border:
                        shuffledTracks.length > 0
                          ? '1px solid var(--terminal-green)'
                          : '1px solid var(--circuit-color)',
                      color:
                        shuffledTracks.length > 0
                          ? 'var(--terminal-green)'
                          : 'var(--circuit-color)',
                      fontWeight: 'bold',
                    }}
                  >
                    {processing ? 'creating...' : 'create playlist'}
                  </WireframeButton>
                </div>

                {createdPlaylistUrl && (
                  <WireframeButton
                    onClick={() => window.open(createdPlaylistUrl, '_blank')}
                    style={{
                      background: 'var(--terminal-bg)',
                      border: '1px solid var(--spotify-green)',
                      color: 'var(--spotify-green)',
                      fontWeight: 'bold',
                    }}
                  >
                    open in spotify
                  </WireframeButton>
                )}
              </div>
            </div>
          </WireframePanel>
        </div>
      </div>
    </div>
  )
}
