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
import { AlbumWithTrackCount, TrackLimitMode } from '@utils/playlist/playlistAlbumFetcher'
import { shuffleTracksWithAlgorithm, generateSimulatedTracks } from '@utils/shuffle/shuffleUtils'
import { generateFunPlaylistName } from '@utils/playlist/playlistNameGenerator'
import { saveAlbumHistory } from '@utils/album/albumHistory'
import { discoverUniqueAlbums } from '@utils/album/albumDiscovery'
import {
  selectAlbumsWithTrackLimits,
  SPOTIFY_PLAYLIST_LIMITS,
  getCachedAlbumTrackIds,
} from '@utils/playlist/playlistAlbumFetcher'

/**
 * Generate hash for playlist tracks to detect changes
 */
async function generatePlaylistTracksHash(playlistIds: string[]): Promise<string> {
  try {
    const tracks: string[] = []
    const { default: createSpotifyApiWrapper } = await import('@utils/spotifyApiWrapper')
    const spotify = createSpotifyApiWrapper()
    
    for (const playlistId of playlistIds) {
      let offset = 0
      const limit = 50
      let hasMore = true
      
      while (hasMore) {
        const response = playlistId === 'liked-songs' 
          ? await spotify.tracks.getSavedTracks({ limit, offset })
          : await spotify.playlists.getTracks(playlistId, { limit, offset })
        
        const items = response.items || []
        for (const item of items) {
          if (item.track?.id) {
            tracks.push(item.track.id)
          }
        }
        
        hasMore = response.next !== null
        offset += limit
      }
    }
    
    // Sort track IDs for consistent hashing
    tracks.sort()
    return btoa(tracks.join(',')).replace(/[+/=]/g, '').substring(0, 16)
  } catch (error) {
    console.warn('Error generating playlist hash:', error)
    return ''
  }
}

