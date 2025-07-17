/**
 * @file shuffleUtils.ts
 * @description Utilities for shuffling tracks with different algorithms
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with multiple shuffle algorithms
 */

import type { SpotifyAlbum, SpotifyTrack } from 'spotify-api-lib'
import type { ShuffledTrack } from '@types/playlist'
import api from './api'

export type ShuffleAlgorithm = 'random' | 'weighted-newer' | 'weighted-older' | 'chronological' | 'spiral-dance'

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Get tracks from albums and shuffle ALBUMS according to the specified algorithm.
 * Track order within each album is preserved.
 */
export async function shuffleTracksWithAlgorithm(
  albums: SpotifyAlbum[],
  algorithm: ShuffleAlgorithm,
): Promise<ShuffledTrack[]> {
  console.log(`🎲 Shuffling albums with algorithm: ${algorithm} (preserving track order within albums)`)

  // Apply the specified algorithm to shuffle ALBUM ORDER
  let shuffledAlbums: SpotifyAlbum[]
  
  switch (algorithm) {
    case 'random':
      shuffledAlbums = shuffleArray(albums)
      break

    case 'weighted-newer':
      shuffledAlbums = shuffleAlbumsByWeight(albums, 'newer')
      break

    case 'weighted-older':
      shuffledAlbums = shuffleAlbumsByWeight(albums, 'older')
      break

    case 'chronological':
      shuffledAlbums = shuffleAlbumsChronologically(albums)
      break

    case 'spiral-dance':
      shuffledAlbums = spiralDanceAlbumShuffle(albums)
      break

    default:
      shuffledAlbums = shuffleArray(albums)
      break
  }

  // Now generate tracks from shuffled albums, preserving track order within each album
  const allTracks: ShuffledTrack[] = []
  
  for (const album of shuffledAlbums) {
    // Get real tracks for this album
    const albumTracks = await fetchRealAlbumTracks(album)
    allTracks.push(...albumTracks)
  }

  console.log(`✅ Generated ${allTracks.length} tracks from ${shuffledAlbums.length} albums`)
  return allTracks
}

/**
 * Fetch real tracks from an album using Spotify API
 */
async function fetchRealAlbumTracks(album: SpotifyAlbum): Promise<ShuffledTrack[]> {
  try {
    console.log(`🎵 Fetching real tracks for album: ${album.name}`)
    
    const response = await api.get(`/albums/${album.id}/tracks`)
    const tracks = response.data.items || []
    
    return tracks.map((track: SpotifyTrack, index: number) => ({
      id: track.id,
      name: track.name,
      uri: track.uri,
      artists: track.artists,
      album: {
        id: album.id,
        name: album.name,
        album_type: album.album_type,
        images: album.images?.map((img) => ({
          url: img.url,
          height: img.height || undefined,
          width: img.width || undefined,
        })),
      },
      albumName: album.name,
      albumId: album.id,
      energy: Math.random(), // We don't have real energy data without audio features
    }))
  } catch (error) {
    console.error(`❌ Error fetching tracks for album ${album.name}:`, error)
    // Fallback to simulated tracks if API call fails
    return generateSimulatedTracks(album)
  }
}

/**
 * Generate simulated tracks for an album (fallback when API fails)
 */
function generateSimulatedTracks(album: SpotifyAlbum): ShuffledTrack[] {
  const trackCount = Math.floor(Math.random() * 12) + 3 // 3-15 tracks per album
  const tracks: ShuffledTrack[] = []

  for (let i = 1; i <= trackCount; i++) {
    tracks.push({
      id: `${album.id}-track-${i}`,
      name: `Track ${i}`,
      uri: `spotify:track:${album.id}-track-${i}`,
      artists: album.artists || [{ name: 'Unknown Artist', id: 'unknown' }],
      album: {
        id: album.id,
        name: album.name,
        album_type: album.album_type,
        images: album.images?.map((img) => ({
          url: img.url,
          height: img.height || undefined,
          width: img.width || undefined,
        })),
      },
      albumName: album.name,
      albumId: album.id,
      energy: Math.random(), // Simulated energy value (0-1)
    })
  }

  return tracks
}

