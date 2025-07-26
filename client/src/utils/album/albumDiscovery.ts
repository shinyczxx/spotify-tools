/**
 * @file albumDiscovery.ts
 * @description Album discovery utility with proper single/compilation handling
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-24
 */

import { AlbumWithTrackCount, getCachedAlbumTrackIds, cacheAlbumTracks as saveCacheAlbumTracks } from '@utils/playlist/playlistAlbumFetcher'
import { SpotifyTrack, SpotifyAlbum } from 'types/spotify'
import { checkIfEp, EpCheckResult } from '@utils/spotify/epChecker'

interface AlbumDiscoveryOptions {
  allowSingles: boolean
  allowCompilations: boolean
  allowEps?: boolean
  allowAlbums?: boolean
  albumTypes?: ('albums' | 'eps' | 'singles' | 'compilations')[]
}

interface AlbumDiscoveryCache {
  [key: string]: {
    albums: AlbumWithTrackCount[]
    timestamp: number
    options: AlbumDiscoveryOptions
  }
}

const CACHE_KEY = 'album_discovery_cache'
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

/**
 * Get cached album discovery results
 */
function getCachedDiscovery(playlistIds: string[], options: AlbumDiscoveryOptions): AlbumWithTrackCount[] | null {
  try {
    const cache: AlbumDiscoveryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const cacheKey = `${playlistIds.sort().join(',')}_${JSON.stringify(options)}`
    const cached = cache[cacheKey]
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.debug('📋 Found cached album discovery results')
      return cached.albums
    }
  } catch (error) {
    console.warn('Cache read error:', error)
  }
  return null
}

/**
 * Cache album discovery results
 */
function cacheDiscovery(playlistIds: string[], options: AlbumDiscoveryOptions, albums: AlbumWithTrackCount[]): void {
  try {
    const cache: AlbumDiscoveryCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    const cacheKey = `${playlistIds.sort().join(',')}_${JSON.stringify(options)}`
    
    cache[cacheKey] = {
      albums,
      timestamp: Date.now(),
      options
    }
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    console.debug('💾 Cached album discovery results')
  } catch (error) {
    console.warn('Cache write error:', error)
  }
}

/**
 * Fetch tracks from a playlist
 */
async function fetchPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  try {
    const { default: createSpotifyApiWrapper } = await import('@utils/spotifyApiWrapper')
    const spotify = createSpotifyApiWrapper()
    
    const tracks: SpotifyTrack[] = []
    let offset = 0
    const limit = 50
    let hasMore = true
    
    while (hasMore) {
      const response = playlistId === 'liked-songs' 
        ? await spotify.tracks.getSavedTracks({ limit, offset })
        : await spotify.playlists.getTracks(playlistId, { limit, offset })
      
      const items = response.items || []
      for (const item of items) {
        if (item.track) {
          tracks.push(item.track)
        }
      }
      
      hasMore = response.next !== null
      offset += limit
    }
    
    return tracks
  } catch (error) {
    console.error(`Failed to fetch tracks from playlist ${playlistId}:`, error)
    return []
  }
}

/**
 * Cache album tracks for efficient playlist creation
 */
async function cacheAlbumTracks(albumId: string, album: SpotifyAlbum): Promise<void> {
  // Check if already cached
  if (getCachedAlbumTrackIds(albumId)) {
    return
  }
  
  try {
    const { default: createSpotifyApiWrapper } = await import('@utils/spotifyApiWrapper')
    const spotify = createSpotifyApiWrapper()
    
    const albumTracks = await spotify.albums.getTracks(albumId, { limit: 50 })
    const trackIds = albumTracks.items?.map((t: any) => t.id) || []
    
    // Cache using the existing utility
    saveCacheAlbumTracks(albumId, album, trackIds)
    
    console.debug(`💾 Cached ${trackIds.length} tracks for album: ${album.name}`)
  } catch (error) {
    console.warn(`Failed to cache tracks for album ${album.name}:`, error)
  }
}

/**
 * Check if a single album is actually an EP by fetching its tracks and analyzing them
 */
