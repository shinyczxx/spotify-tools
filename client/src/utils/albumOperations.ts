/**
 * @file albumOperations.ts
 * @description Utility functions for album discovery, shuffling, and
 * playlist creation. Provides core logic for album shuffle features
 * and Spotify API integration.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import api from './api'
import SpotifyApi, { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'

export interface AlbumFilters {
  includeSingles: boolean
  includeCompilations: boolean
  albumCount: number
  shuffleType: ShuffleType
}

export type ShuffleType = 'random' | 'weighted' | 'weighted-older' | 'chronological'

export interface ShuffleResult {
  albums: SpotifyAlbum[]
  shuffleType: ShuffleType
  filters: AlbumFilters
  timestamp: number
}

// Cache for album discovery results
const albumCache = new Map<string, { albums: SpotifyAlbum[]; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get all unique tracks from selected playlists
 */
export async function getTracksFromPlaylists(
  playlistIds: string[],
  accessToken: string,
): Promise<SpotifyTrack[]> {
  const allTracks = new Set<string>()
  const trackMap = new Map<string, SpotifyTrack>()
  let totalFetched = 0
  let playlistsProcessed = 0

  for (const playlistId of playlistIds) {
    try {
      playlistsProcessed++
      let tracksFromPlaylist = 0
      let url = playlistId === 'liked-songs' ? '/me/tracks' : `/playlists/${playlistId}/tracks`

      // Handle pagination
      let pageNumber = 1
      while (url) {
        const response = await api.get(url)

        const tracks = response.data.items
          .map((item: any) => (playlistId === 'liked-songs' ? item.track : item.track))
          .filter((track: any) => track && track.id) // Filter out null/undefined tracks

        for (const track of tracks) {
          if (!allTracks.has(track.id)) {
            allTracks.add(track.id)
            trackMap.set(track.id, track)
            tracksFromPlaylist++
            totalFetched++
          }
        }

        url = response.data.next
          ? response.data.next.replace('https://api.spotify.com/v1', '')
          : null
        pageNumber++
      }
    } catch (error) {
      console.error(`Error fetching tracks for playlist ${playlistId}:`, error)
    }
  }

  const result = Array.from(trackMap.values())

  return result
}

/**
 * Check if a single/compilation track exists on a proper album by searching the artist's discography
 */
async function findTrackOnAlbum(
  track: SpotifyTrack,
  accessToken: string,
): Promise<SpotifyAlbum | null> {
  try {
    const spotify = new SpotifyApi(accessToken)

    // Search for albums by the primary artist
    const artistId = track.artists[0]?.id
    if (!artistId) {
      //
      return null
    }

    //

    const albumsData = await spotify.artists.getAlbums(artistId, {
      include_groups: ['album'],
      limit: 50,
    })
    const albums = albumsData.items || []

    //

    // Check each album to see if it contains this track
    for (const album of albums) {
      try {
        //
        const albumResponse = await api.get(`/albums/${album.id}`)
        const albumTracks = albumResponse.data.tracks?.items || []

        // Check if this track exists on the album
        const trackExists = albumTracks.some(
          (albumTrack: any) =>
            albumTrack.name.toLowerCase() === track.name.toLowerCase() &&
            albumTrack.artists.some((artist: any) =>
              track.artists.some(
                (trackArtist) => artist.name.toLowerCase() === trackArtist.name.toLowerCase(),
              ),
            ),
        )

        if (trackExists) {
          //
          return album
        }
      } catch (error) {
        //
        // Continue to next album if this one fails
        continue
      }
    }

    //

    return null
  } catch (error) {
    //
    console.error('Error searching for track on album:', error)
    return null
  }
}

/**
 * Discover unique albums from tracks based on filters
 */
export async function discoverAlbums(
  tracks: SpotifyTrack[],
  filters: AlbumFilters,
  accessToken: string,
): Promise<SpotifyAlbum[]> {
  //

  // Create cache key based on track IDs and filters
  const cacheKey = JSON.stringify({
    trackIds: tracks.map((t) => t.id).sort(),
    filters: {
      includeSingles: filters.includeSingles,
      includeCompilations: filters.includeCompilations,
    },
  })

  // Check cache
  const cached = albumCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    //
    return cached.albums
  }

  //

  const albumMap = new Map<string, SpotifyAlbum>()
  let processedTracks = 0
  let albumsAdded = 0
  let singlesFound = 0
  let compilationsFound = 0
  let singlesUpgraded = 0
  let compilationsUpgraded = 0

  for (const track of tracks) {
    processedTracks++
    const album = track.album
    const albumType = album.album_type

    //

    if (albumType === 'album') {
      // Always include proper albums
      if (!albumMap.has(album.id)) {
        albumMap.set(album.id, album)
        albumsAdded++
        //
      }
    } else if (albumType === 'single') {
      singlesFound++
      if (filters.includeSingles) {
        // Include singles if filter is enabled
        if (!albumMap.has(album.id)) {
          albumMap.set(album.id, album)
          albumsAdded++
          //
        }
      } else {
        //
        // Check if single track exists on a proper album
        const albumVersion = await findTrackOnAlbum(track, accessToken)
        if (albumVersion && !albumMap.has(albumVersion.id)) {
          albumMap.set(albumVersion.id, albumVersion)
          albumsAdded++
          singlesUpgraded++
          //
        }
      }
    } else if (albumType === 'compilation') {
      compilationsFound++
      if (filters.includeCompilations) {
        // Include compilations if filter is enabled
        if (!albumMap.has(album.id)) {
          albumMap.set(album.id, album)
          albumsAdded++
          //
        }
      } else {
        //
        // Check if compilation track exists on a proper album
        const albumVersion = await findTrackOnAlbum(track, accessToken)
        if (albumVersion && !albumMap.has(albumVersion.id)) {
          albumMap.set(albumVersion.id, albumVersion)
          albumsAdded++
          compilationsUpgraded++
          //
        }
      }
    }
  }

  const albums = Array.from(albumMap.values())

  // Cache the result
  albumCache.set(cacheKey, { albums, timestamp: Date.now() })

  return albums
}

