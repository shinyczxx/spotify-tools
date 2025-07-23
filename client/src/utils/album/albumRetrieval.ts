/**
 * @file albumRetrieval.ts
 * @description Smart album retrieval with caching for playlist tools
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import { SpotifyApi } from 'spotify-api-lib'
import type { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'
import {
  getCachedSearchResults,
  cacheSearchResults,
  expandCachedAlbum,
  expandCachedTrack,
  generatePlaylistHash,
} from '../playlist/playlistSearchHistory'
import { getPlaylistTracks } from './playlistOperations'

export interface AlbumRetrievalResult {
  albums: SpotifyAlbum[]
  tracks: SpotifyTrack[]
  fromCache: boolean
  playlistHash: string
  stats: {
    totalTracks: number
    totalAlbums: number
    duplicateAlbums: number
    processingTimeMs: number
  }
}

export interface AlbumRetrievalOptions {
  allowSingles?: boolean
  allowCompilations?: boolean
  maxAlbums?: number
  includeAllTracks?: boolean // Whether to include all tracks or just album metadata
}

/**
 * Retrieve all albums and tracks from selected playlists with intelligent caching
 */
export async function retrieveAlbumsFromPlaylists(
  selectedPlaylistIds: string[],
  spotifyApi: SpotifyApi,
  options: AlbumRetrievalOptions = {}
): Promise<AlbumRetrievalResult> {
  const startTime = Date.now()
  const {
    allowSingles = true,
    allowCompilations = true,
    maxAlbums = 0,
    includeAllTracks = true,
  } = options

  // Get playlist information first to check cache validity
  const playlistSnapshots = await getPlaylistSnapshots(selectedPlaylistIds, spotifyApi)
  const combinedHash = generateCombinedPlaylistHash(playlistSnapshots)

  // Check if we have cached results for this exact combination
  const cached = getCachedSearchResults(
    `combined:${selectedPlaylistIds.join(',')}`,
    playlistSnapshots.reduce((sum, p) => sum + p.totalTracks, 0),
    combinedHash
  )

  if (cached) {
    const albums = cached.albums.map(expandCachedAlbum)
    const tracks = includeAllTracks 
      ? cached.tracks.map(trackData => {
          const album = albums.find(a => a.id === trackData.albumId)
          return expandCachedTrack(trackData, album)
        })
      : []

    return {
      albums: applyAlbumFilters(albums, { allowSingles, allowCompilations, maxAlbums }),
      tracks,
      fromCache: true,
      playlistHash: combinedHash,
      stats: {
        totalTracks: cached.tracks.length,
        totalAlbums: cached.albums.length,
        duplicateAlbums: 0,
        processingTimeMs: Date.now() - startTime,
      }
    }
  }

  // Not in cache, fetch from Spotify
  console.log('Retrieving albums from Spotify API for', selectedPlaylistIds.length, 'playlists')
  
  const allTracks: SpotifyTrack[] = []
  const albumMap = new Map<string, SpotifyAlbum>()
  let duplicateAlbums = 0

  // Process each playlist
  for (const playlistId of selectedPlaylistIds) {
    try {
      const tracks = await getPlaylistTracks(playlistId, spotifyApi)
      
      for (const trackItem of tracks) {
        const track = trackItem.track
        if (!track || !track.album) continue

        allTracks.push(track)

        // Collect unique albums
        if (track.album.id && !albumMap.has(track.album.id)) {
          albumMap.set(track.album.id, track.album)
        } else if (track.album.id) {
          duplicateAlbums++
        }
      }
    } catch (error) {
      console.error(`Error processing playlist ${playlistId}:`, error)
    }
  }

  const albums = Array.from(albumMap.values())
  const filteredAlbums = applyAlbumFilters(albums, { allowSingles, allowCompilations, maxAlbums })

  // Cache the results
  const playlistSnapshot = {
    id: `combined:${selectedPlaylistIds.join(',')}`,
    name: `Combined ${selectedPlaylistIds.length} playlists`,
    totalTracks: allTracks.length,
    lastModified: combinedHash,
    description: `Retrieved ${albums.length} albums from ${selectedPlaylistIds.length} playlists`,
  }

  try {
    cacheSearchResults(playlistSnapshot, albums, allTracks)
  } catch (error) {
    console.warn('Failed to cache search results:', error)
  }

  const processingTimeMs = Date.now() - startTime
  console.log(`Album retrieval completed in ${processingTimeMs}ms: ${albums.length} albums, ${allTracks.length} tracks`)

  return {
    albums: filteredAlbums,
    tracks: includeAllTracks ? allTracks : [],
    fromCache: false,
    playlistHash: combinedHash,
    stats: {
      totalTracks: allTracks.length,
      totalAlbums: albums.length,
      duplicateAlbums,
      processingTimeMs,
    }
  }
}

