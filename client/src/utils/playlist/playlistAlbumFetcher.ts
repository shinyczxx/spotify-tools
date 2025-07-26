/**
 * @file playlistAlbumFetcher.ts
 * @description Utility for fetching albums from playlists with caching and spotify-api-lib support
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-16
 */

import type { SpotifyAlbum, SpotifyTrack } from 'spotify-api-lib'
import SpotifyApi from 'spotify-api-lib'

export interface PlaylistAlbumFetchResult {
  albums: SpotifyAlbum[]
  totalTracks: number
  processedTracks: number
  fromCache: boolean
}

export interface AlbumWithTrackCount extends SpotifyAlbum {
  estimatedTrackCount: number
}

// Spotify playlist limits
export const SPOTIFY_PLAYLIST_LIMITS = {
  MAX_TRACKS: 10000,
  MAX_DESCRIPTION_LENGTH: 300,
  MAX_NAME_LENGTH: 100
} as const

export type TrackLimitMode = 'soft' | 'hard'

export interface PlaylistAlbumCache {
  playlistIds: string[]
  albumIds: string[] // Store only IDs to reference individual cache
  hash: string
  timestamp: number
  totalTracks: number
}

export interface AlbumTrackCache {
  albumId: string
  albumMetadata: SpotifyAlbum // Keep basic album info for display
  trackIds: string[] // Only the track IDs - this is all we need for playlist.addTracks()
  timestamp: number
}

// Cache management
const CACHE_KEY = 'playlist-albums-cache'
const ALBUM_TRACKS_KEY = 'album-tracks-cache'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB limit to prevent quota exceeded

/**
 * Generate a hash for playlist IDs combination
 */
function generatePlaylistHash(playlistIds: string[]): string {
  const sorted = [...playlistIds].sort()
  return btoa(sorted.join(',')).replace(/[+/=]/g, '')
}

/**
 * Check if storage quota would be exceeded
 */
function wouldExceedQuota(dataSize: number): boolean {
  try {
    const testKey = `quota-test-${Date.now()}`
    const testData = 'x'.repeat(Math.min(dataSize, 1024)) // Test with smaller sample
    localStorage.setItem(testKey, testData)
    localStorage.removeItem(testKey)
    return false
  } catch (error) {
    return true
  }
}

/**
 * Get individual album track cache
 */
function getAlbumTrackCache(): Record<string, AlbumTrackCache> {
  try {
    const cached = localStorage.getItem(ALBUM_TRACKS_KEY)
    return cached ? JSON.parse(cached) : {}
  } catch (error) {
    console.warn('Error reading album track cache:', error)
    return {}
  }
}

/**
 * Save individual album track cache with quota checking
 */
function saveAlbumTrackCache(cache: Record<string, AlbumTrackCache>): boolean {
  try {
    const dataString = JSON.stringify(cache)
    
    // Check if this would exceed quota
    if (wouldExceedQuota(dataString.length)) {
      console.warn('Storage quota would be exceeded, cleaning old entries...')
      // Remove oldest entries and try again
      const sortedEntries = Object.entries(cache).sort((a, b) => a[1].timestamp - b[1].timestamp)
      const keepCount = Math.floor(sortedEntries.length * 0.7) // Keep 70% of entries
      const reducedCache = Object.fromEntries(sortedEntries.slice(-keepCount))
      
      const reducedDataString = JSON.stringify(reducedCache)
      if (wouldExceedQuota(reducedDataString.length)) {
        console.warn('Still would exceed quota after cleanup, cache update skipped')
        return false
      }
      
      localStorage.setItem(ALBUM_TRACKS_KEY, reducedDataString)
      return true
    }
    
    localStorage.setItem(ALBUM_TRACKS_KEY, dataString)
    return true
  } catch (error) {
    console.warn('Error saving album track cache:', error)
    return false
  }
}

/**
 * Get cached album with track IDs
 */
function getCachedAlbumTracks(albumId: string): AlbumTrackCache | null {
  const cache = getAlbumTrackCache()
  const entry = cache[albumId]
  
  if (!entry) return null
  
  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[albumId]
    saveAlbumTrackCache(cache)
    return null
  }
  
  return entry
}

/**
 * Cache album track IDs
 */
export function cacheAlbumTracks(albumId: string, album: SpotifyAlbum, trackIds: string[]): void {
  const cache = getAlbumTrackCache()
  
  cache[albumId] = {
    albumId,
    albumMetadata: album,
    trackIds,
    timestamp: Date.now()
  }
  
  // Clean expired entries
  const now = Date.now()
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_TTL) {
      delete cache[key]
    }
  })
  
  saveAlbumTrackCache(cache)
}

