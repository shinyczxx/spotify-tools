/**
 * @file similarArtistDiscovery.utils.ts
 * @description Utilities for discovering albums through similar artists
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFm, LastFmArtist } from '../lastFmApi'
import type { RelatedAlbumResult } from '../lastFmRelated'

/**
 * Find albums by similar artists using Last.fm API
 */
export class SimilarArtistDiscovery {
  private lastFm: LastFm

  constructor(lastFm: LastFm) {
    this.lastFm = lastFm
  }

  /**
   * Find albums by similar artists
   */
  async findAlbumsBySimilarArtists(
    similarArtists: LastFmArtist[],
    maxAlbums: number,
  ): Promise<RelatedAlbumResult[]> {
    const albums: RelatedAlbumResult[] = []
    const seenAlbumIds = new Set<string>()

    // Sort artists by match score and take the most similar ones
    const sortedArtists = similarArtists
      .sort((a, b) => (b.match || 0) - (a.match || 0))
      .slice(0, 10) // Use top 10 similar artists

    for (const artist of sortedArtists) {
      if (albums.length >= maxAlbums) break

      try {
        const artistAlbums = await this.lastFm.artist.getTopAlbums(artist.name, {
          limit: Math.min(10, Math.ceil(maxAlbums / sortedArtists.length) + 2),
        })

        for (const album of artistAlbums) {
          if (albums.length >= maxAlbums) break

          const albumKey = `${album.name}-${
            typeof album.artist === 'string' ? album.artist : album.artist.name
          }`
          if (seenAlbumIds.has(albumKey)) continue

          seenAlbumIds.add(albumKey)

          // Calculate artist similarity score
          const artistScore = artist.match || 0

          albums.push({
            album,
            score: artistScore,
            source: 'similar_artist',
            sourceDetails: {
              similarArtist: artist.name,
              artistScore,
            },
          })
        }
      } catch (error) {
        console.warn(`Could not fetch albums for artist "${artist.name}":`, error)
      }
    }

    return albums
  }

  /**
   * Fetch similar artists for a given artist name
   */
  async getSimilarArtists(artistName: string, limit: number = 20): Promise<LastFmArtist[]> {
    try {
      return await this.lastFm.artist.getSimilar(artistName, {
        limit,
        autocorrect: true,
      })
    } catch (error) {
      console.warn('Could not fetch similar artists:', error)
      return []
    }
  }
}