/**
 * Get snapshot information for playlists to determine cache validity
 */
async function getPlaylistSnapshots(
  playlistIds: string[],
  spotifyApi: SpotifyApi
): Promise<Array<{ id: string; totalTracks: number; lastModified: string }>> {
  const snapshots = []

  for (const playlistId of playlistIds) {
    try {
      if (playlistId === 'liked-songs') {
        // For liked songs, we'll use a simple track count check
        const savedTracks = await spotifyApi.tracks.getSavedTracks({ limit: 1 })
        snapshots.push({
          id: playlistId,
          totalTracks: savedTracks.total,
          lastModified: Date.now().toString(), // Liked songs don't have a last modified, so use current time
        })
      } else {
        // For regular playlists, get the playlist info
        const playlist = await spotifyApi.playlists.getPlaylist(playlistId)
        snapshots.push({
          id: playlistId,
          totalTracks: playlist.tracks.total,
          lastModified: playlist.snapshot_id || Date.now().toString(),
        })
      }
    } catch (error) {
      console.error(`Error getting snapshot for playlist ${playlistId}:`, error)
      // Add a fallback entry to prevent cache issues
      snapshots.push({
        id: playlistId,
        totalTracks: 0,
        lastModified: 'error',
      })
    }
  }

  return snapshots
}

/**
 * Generate a combined hash for multiple playlists
 */
function generateCombinedPlaylistHash(
  snapshots: Array<{ id: string; totalTracks: number; lastModified: string }>
): string {
  const combined = snapshots
    .map(s => `${s.id}:${s.totalTracks}:${s.lastModified}`)
    .sort() // Sort to ensure consistent hashing regardless of order
    .join('|')
  
  return generatePlaylistHash('combined', snapshots.length, combined)
}

/**
 * Apply filtering options to albums
 */
function applyAlbumFilters(
  albums: SpotifyAlbum[],
  options: { allowSingles?: boolean; allowCompilations?: boolean; maxAlbums?: number }
): SpotifyAlbum[] {
  const { allowSingles = true, allowCompilations = true, maxAlbums = 0 } = options

  let filtered = albums

  // Filter by album type
  if (!allowSingles || !allowCompilations) {
    filtered = filtered.filter(album => {
      if (!allowSingles && album.album_type === 'single') return false
      if (!allowCompilations && album.album_type === 'compilation') return false
      return true
    })
  }

  // Limit number of albums
  if (maxAlbums > 0 && filtered.length > maxAlbums) {
    // Shuffle before taking the limit to get a random selection
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    filtered = shuffled.slice(0, maxAlbums)
  }

  return filtered
}

/**
 * Get albums specifically for a single playlist (useful for individual caching)
 */
export async function retrieveAlbumsFromSinglePlaylist(
  playlistId: string,
  spotifyApi: SpotifyApi,
  options: AlbumRetrievalOptions = {}
): Promise<AlbumRetrievalResult> {
  return retrieveAlbumsFromPlaylists([playlistId], spotifyApi, options)
}

/**
 * Preload albums for background caching (fire and forget)
 */
export async function preloadPlaylistAlbums(
  playlistIds: string[],
  spotifyApi: SpotifyApi
): Promise<void> {
  try {
    // Run in background without waiting
    setTimeout(async () => {
      for (const playlistId of playlistIds) {
        try {
          await retrieveAlbumsFromSinglePlaylist(playlistId, spotifyApi, {
            includeAllTracks: false, // Just metadata for preloading
            maxAlbums: 100, // Reasonable limit for background loading
          })
          
          // Add a small delay between requests to be API-friendly
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.warn(`Failed to preload albums for playlist ${playlistId}:`, error)
        }
      }
    }, 1000) // Start after 1 second delay
  } catch (error) {
    console.warn('Error setting up album preloading:', error)
  }
}