async function checkIfSingleIsEp(album: SpotifyAlbum): Promise<{ isEp: boolean; trackCount: number }> {
  if (album.album_type !== 'single') {
    return { isEp: false, trackCount: album.total_tracks || 0 }
  }
  
  try {
    const { default: createSpotifyApiWrapper } = await import('@utils/spotifyApiWrapper')
    const spotify = createSpotifyApiWrapper()
    
    // Get album details with tracks
    const albumDetails = await retryApiCall(async () => {
      return spotify.albums.getAlbum(album.id)
    })
    
    if (!albumDetails.tracks?.items) {
      return { isEp: false, trackCount: album.total_tracks || 0 }
    }
    
    // Create a mock track object for the EP checker
    const mockTrack = {
      album: {
        ...albumDetails,
        tracks: albumDetails.tracks
      }
    }
    
    const epResult = await checkIfEp(mockTrack as any)
    const isEp = epResult.albumType === 'ep'
    
    console.debug(`🔍 EP check for "${album.name}": ${isEp ? 'EP' : 'Single'} (${epResult.cleanedTrackCount} clean tracks)`)
    
    return { 
      isEp, 
      trackCount: epResult.cleanedTrackCount 
    }
  } catch (error) {
    console.warn(`Failed to check if single "${album.name}" is EP:`, error)
    return { isEp: false, trackCount: album.total_tracks || 0 }
  }
}

/**
 * Retry helper for API calls
 */
async function retryApiCall<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: any
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Don't retry on 4xx errors (client errors) except 429 (rate limit)
      if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
        throw error
      }
      
      if (attempt < maxRetries) {
        console.debug(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2 // Exponential backoff
      }
    }
  }
  
  throw lastError
}

/**
 * Find full album for a track (if single/compilation is not allowed)
 * Returns: album if found, null if not found, throws error if API fails
 */
async function findFullAlbum(track: SpotifyTrack, options: AlbumDiscoveryOptions): Promise<SpotifyAlbum | null> {
  if (!track.artists?.[0]?.id) return null
  
  const { default: createSpotifyApiWrapper } = await import('@utils/spotifyApiWrapper')
  const spotify = createSpotifyApiWrapper()
  
  // Search for albums by the primary artist with retry logic
  const response = await retryApiCall(async () => {
    return spotify.search.search(
      `artist:${track.artists[0].name} track:${track.name}`,
      { types: ['album'], limit: 50 }
    )
  })
  
  const albums = response.albums?.items || []
  
  // Find the best matching album or EP that contains this track
  for (const album of albums) {
    // Determine what album types we're looking for (EPs and Albums)
    const allowedTypes = options.albumTypes 
      ? ['album', 'single'] // Allow both albums and singles (EPs are classified as singles)
      : ['album'] // Fallback: only albums
    
    // Skip if this album type is not what we're looking for
    if (!allowedTypes.includes(album.album_type)) continue
    
    // For new logic, we want albums and EPs (which are classified as singles with >4 tracks)
    // For backward compatibility, skip singles unless they could be EPs
    if (album.album_type === 'single' && options.albumTypes) {
      // This could be an EP - we'll check track count later
      // For now, allow it through to the track checking
    } else if (album.album_type === 'single' && !options.albumTypes && !options.allowSingles) {
      continue
    }
    
    if (album.album_type === 'compilation') {
      const allowCompilations = options.albumTypes 
        ? options.albumTypes.includes('compilations')
        : options.allowCompilations
      if (!allowCompilations) continue
    }
    
    // Check if this album contains the track
    try {
      const albumTracks = await retryApiCall(async () => {
        return spotify.albums.getTracks(album.id, { limit: 50 })
      })
      
      const hasTrack = albumTracks.items?.some((t: any) => 
        t.name.toLowerCase().includes(track.name.toLowerCase()) ||
        track.name.toLowerCase().includes(t.name.toLowerCase())
      )
      
      if (hasTrack) {
        // Check if this found album is actually an EP (if it's a single)
        let finalAlbum = album
        if (album.album_type === 'single') {
          try {
            const epCheck = await checkIfSingleIsEp(album)
            if (epCheck.isEp) {
              console.debug(`📀 Found EP for "${track.name}": ${album.name} (detected as EP with ${epCheck.trackCount} unique tracks)`)
              finalAlbum = { ...album, __detectedAsEp: true } as any
            } else {
              console.debug(`📀 Found single for "${track.name}": ${album.name} (confirmed as single)`)
            }
          } catch (error) {
            console.warn(`Failed to check EP status for found album "${album.name}":`, error)
          }
        } else {
          console.debug(`📀 Found full album for "${track.name}": ${album.name} (${album.album_type})`)
        }
        
        // Cache the album tracks for later playlist creation
        await cacheAlbumTracks(album.id, album)
        
        return finalAlbum
      }
    } catch (error) {
      console.warn(`Failed to check tracks for album ${album.name}:`, error)
      // Continue to next album instead of returning null
    }
  }
  
  return null
}

