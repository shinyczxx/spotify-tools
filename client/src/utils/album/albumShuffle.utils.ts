/**
 * @file albumShuffle.utils.ts
 * @description Utilities for shuffling albums using different methodologies
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { SpotifyAlbum } from 'spotify-api-lib'
import type { ShuffleType } from '../../../types/album'

/**
 * Album shuffling utilities
 */
export class AlbumShuffle {
  /**
   * Shuffle albums using different methodologies
   */
  shuffleAlbums(
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
}