/**
 * Get cached albums for playlist combination
 */
function getCachedAlbums(playlistIds: string[]): PlaylistAlbumCache | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const cacheData: PlaylistAlbumCache[] = JSON.parse(cached)
    const hash = generatePlaylistHash(playlistIds)
    
    const entry = cacheData.find(item => item.hash === hash)
    if (!entry) return null

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      // Remove expired entry
      const filtered = cacheData.filter(item => item.hash !== hash)
      localStorage.setItem(CACHE_KEY, JSON.stringify(filtered))
      return null
    }

    return entry
  } catch (error) {
    console.warn('Error reading playlist album cache:', error)
    return null
  }
}

/**
 * Cache albums for playlist combination (store only IDs)
 */
function cacheAlbums(playlistIds: string[], albums: SpotifyAlbum[], totalTracks: number): void {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    let cacheData: PlaylistAlbumCache[] = cached ? JSON.parse(cached) : []
    
    const hash = generatePlaylistHash(playlistIds)
    
    // Remove existing entry for this hash
    cacheData = cacheData.filter(item => item.hash !== hash)
    
    // Add new entry (only store album IDs, not full objects)
    cacheData.push({
      playlistIds: [...playlistIds].sort(),
      albumIds: albums.map(album => album.id),
      hash,
      timestamp: Date.now(),
      totalTracks
    })
    
    // Keep only the 10 most recent entries
    cacheData.sort((a, b) => b.timestamp - a.timestamp)
    cacheData = cacheData.slice(0, 10)
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    console.debug('📋 Cached album IDs for playlist combination:', { hash, albumCount: albums.length, totalTracks })
  } catch (error) {
    console.warn('Error caching playlist albums:', error)
  }
}

/**
 * Fetch all tracks from a playlist with pagination
 */
async function fetchPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  
  const spotify = new SpotifyApi()
  spotify.setAccessToken(localStorage.getItem('spotify_access_token') || '')
  
  if (playlistId === 'liked-songs') {
    // Fetch liked songs
    let offset = 0
    const limit = 50
    let hasMore = true
    
    while (hasMore) {
      try {
        const response = await spotify.tracks.getSavedTracks({ limit, offset })
        const items = response.items || []
        
        for (const item of items) {
          if (item.track && item.track.id && item.track.album) {
            tracks.push(item.track)
          }
        }
        
        hasMore = response.next !== null
        offset += limit
      } catch (error) {
        console.error('Error fetching liked songs:', error)
        break
      }
    }
  } else {
    // Fetch playlist tracks
    let offset = 0
    const limit = 50
    let hasMore = true
    
    while (hasMore) {
      try {
        const response = await spotify.playlists.getTracks(playlistId, { limit, offset })
        const items = response.items || []
        
        for (const item of items) {
          if (item.track && item.track.id && item.track.album) {
            tracks.push(item.track)
          }
        }
        
        hasMore = response.next !== null
        offset += limit
      } catch (error) {
        console.error(`Error fetching tracks for playlist ${playlistId}:`, error)
        break
      }
    }
  }
  
  return tracks
}

/**
 * Extract unique albums from tracks with deduplication caching
 */
function extractAlbumsFromTracks(tracks: SpotifyTrack[]): AlbumWithTrackCount[] {
  const albumMap = new Map<string, { album: SpotifyAlbum, trackIds: string[], trackCount: number }>()
  
  for (const track of tracks) {
    console.debug('🎵 Processing track:', {
      trackName: track.name,
      artist: track.artists?.[0]?.name,
      albumName: track.album?.name,
      albumType: track.album?.album_type,
      albumId: track.album?.id
    })
    
    if (track.album && track.album.id && track.id) {
      if (albumMap.has(track.album.id)) {
        // Add track ID to existing album
        const existing = albumMap.get(track.album.id)!
        existing.trackIds.push(track.id)
        existing.trackCount++
      } else {
        // Add new album with first track ID
        albumMap.set(track.album.id, {
          album: track.album,
          trackIds: [track.id],
          trackCount: 1
        })
        console.debug('✨ Added new album:', {
          albumName: track.album.name,
          artist: track.album.artists?.[0]?.name,
          type: track.album.album_type,
          releaseDate: track.album.release_date
        })
      }
    }
  }
  
  // Cache each album's track IDs individually (prevents duplicates across playlists)
  Array.from(albumMap.values()).forEach(({ album, trackIds }) => {
    const cached = getCachedAlbumTracks(album.id)
    if (!cached) {
      // Only cache if not already cached (prevents overwriting with partial data)
      cacheAlbumTracks(album.id, album, trackIds)
      console.debug('💾 Cached track IDs for album:', {
        albumName: album.name,
        trackCount: trackIds.length
      })
    } else {
      console.debug('📋 Album already cached:', album.name)
    }
  })
  
  return Array.from(albumMap.values()).map(({ album, trackCount }) => ({
    ...album,
    estimatedTrackCount: Math.max(trackCount, album.total_tracks || trackCount)
  }))
}

