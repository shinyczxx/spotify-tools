// --- Simple playlist/albums cache with TTL (5 min) ---
const PLAYLISTS_TTL_KEY = 'spotify-playlists-ttl-cache-v1'
const PLAYLISTS_TTL_MS = 5 * 60 * 1000 // 5 minutes

export interface PlaylistsTTLCache {
  playlists: any[]
  albums?: any[]
  timestamp: number
}

export function getCachedPlaylistsWithTTL(): PlaylistsTTLCache | null {
  try {
    const raw = localStorage.getItem(PLAYLISTS_TTL_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as PlaylistsTTLCache
    if (!data.timestamp || Date.now() - data.timestamp > PLAYLISTS_TTL_MS) {
      localStorage.removeItem(PLAYLISTS_TTL_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

export function setCachedPlaylistsWithTTL(playlists: any[], albums?: any[]): void {
  const data: PlaylistsTTLCache = {
    playlists,
    albums,
    timestamp: Date.now(),
  }
  localStorage.setItem(PLAYLISTS_TTL_KEY, JSON.stringify(data))
}

export function clearPlaylistsWithTTLCache(): void {
  localStorage.removeItem(PLAYLISTS_TTL_KEY)
}
/**
 * @file playlistCache.ts
 * @description Playlist-based caching utility for album discovery with
 * metadata hashing. Supports efficient lookups and cache management
 * for album shuffle operations.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import { SpotifyAlbum, AlbumFilters } from './albumOperations'

export interface PlaylistMetadata {
  id: string
  name: string
  trackCount: number
  lastModified?: string // snapshot_id from Spotify API if available
  ownerId: string
}

export interface PlaylistCacheEntry {
  cacheKey: string
  playlistMetadata: PlaylistMetadata[]
  filters: AlbumFilters
  discoveredAlbums: SpotifyAlbum[]
  timestamp: number
}

export interface CacheSearchParams {
  selectedPlaylistIds: string[]
  playlistMetadata: PlaylistMetadata[]
  filters: Pick<AlbumFilters, 'includeSingles' | 'includeCompilations'>
}

const PLAYLIST_CACHE_KEY = 'spotify-playlist-album-cache'
const MAX_CACHE_ENTRIES = 20 // Reasonable limit for caching

/**
 * Generate a deterministic hash from playlist metadata and filters
 */
export function generateCacheKey(params: CacheSearchParams): string {
  const sortedPlaylists = [...params.selectedPlaylistIds].sort()
  const playlistHashes = sortedPlaylists.map((id) => {
    const metadata = params.playlistMetadata.find((p) => p.id === id)
    if (!metadata) return `${id}:unknown`

    return `${id}:${metadata.trackCount}:${metadata.lastModified || 'no-snapshot'}`
  })

  const filterHash = `singles:${params.filters.includeSingles}:compilations:${params.filters.includeCompilations}`

  // Create a simple hash combining all components
  const combinedString = `${playlistHashes.join('|')}:${filterHash}`

  // Simple hash function (good enough for our use case)
  let hash = 0
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  return `cache_${Math.abs(hash).toString(36)}`
}

/**
 * Get all cached playlist entries
 */
export function getPlaylistCache(): PlaylistCacheEntry[] {
  try {
    const cacheJson = localStorage.getItem(PLAYLIST_CACHE_KEY)
    if (!cacheJson) return []

    const rawCache = JSON.parse(cacheJson) as any[]

    // Validate cache entries
    const validCache: PlaylistCacheEntry[] = rawCache.filter((entry) => {
      try {
        return (
          entry &&
          typeof entry.cacheKey === 'string' &&
          Array.isArray(entry.playlistMetadata) &&
          entry.filters &&
          Array.isArray(entry.discoveredAlbums) &&
          typeof entry.timestamp === 'number'
        )
      } catch {
        return false
      }
    })

    // Sort by timestamp (newest first)
    return validCache.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Failed to load playlist cache:', error)
    return []
  }
}

/**
 * Find a cached entry that matches the current search parameters
 */
export function findCachedEntry(params: CacheSearchParams): PlaylistCacheEntry | null {
  try {
    const cacheKey = generateCacheKey(params)
    const cache = getPlaylistCache()

    const entry = cache.find((entry) => entry.cacheKey === cacheKey)

    if (entry) {
      console.log('Cache hit found:', {
        cacheKey,
        albumCount: entry.discoveredAlbums.length,
        age: Date.now() - entry.timestamp,
      })

      return entry
    }

    console.log('No cache hit for key:', cacheKey)
    return null
  } catch (error) {
    console.error('Error finding cached entry:', error)
    return null
  }
}

/**
 * Add a new entry to the playlist cache
 */
export function addToPlaylistCache(
  params: CacheSearchParams,
  discoveredAlbums: SpotifyAlbum[],
): PlaylistCacheEntry {
  try {
    const cacheKey = generateCacheKey(params)

    const newEntry: PlaylistCacheEntry = {
      cacheKey,
      playlistMetadata: params.playlistMetadata,
      filters: {
        ...params.filters,
        albumCount: discoveredAlbums.length,
        shuffleType: 'random', // Default, will be overridden in modal
      },
      discoveredAlbums,
      timestamp: Date.now(),
    }

    const currentCache = getPlaylistCache()

    // Remove any existing entry with the same cache key
    const filteredCache = currentCache.filter((entry) => entry.cacheKey !== cacheKey)

    const updatedCache = [newEntry, ...filteredCache]

    // Limit cache size
    const trimmedCache = updatedCache.slice(0, MAX_CACHE_ENTRIES)

    localStorage.setItem(PLAYLIST_CACHE_KEY, JSON.stringify(trimmedCache))

    console.log('Added to playlist cache:', {
      cacheKey,
      albumCount: discoveredAlbums.length,
      playlistCount: params.selectedPlaylistIds.length,
    })

    return newEntry
  } catch (error) {
    console.error('Failed to add to playlist cache:', error)
    throw error
  }
}

/**
 * Clear the entire playlist cache
 */
export function clearPlaylistCache(): void {
  try {
    localStorage.removeItem(PLAYLIST_CACHE_KEY)
    console.log('Cleared playlist cache')
  } catch (error) {
    console.error('Failed to clear playlist cache:', error)
    throw error
  }
}

/**
 * Remove a specific cache entry by key
 */
export function removeCacheEntry(cacheKey: string): void {
  try {
    const currentCache = getPlaylistCache()
    const updatedCache = currentCache.filter((entry) => entry.cacheKey !== cacheKey)

    localStorage.setItem(PLAYLIST_CACHE_KEY, JSON.stringify(updatedCache))

    console.log('Removed cache entry:', cacheKey)
  } catch (error) {
    console.error('Failed to remove cache entry:', error)
    throw error
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  entryCount: number
  totalAlbums: number
  oldestEntry: number | null
  newestEntry: number | null
} {
  const cache = getPlaylistCache()

  return {
    entryCount: cache.length,
    totalAlbums: cache.reduce((sum, entry) => sum + entry.discoveredAlbums.length, 0),
    oldestEntry: cache.length > 0 ? Math.min(...cache.map((e) => e.timestamp)) : null,
    newestEntry: cache.length > 0 ? Math.max(...cache.map((e) => e.timestamp)) : null,
  }
}

/**
 * Extract playlist metadata from Spotify playlist objects
 */
export function extractPlaylistMetadata(playlists: any[]): PlaylistMetadata[] {
  return playlists.map((playlist) => ({
    id: playlist.id,
    name: playlist.name,
    trackCount: playlist.tracks?.total || 0,
    lastModified: playlist.snapshot_id, // Spotify's playlist version identifier
    ownerId: playlist.owner?.id || 'unknown',
  }))
}
