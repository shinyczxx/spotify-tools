/**
 * @file useAlbumShuffle.ts
 * @description Custom hook for album shuffle business logic and state management
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect, useRef } from 'react'
import { ShuffleConfig, TrackLimitInfo, FetchProgress, ShuffleState } from 'types/albumShuffle'
import { ShuffledTrack } from 'types/playlist'
import { AlbumWithTrackCount, TrackLimitMode } from '@utils/playlistAlbumFetcher'
import { shuffleTracksWithAlgorithm } from '@utils/shuffleUtils'
import { generateFunPlaylistName } from '@utils/playlistNameGenerator'
import { saveAlbumHistory } from '@utils/albumHistory'
import {
  fetchAlbumsFromPlaylists,
  selectAlbumsWithTrackLimits,
  SPOTIFY_PLAYLIST_LIMITS,
} from '@utils/playlistAlbumFetcher'

interface UseAlbumShuffleProps {
  isOpen: boolean
  selectedPlaylists: string[]
  preloadedAlbums?: AlbumWithTrackCount[]
  fromHistory?: boolean
  onCreatePlaylist: (
    tracks: ShuffledTrack[],
    name: string,
    isPublic: boolean,
  ) => Promise<{ external_urls: { spotify: string } } | null>
}

export const useAlbumShuffle = ({
  isOpen,
  selectedPlaylists,
  preloadedAlbums,
  fromHistory = false,
  onCreatePlaylist,
}: UseAlbumShuffleProps) => {
  // Ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Initialize state
  const [shuffleConfig, setShuffleConfig] = useState<ShuffleConfig>({
    allowSingles: false,
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
  const [trackLimitInfo, setTrackLimitInfo] = useState<TrackLimitInfo>({
    totalTracks: 0,
    limitReached: false,
    excludedAlbums: [],
  })
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)
  const [createdPlaylistUrl, setCreatedPlaylistUrl] = useState<string | null>(null)
  const [shuffleButtonGlitch, setShuffleButtonGlitch] = useState(false)
  const [fetchProgress, setFetchProgress] = useState<FetchProgress>({ current: 0, total: 0 })
  const [isFetching, setIsFetching] = useState(false)
  const [trackFetchingStatus, setTrackFetchingStatus] = useState<string>('')

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

    console.debug('🎲 Starting shuffle with random seed:', Math.random())

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
      finalTracksLength: shuffledTracks.length,
      estimatedTracks: selectionResult.totalTracks,
      limitReached: selectionResult.limitReached,
      firstThreeAlbums: selectionResult.selectedAlbums.slice(0, 3).map(a => a.name),
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

  // Reshuffle albums with glitch effect - ONLY reshuffles, no refetching
  const handleReshuffle = async () => {
    if (allRetrievedAlbums.length === 0) return

    // Trigger glitch effect
    setShuffleButtonGlitch(true)
    setTimeout(() => setShuffleButtonGlitch(false), 400) // Longer hacking-style glitch

    setIsShuffling(true)
    try {
      // Force a new shuffle by calling handleShuffleAndSelect directly
      // This uses existing allRetrievedAlbums without refetching
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

  return {
    // State
    shuffleConfig,
    setShuffleConfig,
    playlistName,
    setPlaylistName,
    isPublic,
    setIsPublic,
    allRetrievedAlbums,
    selectedAlbums,
    shuffledTracks,
    trackLimitInfo,
    isLoadingAlbums,
    isShuffling,
    createdPlaylistUrl,
    shuffleButtonGlitch,
    fetchProgress,
    isFetching,
    trackFetchingStatus,
    
    // Actions
    handleGetAlbums,
    handleReshuffle,
    handleCreatePlaylist,
    handleShuffleAndSelect,
  }
}