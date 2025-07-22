/**
 * @file playlistAlbumFetcher.ts
 * @description Utility for fetching albums from playlists with caching and spotify-api-lib support
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-16
 */

import type { SpotifyAlbum, SpotifyTrack } from 'spotify-api-lib'
import api from './api'

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
  albums: SpotifyAlbum[]
  hash: string
  timestamp: number
  totalTracks: number
}

// Cache management
const CACHE_KEY = 'playlist-albums-cache'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Generate a hash for playlist IDs combination
 */
function generatePlaylistHash(playlistIds: string[]): string {
  const sorted = [...playlistIds].sort()
  return btoa(sorted.join(',')).replace(/[+/=]/g, '')
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
 * Cache albums for playlist combination
 */
function cacheAlbums(playlistIds: string[], albums: SpotifyAlbum[], totalTracks: number): void {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    let cacheData: PlaylistAlbumCache[] = cached ? JSON.parse(cached) : []
    
    const hash = generatePlaylistHash(playlistIds)
    
    // Remove existing entry for this hash
    cacheData = cacheData.filter(item => item.hash !== hash)
    
    // Add new entry
    cacheData.push({
      playlistIds: [...playlistIds].sort(),
      albums,
      hash,
      timestamp: Date.now(),
      totalTracks
    })
    
    // Keep only the 10 most recent entries
    cacheData.sort((a, b) => b.timestamp - a.timestamp)
    cacheData = cacheData.slice(0, 10)
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    console.debug('📋 Cached albums for playlist combination:', { hash, albumCount: albums.length, totalTracks })
  } catch (error) {
    console.warn('Error caching playlist albums:', error)
  }
}

/**
 * Fetch all tracks from a playlist with pagination
 */
async function fetchPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = []
  let url = playlistId === 'liked-songs' ? '/me/tracks' : `/playlists/${playlistId}/tracks`
  
  while (url) {
    try {
      const response = await api.get(url)
      const items = response.data.items || []
      
      for (const item of items) {
        const track = playlistId === 'liked-songs' ? item.track : item.track
        if (track && track.id && track.album) {
          tracks.push(track)
        }
      }
      
      url = response.data.next 
        ? response.data.next.replace('https://api.spotify.com/v1', '')
        : null
    } catch (error) {
      console.error(`Error fetching tracks for playlist ${playlistId}:`, error)
      break
    }
  }
  
  return tracks
}

/**
 * Extract unique albums from tracks with console debugging and track counting
 */
function extractAlbumsFromTracks(tracks: SpotifyTrack[]): AlbumWithTrackCount[] {
  const albumMap = new Map<string, { album: SpotifyAlbum, trackCount: number }>()
  
  for (const track of tracks) {
    console.debug('🎵 Processing track:', {
      trackName: track.name,
      artist: track.artists?.[0]?.name,
      albumName: track.album?.name,
      albumType: track.album?.album_type,
      albumId: track.album?.id
    })
    
    if (track.album && track.album.id) {
      if (albumMap.has(track.album.id)) {
        // Increment track count for existing album
        const existing = albumMap.get(track.album.id)!
        existing.trackCount++
      } else {
        // Add new album with initial track count
        albumMap.set(track.album.id, {
          album: track.album,
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
    console.debug('📋 Found cached album data')
    // For cached results, we need to recreate albumsWithTrackCounts
    const albumsWithTrackCounts = cached.albums.map(album => ({
      ...album,
      estimatedTrackCount: album.total_tracks || 10 // Fallback estimate
    }))
    return {
      albums: cached.albums,
      albumsWithTrackCounts,
      totalTracks: cached.totalTracks,
      processedTracks: cached.totalTracks,
      fromCache: true
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

    console.debug('✅ Selected album:', {
      albumName: album.name,
      albumTracks: albumTrackCount,
      runningTotal: totalTracks
    })

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
 * Get cache statistics
 */
export function getPlaylistAlbumCacheStats(): { entryCount: number, totalSize: number } {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return { entryCount: 0, totalSize: 0 }
    
    const cacheData: PlaylistAlbumCache[] = JSON.parse(cached)
    return {
      entryCount: cacheData.length,
      totalSize: new Blob([cached]).size
    }
  } catch (error) {
    return { entryCount: 0, totalSize: 0 }
  }
}