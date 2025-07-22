/**
 * @file playlistSearchHistory.ts
 * @description Intelligent caching system for playlist search history with hash-based validation
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import { sha256 } from 'js-sha256'
import type { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'

// Storage constants
const SEARCH_HISTORY_KEY = 'playlist-search-history'
const MAX_HISTORY_ENTRIES = 50 // Limit cache size
const CACHE_VERSION = '1.0.0'

// Types for cached data
interface PlaylistSnapshot {
  id: string
  name: string
  totalTracks: number
  lastModified: string // ISO date string
  description?: string
}

interface AlbumData {
  id: string
  name: string
  artist: string
  releaseDate?: string
  totalTracks: number
  uri: string
  external_urls: {
    spotify: string
  }
  images?: Array<{
    url: string
    height?: number
    width?: number
  }>
}

interface TrackData {
  id: string
  name: string
  uri: string
  albumId: string
  artists: Array<{
    id: string
    name: string
  }>
  durationMs: number
  trackNumber: number
  explicit: boolean
}

interface SearchHistoryEntry {
  playlistHash: string
  playlistSnapshot: PlaylistSnapshot
  albums: AlbumData[]
  tracks: TrackData[]
  searchTimestamp: number
  cacheVersion: string
}

interface SearchHistoryCache {
  version: string
  entries: SearchHistoryEntry[]
  lastCleanup: number
}

/**
 * Generate a hash for a playlist based on its current state
 */
export function generatePlaylistHash(
  playlistId: string,
  totalTracks: number,
  lastModified?: string
): string {
  const hashInput = `${playlistId}:${totalTracks}:${lastModified || 'unknown'}`
  return sha256(hashInput)
}

/**
 * Compress album data for storage
 */
function compressAlbumData(album: SpotifyAlbum): AlbumData {
  return {
    id: album.id,
    name: album.name,
    artist: album.artists?.[0]?.name || 'Unknown Artist',
    releaseDate: album.release_date,
    totalTracks: album.total_tracks || 0,
    uri: album.uri,
    external_urls: album.external_urls,
    images: album.images?.slice(0, 1), // Keep only the first image to save space
  }
}

/**
 * Compress track data for storage
 */
function compressTrackData(track: SpotifyTrack): TrackData {
  return {
    id: track.id,
    name: track.name,
    uri: track.uri,
    albumId: track.album?.id || 'unknown',
    artists: track.artists?.map(artist => ({
      id: artist.id,
      name: artist.name,
    })) || [],
    durationMs: track.duration_ms || 0,
    trackNumber: track.track_number || 0,
    explicit: track.explicit || false,
  }
}

/**
 * Get the current search history cache
 */
function getSearchHistoryCache(): SearchHistoryCache {
  try {
    const cached = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (!cached) {
      return {
        version: CACHE_VERSION,
        entries: [],
        lastCleanup: Date.now(),
      }
    }

    const parsed: SearchHistoryCache = JSON.parse(cached)
    
    // Version migration if needed
    if (parsed.version !== CACHE_VERSION) {
      console.log('Search history cache version mismatch, clearing cache')
      return {
        version: CACHE_VERSION,
        entries: [],
        lastCleanup: Date.now(),
      }
    }

    return parsed
  } catch (error) {
    console.warn('Error reading search history cache:', error)
    return {
      version: CACHE_VERSION,
      entries: [],
      lastCleanup: Date.now(),
    }
  }
}

/**
 * Save the search history cache
 */
function saveSearchHistoryCache(cache: SearchHistoryCache): void {
  try {
    // Cleanup old entries if needed
    const now = Date.now()
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
    
    // Remove entries older than 30 days or limit to max entries
    cache.entries = cache.entries
      .filter(entry => entry.searchTimestamp > thirtyDaysAgo)
      .slice(-MAX_HISTORY_ENTRIES)
    
    cache.lastCleanup = now
    
    const serialized = JSON.stringify(cache)
    
    // Check if we're approaching localStorage limits (usually 5-10MB)
    if (serialized.length > 4 * 1024 * 1024) { // 4MB threshold
      console.warn('Search history cache approaching storage limits, reducing entries')
      cache.entries = cache.entries.slice(-Math.floor(MAX_HISTORY_ENTRIES * 0.7))
    }
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(cache))
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, clearing search history cache')
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    } else {
      console.warn('Error saving search history cache:', error)
    }
  }
}

/**
 * Check if we have cached data for a playlist and if it's still valid
 */