interface UseAlbumShuffleProps {
  isOpen: boolean
  selectedPlaylists: string[]
  preloadedAlbums?: AlbumWithTrackCount[]
  fromHistory?: boolean
  spotifyApi?: any // SpotifyApi instance for fetching real tracks
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
  spotifyApi,
  onCreatePlaylist,
}: UseAlbumShuffleProps) => {
  // Ref to track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true)

  // Initialize state
  const [shuffleConfig, setShuffleConfig] = useState<ShuffleConfig>({
    allowSingles: false,
    allowCompilations: false,
    allowEps: true,
    allowAlbums: true,
    albumTypes: ['albums', 'eps'], // Default: Albums and EPs selected, Singles and Compilations unselected
    numberOfAlbums: 0, // Start at 0, will be auto-set after discovery
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
  const [currentPlaylistHash, setCurrentPlaylistHash] = useState<string>('')

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

  // Auto-process albums ONLY when they're first loaded (not during settings changes)
  useEffect(() => {
    if (allRetrievedAlbums.length > 0 && !isFetching) {
      processAlbumsWithCurrentSettings()
    }
  }, [allRetrievedAlbums])

  // Process albums when settings change (but only if not fetching and albums exist)
  useEffect(() => {
    if (allRetrievedAlbums.length > 0 && !isFetching) {
      processAlbumsWithCurrentSettings()
    }
  }, [
    shuffleConfig.allowSingles,
    shuffleConfig.allowCompilations,
    shuffleConfig.allowEps,
    shuffleConfig.allowAlbums,
    shuffleConfig.albumTypes,
    shuffleConfig.algorithm,
    shuffleConfig.numberOfAlbums,
    shuffleConfig.maxTracks,
    shuffleConfig.trackLimitMode,
  ])

  // Core helper functions
  const filterAlbumsByType = (albums: AlbumWithTrackCount[]): AlbumWithTrackCount[] => {
    // Use new albumTypes array for filtering
    if (shuffleConfig.albumTypes && shuffleConfig.albumTypes.length > 0) {
      return albums.filter((album) => {
        // Check if this single was detected as an EP during discovery
        const isDetectedEp = (album as any).__detectedAsEp === true
        
        // Map album types to our filter values
        switch (album.album_type) {
          case 'album':
            return shuffleConfig.albumTypes.includes('albums')
          case 'single':
            // If detected as EP, check EP allowance, otherwise check singles allowance
            if (isDetectedEp) {
              return shuffleConfig.albumTypes.includes('eps')
            } else {
              return shuffleConfig.albumTypes.includes('singles')
            }
          case 'compilation':
            return shuffleConfig.albumTypes.includes('compilations')
          default:
            return false
        }
      })
    }
    
    // Fallback to old boolean logic for backward compatibility
    let filtered = albums
    
    if (!shuffleConfig.allowSingles) {
      // Allow detected EPs even if singles are not allowed
      filtered = filtered.filter((album) => 
        album.album_type !== 'single' || (album as any).__detectedAsEp === true
      )
    }
    
    if (!shuffleConfig.allowCompilations) {
      filtered = filtered.filter((album) => album.album_type !== 'compilation')
    }
    
    if (!shuffleConfig.allowEps) {
      // Filter out detected EPs
      filtered = filtered.filter((album) => (album as any).__detectedAsEp !== true)
    }
    
    if (!shuffleConfig.allowAlbums) {
      filtered = filtered.filter((album) => album.album_type !== 'album')
    }
    
    return filtered
  }

  const shuffleAlbumOrder = (albums: AlbumWithTrackCount[]): AlbumWithTrackCount[] => {
    switch (shuffleConfig.algorithm) {
      case 'random':
        return [...albums].sort(() => Math.random() - 0.5)
      case 'weighted-newer':
      case 'weighted-older':
      case 'chronological':
      case 'spiral-dance':
        // For now, these complex algorithms just use random for simplicity
        // TODO: Implement proper album-level versions of these algorithms
        return [...albums].sort(() => Math.random() - 0.5)
      default:
        return [...albums].sort(() => Math.random() - 0.5)
    }
  }

  // Process albums with current settings (used by effect)
  const processAlbumsWithCurrentSettings = () => {
    if (allRetrievedAlbums.length === 0) return

    console.debug('🔄 Processing albums with current settings')

    // Step 1: Filter by album type
    const filteredAlbums = filterAlbumsByType(allRetrievedAlbums)
    
    // Step 2: Shuffle album order
    const shuffledAlbums = shuffleAlbumOrder(filteredAlbums)
    
    // Step 3: Apply limits and select final albums
    const selectionResult = selectAlbumsWithTrackLimits(
      shuffledAlbums,
      shuffleConfig.numberOfAlbums,
      shuffleConfig.maxTracks,
      shuffleConfig.trackLimitMode,
      true // preserveOrder = true to maintain shuffled order
    )

    // Step 4: Update state
    setSelectedAlbums(selectionResult.selectedAlbums)
    setTrackLimitInfo({
      totalTracks: selectionResult.totalTracks,
      limitReached: selectionResult.limitReached,
      excludedAlbums: selectionResult.excludedAlbums,
    })

    // Step 5: Generate preview tracks (simulated for display)
    const previewTracks: ShuffledTrack[] = []
    for (const album of selectionResult.selectedAlbums) {
      const simulatedTracks = generateSimulatedTracks(album)
      previewTracks.push(...simulatedTracks)
    }
    setShuffledTracks(previewTracks)

    console.debug('✅ Processed albums:', {
      filtered: filteredAlbums.length,
      shuffled: shuffledAlbums.length,
      selected: selectionResult.selectedAlbums.length,
      tracks: previewTracks.length,
    })
  }

  // Get Unique Albums - discovers albums from playlist tracks with proper single/compilation handling
  const handleGetAlbums = async () => {
    if (selectedPlaylists.length === 0) return

    // Disable all UI except cancel during fetch
    setIsFetching(true)
    setIsLoadingAlbums(true)
    setFetchProgress({ current: 0, total: 0 })
    setTrackFetchingStatus('Initializing album discovery...')

    try {
      console.debug('🎯 Starting unique album discovery for playlists:', selectedPlaylists)

      const discoveredAlbums = await discoverUniqueAlbums(
        selectedPlaylists,
        {
          allowSingles: shuffleConfig.allowSingles,
          allowCompilations: shuffleConfig.allowCompilations,
          allowEps: shuffleConfig.allowEps,
          allowAlbums: shuffleConfig.allowAlbums,
          albumTypes: shuffleConfig.albumTypes,
        },
        (status: string, current?: number, total?: number) => {
          if (isMountedRef.current) {
            setTrackFetchingStatus(status)
            if (current !== undefined && total !== undefined) {
              setFetchProgress({ current, total })
            }
          }
        }
      )

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      console.debug('📊 Album discovery complete:', {
        totalAlbums: discoveredAlbums.length,
        allowSingles: shuffleConfig.allowSingles,
        allowCompilations: shuffleConfig.allowCompilations,
      })

      // Store discovered albums - this will trigger the allRetrievedAlbums effect
      setAllRetrievedAlbums(discoveredAlbums)
      setTrackFetchingStatus('Album discovery complete!')

      // Auto-adjust numberOfAlbums if it's 0 or greater than total discovered
      // This will trigger the settings change effect once isFetching becomes false
      if (shuffleConfig.numberOfAlbums === 0 || shuffleConfig.numberOfAlbums > discoveredAlbums.length) {
        const newNumberOfAlbums = discoveredAlbums.length
        console.debug(`🔧 Auto-adjusting numberOfAlbums from ${shuffleConfig.numberOfAlbums} to ${newNumberOfAlbums}`)
        setShuffleConfig(prev => ({ 
          ...prev, 
          numberOfAlbums: newNumberOfAlbums 
        }))
      }

      // Generate playlist hash for change detection
      const playlistHash = await generatePlaylistTracksHash(selectedPlaylists)
      setCurrentPlaylistHash(playlistHash)

      // Save to history
      const playlistNames = selectedPlaylists.map((id) => `Playlist ${id}`)
      saveAlbumHistory(playlistNames, selectedPlaylists, discoveredAlbums.map(({ estimatedTrackCount, ...album }) => album))
      
    } catch (error) {
      console.error('❌ Error during album discovery:', error)
      if (isMountedRef.current) {
        setTrackFetchingStatus('Album discovery failed')
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetching(false)
        setIsLoadingAlbums(false)
        setFetchProgress({ current: 0, total: 0 })
        setTrackFetchingStatus('')
      }
    }
  }

  // Manual reshuffle - reorder existing albums with new randomization
  const handleReshuffle = () => {
    if (allRetrievedAlbums.length === 0) return

    // Trigger glitch effect immediately on click
    setShuffleButtonGlitch(true)
    setIsShuffling(true)
    
    setTimeout(() => setShuffleButtonGlitch(false), 400)

    try {
      console.debug('🎲 Manual reshuffle triggered')
      
      // Use the same processing logic but with new randomization
      processAlbumsWithCurrentSettings()
      
    } catch (error) {
      console.error('Error during manual reshuffle:', error)
    } finally {
      setIsShuffling(false)
    }
  }

  // Create playlist functionality - generate real tracks in CD changer order
  const handleCreatePlaylist = async () => {
    if (selectedAlbums.length === 0) {
      console.error('No albums available for playlist creation')
      return
    }

    if (!spotifyApi) {
      console.error('Spotify API not available for playlist creation')
      return
    }

    try {
      console.log('💾 Creating playlist with CD changer behavior (full albums in shuffled order)...')
      
      const playlistTracks: ShuffledTrack[] = []
      
      // Process each album in the already-shuffled order
      for (const album of selectedAlbums) {
        try {
          console.log(`🎵 Fetching all tracks for album: ${album.name}`)
          
          // Fetch all tracks from this album
          const albumTracksResponse = await spotifyApi.albums.getTracks(album.id, { limit: 50 })
          const tracks = albumTracksResponse.items || []
          
          // Add all tracks from this album in their original order
          for (const track of tracks) {
            playlistTracks.push({
              id: track.id,
              name: track.name,
              uri: track.uri,
              artists: track.artists,
              album: {
                id: album.id,
                name: album.name,
                album_type: album.album_type,
                images: album.images,
              },
              albumName: album.name,
              albumId: album.id,
              energy: Math.random(), // We don't have real energy data
            })
          }
          
          console.log(`📀 Added ${tracks.length} tracks from album: ${album.name}`)
          
        } catch (albumError) {
          console.warn(`⚠️ Failed to fetch tracks for album ${album.name}:`, albumError)
          // Continue with next album if one fails
        }
      }

      if (playlistTracks.length === 0) {
        console.error('No valid tracks could be created for playlist')
        return
      }

      console.log(`✅ Created ${playlistTracks.length} real tracks from ${selectedAlbums.length} albums in CD changer order`)
      const result = await onCreatePlaylist(playlistTracks, playlistName, isPublic)
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
  }
}