/**
 * Main function to fetch albums from selected playlists
 */
export async function fetchAlbumsFromPlaylists(
  playlistIds: string[],
  onProgress?: (current: number, total: number) => void
): Promise<PlaylistAlbumFetchResult & { albumsWithTrackCounts: AlbumWithTrackCount[] }> {
  console.debug('🎯 Starting album fetch for playlists:', playlistIds)
  
  // Check cache first
  const cached = getCachedAlbums(playlistIds)
  if (cached) {
    console.debug('📋 Found cached playlist combination, reconstructing from individual album cache')
    
    // Reconstruct albums from individual cache entries
    const albums: SpotifyAlbum[] = []
    const albumsWithTrackCounts: AlbumWithTrackCount[] = []
    
    for (const albumId of cached.albumIds || []) {
      const albumCache = getCachedAlbumTracks(albumId)
      if (albumCache) {
        albums.push(albumCache.albumMetadata)
        albumsWithTrackCounts.push({
          ...albumCache.albumMetadata,
          estimatedTrackCount: albumCache.trackIds.length
        })
      } else {
        console.warn(`⚠️ Individual album cache missing for ${albumId}, will need partial refresh`)
        // Remove this from cache since individual data is missing
        const updatedCache = localStorage.getItem(CACHE_KEY)
        if (updatedCache) {
          const cacheData: PlaylistAlbumCache[] = JSON.parse(updatedCache)
          const filtered = cacheData.filter(item => item.hash !== cached.hash)
          localStorage.setItem(CACHE_KEY, JSON.stringify(filtered))
        }
        break // Fall through to fresh fetch
      }
    }
    
    // Only return cached data if we have all albums and cache has valid structure
    if (cached.albumIds && albums.length === cached.albumIds.length) {
      console.debug('✅ Successfully reconstructed from cache:', { albumCount: albums.length })
      return {
        albums,
        albumsWithTrackCounts,
        totalTracks: cached.totalTracks,
        processedTracks: cached.totalTracks,
        fromCache: true
      }
    }
  }
  
  console.debug('🔄 No cache found, fetching fresh data')
  
  const allTracks: SpotifyTrack[] = []
  let processedPlaylists = 0
  
  // Fetch tracks from each playlist
  for (const playlistId of playlistIds) {
    onProgress?.(processedPlaylists, playlistIds.length)
    
    console.debug(`📂 Fetching tracks from playlist: ${playlistId}`)
    const tracks = await fetchPlaylistTracks(playlistId)
    allTracks.push(...tracks)
    
    processedPlaylists++
    console.debug(`✅ Playlist ${playlistId} complete: ${tracks.length} tracks`)
  }
  
  onProgress?.(playlistIds.length, playlistIds.length)
  
  console.debug(`🎵 Total tracks collected: ${allTracks.length}`)
  
  // Extract unique albums with track counts
  const albumsWithTrackCounts = extractAlbumsFromTracks(allTracks)
  const albums = albumsWithTrackCounts.map(({ estimatedTrackCount, ...album }) => album)
  
  console.debug(`💿 Unique albums found: ${albums.length}`)
  console.debug('📊 Album track counts:', albumsWithTrackCounts.map(a => ({
    name: a.name,
    estimatedTracks: a.estimatedTrackCount,
    totalTracks: a.total_tracks
  })))
  
  // Cache the results
  cacheAlbums(playlistIds, albums, allTracks.length)
  
  return {
    albums,
    albumsWithTrackCounts,
    totalTracks: allTracks.length,
    processedTracks: allTracks.length,
    fromCache: false
  }
}

/**
 * Clear all cached playlist album data
 */
export function clearPlaylistAlbumCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
    console.debug('🗑️ Cleared playlist album cache')
  } catch (error) {
    console.warn('Error clearing playlist album cache:', error)
  }
}