export function getCachedSearchResults(
  playlistId: string,
  currentTotalTracks: number,
  currentLastModified?: string
): { albums: AlbumData[], tracks: TrackData[] } | null {
  const cache = getSearchHistoryCache()
  const currentHash = generatePlaylistHash(playlistId, currentTotalTracks, currentLastModified)
  
  const entry = cache.entries.find(entry => 
    entry.playlistSnapshot.id === playlistId && 
    entry.playlistHash === currentHash
  )
  
  if (!entry) {
    return null
  }
  
  // Validate that the cached data isn't too old (optional safeguard)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  if (entry.searchTimestamp < sevenDaysAgo) {
    console.log('Cached search results are too old, invalidating')
    return null
  }
  
  console.log(`Using cached search results for playlist ${playlistId}`)
  return {
    albums: entry.albums,
    tracks: entry.tracks,
  }
}

/**
 * Cache search results for a playlist
 */
export function cacheSearchResults(
  playlistSnapshot: PlaylistSnapshot,
  albums: SpotifyAlbum[],
  tracks: SpotifyTrack[]
): void {
  const cache = getSearchHistoryCache()
  const playlistHash = generatePlaylistHash(
    playlistSnapshot.id,
    playlistSnapshot.totalTracks,
    playlistSnapshot.lastModified
  )
  
  // Remove any existing entry for this playlist
  cache.entries = cache.entries.filter(entry => entry.playlistSnapshot.id !== playlistSnapshot.id)
  
  // Add new entry
  const newEntry: SearchHistoryEntry = {
    playlistHash,
    playlistSnapshot,
    albums: albums.map(compressAlbumData),
    tracks: tracks.map(compressTrackData),
    searchTimestamp: Date.now(),
    cacheVersion: CACHE_VERSION,
  }
  
  cache.entries.push(newEntry)
  saveSearchHistoryCache(cache)
  
  console.log(`Cached search results for playlist ${playlistSnapshot.id} (${albums.length} albums, ${tracks.length} tracks)`)
}

/**
 * Clear all cached search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY)
    console.log('Search history cache cleared')
  } catch (error) {
    console.warn('Error clearing search history cache:', error)
  }
}

/**
 * Get cache statistics for debugging
 */
export function getSearchHistoryCacheStats(): {
  totalEntries: number
  totalSize: string
  oldestEntry?: number
  newestEntry?: number
} {
  const cache = getSearchHistoryCache()
  const serialized = JSON.stringify(cache)
  const sizeInBytes = new Blob([serialized]).size
  const sizeInKB = Math.round(sizeInBytes / 1024)
  
  let oldestEntry: number | undefined
  let newestEntry: number | undefined
  
  if (cache.entries.length > 0) {
    oldestEntry = Math.min(...cache.entries.map(e => e.searchTimestamp))
    newestEntry = Math.max(...cache.entries.map(e => e.searchTimestamp))
  }
  
  return {
    totalEntries: cache.entries.length,
    totalSize: sizeInKB > 1024 ? `${Math.round(sizeInKB / 1024 * 10) / 10}MB` : `${sizeInKB}KB`,
    oldestEntry,
    newestEntry,
  }
}

/**
 * Convert cached data back to Spotify API format for compatibility
 */
export function expandCachedAlbum(albumData: AlbumData): SpotifyAlbum {
  return {
    id: albumData.id,
    name: albumData.name,
    artists: [{ id: 'unknown', name: albumData.artist }],
    release_date: albumData.releaseDate,
    total_tracks: albumData.totalTracks,
    uri: albumData.uri,
    external_urls: albumData.external_urls,
    images: albumData.images,
    album_type: 'album',
    available_markets: [],
  } as SpotifyAlbum
}

/**
 * Convert cached data back to Spotify API format for compatibility
 */
export function expandCachedTrack(trackData: TrackData, album?: SpotifyAlbum): SpotifyTrack {
  return {
    id: trackData.id,
    name: trackData.name,
    uri: trackData.uri,
    album: album,
    artists: trackData.artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      uri: `spotify:artist:${artist.id}`,
      external_urls: { spotify: `https://open.spotify.com/artist/${artist.id}` },
    })),
    duration_ms: trackData.durationMs,
    track_number: trackData.trackNumber,
    explicit: trackData.explicit,
    external_urls: { spotify: `https://open.spotify.com/track/${trackData.id}` },
    preview_url: null,
    popularity: 0,
    is_local: false,
    available_markets: [],
  } as SpotifyTrack
}