/**
 * Discover unique albums from playlist tracks with proper single/compilation handling
 */
export async function discoverUniqueAlbums(
  playlistIds: string[],
  options: AlbumDiscoveryOptions,
  onProgress: (status: string, current?: number, total?: number) => void
): Promise<AlbumWithTrackCount[]> {
  
  // Check cache first
  const cached = getCachedDiscovery(playlistIds, options)
  if (cached) {
    onProgress('Loaded from cache')
    return cached
  }
  
  onProgress('Fetching playlist tracks...', 0, playlistIds.length)
  
  // Step 1: Fetch all tracks from playlists and track per-playlist breakdown
  const allTracks: SpotifyTrack[] = []
  const playlistBreakdowns: Array<{
    name: string
    albumTracks: Array<{trackName: string, link: string}>
    singleTracks: Array<{trackName: string, link: string}>
    compilationTracks: Array<{trackName: string, link: string}>
  }> = []
  
  for (let i = 0; i < playlistIds.length; i++) {
    const playlistId = playlistIds[i]
    onProgress(`Fetching tracks from playlist ${i + 1}/${playlistIds.length}...`, i, playlistIds.length)
    
    const tracks = await fetchPlaylistTracks(playlistId)
    allTracks.push(...tracks)
    
    // Categorize tracks by album type for this playlist
    const albumTracks: Array<{trackName: string, link: string}> = []
    const singleTracks: Array<{trackName: string, link: string}> = []
    const compilationTracks: Array<{trackName: string, link: string}> = []
    
    for (const track of tracks) {
      const trackInfo = { 
        trackName: track.name, 
        link: `https://open.spotify.com/track/${track.id}`
      }
      
      if (track.album?.album_type === 'album') {
        albumTracks.push(trackInfo)
      } else if (track.album?.album_type === 'single') {
        singleTracks.push(trackInfo)
      } else if (track.album?.album_type === 'compilation') {
        compilationTracks.push(trackInfo)
      }
    }
    
    const breakdown = {
      name: `Playlist ${playlistId}`,
      albumTracks,
      singleTracks,
      compilationTracks
    }
    
    playlistBreakdowns.push(breakdown)
    
    // Log individual playlist breakdown
    console.log(`🎵 Playlist ${playlistId} breakdown:`, breakdown)
  }
  
  onProgress('Processing albums...', playlistIds.length, playlistIds.length)
  console.debug(`🎵 Collected ${allTracks.length} tracks from ${playlistIds.length} playlists`)
  
  // Step 2: Process each track to find its best album
  const albumMap = new Map<string, AlbumWithTrackCount>()
  let processedTracks = 0
  let hasApiErrors = false
  let detectedEps = 0
  let singleToAlbumReplacements = 0
  
  for (const track of allTracks) {
    processedTracks++
    if (processedTracks % 10 === 0 || processedTracks === allTracks.length) {
      onProgress(`Processing track ${processedTracks}/${allTracks.length} (EP detection & album search)...`, processedTracks, allTracks.length)
    }
    
    if (!track.album?.id) continue
    
    let targetAlbum: SpotifyAlbum = track.album
    
    // Determine if we should search for full albums/EPs based on new album type selection
    const shouldSearchForAlbumsEps = (
      // New logic: albums selected AND singles not selected
      (options.albumTypes?.includes('albums') && !options.albumTypes?.includes('singles')) ||
      // Fallback to old logic for backward compatibility
      (!options.albumTypes && !options.allowSingles)
    )
    
    // Handle singles: either check if EP or search for full albums
    if (track.album.album_type === 'single') {
      // First, check if this single is actually an EP
      let isEp = false
      try {
        const epCheck = await checkIfSingleIsEp(track.album)
        isEp = epCheck.isEp
        
        if (isEp) {
          console.debug(`🎵 Detected EP: "${track.album.name}" (${epCheck.trackCount} unique tracks)`)
          // Mark this album as an EP for filtering purposes
          targetAlbum = { ...track.album, __detectedAsEp: true } as any
          detectedEps++
        }
      } catch (error) {
        console.warn(`Failed EP detection for "${track.album.name}":`, error)
      }
      
      // If we should search for albums/EPs and this isn't an EP, try to find full album
      if (shouldSearchForAlbumsEps && !isEp) {
        try {
          const fullAlbum = await findFullAlbum(track, options)
          if (fullAlbum) {
            targetAlbum = fullAlbum
            singleToAlbumReplacements++
          } else {
            console.debug(`⚠️ No full album/EP found for single "${track.name}", skipping`)
            continue
          }
        } catch (error) {
          console.warn(`API error finding full album/EP for single "${track.name}":`, error)
          hasApiErrors = true
          continue
        }
      } else if (!isEp && !shouldSearchForAlbumsEps) {
        // We're including singles but this isn't an EP - check if singles are allowed
        const allowSingles = options.albumTypes 
          ? options.albumTypes.includes('singles')
          : options.allowSingles
        
        if (!allowSingles) {
          console.debug(`⚠️ Single "${track.name}" not allowed and not an EP, skipping`)
          continue
        }
      }
    } else if (track.album.album_type === 'compilation' && (
      (options.albumTypes && !options.albumTypes.includes('compilations')) ||
      (!options.albumTypes && !options.allowCompilations)
    )) {
      try {
        const fullAlbum = await findFullAlbum(track, options)
        if (fullAlbum) {
          targetAlbum = fullAlbum
        } else {
          console.debug(`⚠️ No full album found for compilation track "${track.name}", skipping`)
          continue
        }
      } catch (error) {
        console.warn(`API error finding full album for compilation track "${track.name}":`, error)
        hasApiErrors = true
        continue
      }
    }
    
    // Add album to map (deduplication) and cache its tracks
    if (!albumMap.has(targetAlbum.id)) {
      albumMap.set(targetAlbum.id, {
        ...targetAlbum,
        estimatedTrackCount: targetAlbum.total_tracks || 10
      })
      
      // Cache the album tracks for playlist creation (async, don't wait)
      cacheAlbumTracks(targetAlbum.id, targetAlbum).catch(error => {
        console.warn(`Background caching failed for ${targetAlbum.name}:`, error)
      })
    }
  }
  
  const discoveredAlbums = Array.from(albumMap.values())
  onProgress('Album discovery complete!')
  
  console.debug(`💿 Discovered ${discoveredAlbums.length} unique albums`, {
    totalAlbums: discoveredAlbums.length,
    detectedEPs: detectedEps,
    singleToAlbumReplacements: singleToAlbumReplacements,
    processedTracks: processedTracks
  })
  
  // Only cache results if there were no API errors
  if (!hasApiErrors) {
    cacheDiscovery(playlistIds, options, discoveredAlbums)
    console.debug('💾 Cached album discovery results')
  } else {
    console.warn('⚠️ Skipping cache due to API errors - results may be incomplete')
  }
  
  return discoveredAlbums
}

/**
 * Clear album discovery cache
 */
export function clearAlbumDiscoveryCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
    console.debug('🗑️ Cleared album discovery cache')
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}