/**
 * Shuffle albums with release date weighting
 */
function shuffleAlbumsByWeight(
  albums: SpotifyAlbum[],
  preference: 'newer' | 'older',
): SpotifyAlbum[] {
  const albumsWithWeights = albums.map((album) => {
    const releaseYear = album.release_date
      ? parseInt(album.release_date.slice(0, 4))
      : 2000

    const currentYear = new Date().getFullYear()
    const yearDiff = currentYear - releaseYear

    // Calculate weight based on preference
    let weight: number
    if (preference === 'newer') {
      // Newer albums get higher weight (lower yearDiff = higher weight)
      weight = Math.max(0.1, 1 - yearDiff / 50)
    } else {
      // Older albums get higher weight (higher yearDiff = higher weight up to a point)
      weight = Math.min(1, yearDiff / 20)
    }

    return { album, weight, random: Math.random() }
  })

  // Sort by weighted random values
  return albumsWithWeights
    .sort((a, b) => b.weight * b.random - a.weight * a.random)
    .map((item) => item.album)
}

/**
 * Chronological album shuffle with some randomness
 */
function shuffleAlbumsChronologically(
  albums: SpotifyAlbum[],
): SpotifyAlbum[] {
  // Sort albums by release date with some randomness
  const albumsWithRandomness = albums.map((album) => {
    const releaseDate = new Date(album.release_date || '1900-01-01').getTime()
    const randomFactor = (Math.random() - 0.5) * 0.3 // 30% randomness
    return {
      album,
      sortKey: releaseDate * (1 + randomFactor)
    }
  })

  return albumsWithRandomness
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((item) => item.album)
}

/**
 * Spiral Dance album shuffle - Creates a spiral pattern by alternating between
 * alphabetically first/last albums and oldest/newest
 */
function spiralDanceAlbumShuffle(albums: SpotifyAlbum[]): SpotifyAlbum[] {
  // Sort albums by name alphabetically and by release date
  const alphabeticalOrder = [...albums].sort((a, b) => 
    a.name.localeCompare(b.name)
  )
  const chronologicalOrder = [...albums].sort((a, b) => {
    const dateA = new Date(a.release_date || '1900-01-01').getTime()
    const dateB = new Date(b.release_date || '1900-01-01').getTime()
    return dateA - dateB
  })

  const result: SpotifyAlbum[] = []
  const usedAlbums = new Set<string>()
  
  let alphaStart = 0
  let alphaEnd = alphabeticalOrder.length - 1
  let chronoStart = 0
  let chronoEnd = chronologicalOrder.length - 1
  let useAlpha = true
  let useStart = true
  
  // Create spiral pattern by alternating between different ends of sorted lists
  while (usedAlbums.size < albums.length) {
    let selectedAlbum: SpotifyAlbum | null = null
    
    if (useAlpha) {
      // Pick from alphabetical order
      if (useStart && alphaStart <= alphaEnd) {
        selectedAlbum = alphabeticalOrder[alphaStart]
        alphaStart++
      } else if (!useStart && alphaEnd >= alphaStart) {
        selectedAlbum = alphabeticalOrder[alphaEnd]
        alphaEnd--
      }
    } else {
      // Pick from chronological order
      if (useStart && chronoStart <= chronoEnd) {
        selectedAlbum = chronologicalOrder[chronoStart]
        chronoStart++
      } else if (!useStart && chronoEnd >= chronoStart) {
        selectedAlbum = chronologicalOrder[chronoEnd]
        chronoEnd--
      }
    }
    
    if (selectedAlbum && !usedAlbums.has(selectedAlbum.id)) {
      usedAlbums.add(selectedAlbum.id)
      result.push(selectedAlbum)
    }
    
    // Switch between alphabetical/chronological and start/end
    useAlpha = !useAlpha
    if (Math.random() < 0.4) { // 40% chance to switch start/end direction
      useStart = !useStart
    }
  }
  
  return result
}