/**
 * Shuffle albums using different methodologies
 */
export function shuffleAlbums(
  albums: SpotifyAlbum[],
  shuffleType: ShuffleType,
  count: number,
): SpotifyAlbum[] {
  console.debug('🎲 Starting album shuffle...', {
    inputAlbumCount: albums.length,
    requestedCount: count,
    shuffleType,
    albumSample: albums.slice(0, 3).map((a) => ({
      name: a.name,
      artist: a.artists[0]?.name,
      releaseDate: a.release_date,
    })),
  })

  let shuffled: SpotifyAlbum[]

  switch (shuffleType) {
    case 'random':
      console.debug('🎲 Using random shuffle algorithm')
      shuffled = [...albums].sort(() => Math.random() - 0.5)
      break

    case 'weighted':
      console.debug('🎲 Using weighted shuffle algorithm (newer albums preferred)')
      // Weight newer albums higher
      shuffled = [...albums].sort((a, b) => {
        const yearA = new Date(a.release_date).getFullYear()
        const yearB = new Date(b.release_date).getFullYear()
        const weightA = Math.random() * (yearA / 1000) // Newer albums get higher weight
        const weightB = Math.random() * (yearB / 1000)
        return weightB - weightA
      })
      break

    case 'weighted-older':
      console.debug('🎲 Using weighted shuffle algorithm (older albums preferred)')
      // Weight older albums higher
      shuffled = [...albums].sort((a, b) => {
        const yearA = new Date(a.release_date).getFullYear()
        const yearB = new Date(b.release_date).getFullYear()
        // Invert the weighting - older albums (lower years) get higher weight
        const weightA = Math.random() * ((2100 - yearA) / 1000) // Older albums get higher weight
        const weightB = Math.random() * ((2100 - yearB) / 1000)
        return weightB - weightA
      })
      break

    case 'chronological':
      console.debug('🎲 Using chronological shuffle algorithm (with 30% randomness)')
      // Mix of chronological with some randomness
      shuffled = [...albums].sort((a, b) => {
        const dateA = new Date(a.release_date).getTime()
        const dateB = new Date(b.release_date).getTime()
        const randomFactor = (Math.random() - 0.5) * 0.3 // 30% randomness
        return (dateB - dateA) * (1 + randomFactor)
      })
      break

    default:
      console.debug('🎲 Using default shuffle (no sorting)')
      shuffled = [...albums]
  }

  const finalCount = Math.min(count, shuffled.length)
  const result = shuffled.slice(0, finalCount)

  console.debug('🎲 Shuffle complete!', {
    originalCount: albums.length,
    requestedCount: count,
    finalCount: result.length,
    shuffleType,
    resultSample: result.slice(0, 3).map((a) => ({
      name: a.name,
      artist: a.artists[0]?.name,
      releaseDate: a.release_date,
    })),
  })

  return result
}

/**
 * Generate a unique playlist name
 */
export function generatePlaylistName(
  albums: SpotifyAlbum[],
  shuffleType: ShuffleType,
  selectedCount?: number,
): string {
  const date = new Date().toLocaleDateString()
  const shuffleTypeNames = {
    'random': 'Random',
    'weighted': 'Weighted (Newer)',
    'weighted-older': 'Weighted (Older)',
    'chronological': 'Chronological',
  }

  // Use selectedCount if provided, otherwise use total albums length
  const albumCount = selectedCount ?? albums.length
  const shuffleName = shuffleTypeNames[shuffleType]

  return `Album Shuffle - ${shuffleName} (${albumCount} albums) - ${date}`
}

/**
 * Create a Spotify playlist from shuffled albums
 */
export async function createSpotifyPlaylist(
  albums: SpotifyAlbum[],
  playlistName: string,
  isPublic: boolean,
  accessToken: string,
): Promise<{ id: string; external_urls: { spotify: string } }> {
  try {
    const spotify = new SpotifyApi(accessToken)

    // Create the playlist
    const createResponse = await spotify.playlists.create(playlistName, {
      description: `Album shuffle playlist created on ${new Date().toLocaleDateString()}`,
      public: isPublic,
    })

    const playlistId = createResponse.id

    // Get all track URIs from albums
    const trackUris: string[] = []

    for (const album of albums) {
      try {
        const tracksData = await spotify.albums.getTracks(album.id)
        const tracks = tracksData.items || []
        trackUris.push(...tracks.map((track) => track.uri))
      } catch (error) {
        console.error(`Error fetching album tracks for ${album.id}:`, error)
      }
    }

    // Add tracks to playlist
    if (trackUris.length > 0) {
      await spotify.playlists.addTracks(playlistId, trackUris)
    }

    return createResponse
  } catch (error) {
    console.error('Error creating playlist:', error)
    throw new Error('Failed to create playlist')
  }
}

/**
 * Clear the album cache
 */
export function clearAlbumCache(): void {
  albumCache.clear()
}