/**
 * Select albums for playlist with track limit constraints
 */
export function selectAlbumsWithTrackLimits(
  albums: AlbumWithTrackCount[],
  maxAlbums: number,
  maxTracks: number = SPOTIFY_PLAYLIST_LIMITS.MAX_TRACKS,
  trackLimitMode: TrackLimitMode = 'soft',
  preserveOrder: boolean = false
): {
  selectedAlbums: AlbumWithTrackCount[]
  totalTracks: number
  limitReached: boolean
  excludedAlbums: AlbumWithTrackCount[]
} {
  console.debug('🎯 Selecting albums with track limits:', {
    totalAlbums: albums.length,
    maxAlbums,
    maxTracks,
    trackLimitMode,
    preserveOrder
  })

  const selectedAlbums: AlbumWithTrackCount[] = []
  const excludedAlbums: AlbumWithTrackCount[] = []
  let totalTracks = 0
  let limitReached = false

  // Sort albums to prioritize selection (only if preserveOrder is false)
  const sortedAlbums = preserveOrder ? [...albums] : [...albums].sort((a, b) => {
    // Prioritize albums over singles/compilations
    if (a.album_type === 'album' && b.album_type !== 'album') return -1
    if (b.album_type === 'album' && a.album_type !== 'album') return 1
    
    // Then by release date (newer first)
    const dateA = new Date(a.release_date || '1900-01-01').getTime()
    const dateB = new Date(b.release_date || '1900-01-01').getTime()
    return dateB - dateA
  })

  for (const album of sortedAlbums) {
    // Check album limit
    if (maxAlbums > 0 && selectedAlbums.length >= maxAlbums) {
      excludedAlbums.push(album)
      continue
    }

    const albumTrackCount = album.estimatedTrackCount

    // Check track limit based on mode
    if (trackLimitMode === 'hard') {
      // Hard cap: don't include album if it would exceed limit
      if (totalTracks + albumTrackCount > maxTracks) {
        excludedAlbums.push(album)
        limitReached = true
        console.debug('❌ Excluded album (hard limit):', {
          albumName: album.name,
          albumTracks: albumTrackCount,
          currentTotal: totalTracks,
          wouldBe: totalTracks + albumTrackCount,
          maxTracks
        })
        continue
      }
    } else {
      // Soft cap: include album even if it goes over limit
      if (totalTracks + albumTrackCount > maxTracks && selectedAlbums.length > 0) {
        excludedAlbums.push(album)
        limitReached = true
        console.debug('⚠️ Excluded album (soft limit):', {
          albumName: album.name,
          albumTracks: albumTrackCount,
          currentTotal: totalTracks,
          wouldBe: totalTracks + albumTrackCount,
          maxTracks
        })
        continue
      }
    }

    selectedAlbums.push(album)
    totalTracks += albumTrackCount


    // For soft cap, stop after exceeding limit with at least one album
    if (trackLimitMode === 'soft' && totalTracks > maxTracks) {
      limitReached = true
      break
    }
  }

  console.debug('🏁 Album selection complete:', {
    selectedCount: selectedAlbums.length,
    excludedCount: excludedAlbums.length,
    totalTracks,
    limitReached,
    trackLimitMode
  })

  return {
    selectedAlbums,
    totalTracks,
    limitReached,
    excludedAlbums
  }
}

/**
 * Get cached track IDs for an album (for playlist creation)
 */
export function getCachedAlbumTrackIds(albumId: string): string[] | null {
  const albumCache = getCachedAlbumTracks(albumId)
  return albumCache ? albumCache.trackIds : null
}

/**
 * Get cache statistics
 */
export function getPlaylistAlbumCacheStats(): { entryCount: number, totalSize: number, albumCacheSize: number } {
  try {
    const playlistCache = localStorage.getItem(CACHE_KEY)
    const albumCache = localStorage.getItem(ALBUM_TRACKS_KEY)
    
    const playlistCacheData: PlaylistAlbumCache[] = playlistCache ? JSON.parse(playlistCache) : []
    const albumCacheData = albumCache ? JSON.parse(albumCache) : {}
    
    return {
      entryCount: playlistCacheData.length,
      totalSize: new Blob([playlistCache || '']).size,
      albumCacheSize: new Blob([albumCache || '']).size
    }
  } catch (error) {
    return { entryCount: 0, totalSize: 0, albumCacheSize: 0 }
  }
}