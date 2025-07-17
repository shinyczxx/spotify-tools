/**
 * @file lastFmRelated.ts
 * @description Utility for finding related albums using Last.fm data with weighted algorithms
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @description
 * This utility takes Last.fm data and user-defined weights to find related albums
 * through tag-based discovery and similar artist recommendations. It provides
 * an algorithmically random but weighted selection of related content.
 *
 * @usage
 * ```javascript
 * const related = new LastFmRelated(lastFmApiKey);
 * const albums = await related.findRelatedAlbums(lastFmInfo, {
 *   tagWeight: 0.7,
 *   similarArtistWeight: 0.3,
 *   maxResults: 20
 * });
 * ```
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with tag-based and similar artist album discovery
 */

import { LastFm, LastFmTag, LastFmArtist, LastFmAlbum } from './lastFmApi'
import { SpotifyApi } from './spotifyApi'
import type { LastFmAlbumResult, LastFmArtistResult } from './lastFmFinder'

export interface RelatedAlbumsOptions {
  tagWeight: number // 0-1, weight for tag-based discovery
  similarArtistWeight: number // 0-1, weight for similar artist discovery
  maxResults?: number // Maximum number of albums to return
  minTagCount?: number // Minimum tag count to consider
  diversityFactor?: number // 0-1, how much to prioritize diversity over similarity
  excludeOriginalArtist?: boolean // Whether to exclude the original artist from results
}

export interface RelatedAlbumResult {
  album: LastFmAlbum
  score: number // Relevance score 0-1
  source: 'tag' | 'similar_artist' | 'combined'
  sourceDetails: {
    matchingTags?: string[]
    similarArtist?: string
    tagScore?: number
    artistScore?: number
  }
  spotifyId?: string // Spotify album ID if found
}

export interface RelatedAlbumsResponse {
  albums: RelatedAlbumResult[]
  totalFound: number
  tagBasedCount: number
  similarArtistCount: number
  spotifyIdsFound: string[]
}

/**
 * Last.fm related content finder utility class
 */
export class LastFmRelated {
  private lastFm: LastFm
  private spotify?: SpotifyApi

  constructor(lastFmApiKey?: string, spotifyAccessToken?: string) {
    this.lastFm = new LastFm(lastFmApiKey)

    if (spotifyAccessToken) {
      this.spotify = new SpotifyApi(spotifyAccessToken)
    }
  }

  /**
   * Set Last.fm API key
   */
  setLastFmApiKey(apiKey: string): void {
    this.lastFm.setApiKey(apiKey)
  }

  /**
   * Set Spotify access token
   */
  setSpotifyAccessToken(token: string): void {
    if (this.spotify) {
      this.spotify.setAccessToken(token)
    } else {
      try {
        this.spotify = new SpotifyApi(token)
      } catch (error) {
        console.warn('Could not initialize Spotify API:', error)
        this.spotify = undefined
      }
    }
  }

  /**
   * Find related albums based on Last.fm data
   */
  async findRelatedAlbums(
    lastFmData: LastFmAlbumResult | LastFmArtistResult,
    options: RelatedAlbumsOptions,
  ): Promise<RelatedAlbumsResponse> {
    const {
      tagWeight,
      similarArtistWeight,
      maxResults = 20,
      minTagCount = 5,
      diversityFactor = 0.3,
      excludeOriginalArtist = true,
    } = options

    // Normalize weights
    const totalWeight = tagWeight + similarArtistWeight
    const normalizedTagWeight = totalWeight > 0 ? tagWeight / totalWeight : 0
    const normalizedSimilarWeight = totalWeight > 0 ? similarArtistWeight / totalWeight : 0

    const tagBasedAlbums: RelatedAlbumResult[] = []
    const similarArtistAlbums: RelatedAlbumResult[] = []

    // Get albums from tags
    if (normalizedTagWeight > 0 && lastFmData.tags.length > 0) {
      const tagAlbums = await this.findAlbumsByTags(
        lastFmData.tags,
        Math.ceil(maxResults * normalizedTagWeight * 2), // Get more than needed for filtering
        minTagCount,
      )
      tagBasedAlbums.push(...tagAlbums)
    }

    // Get albums from similar artists
    if (normalizedSimilarWeight > 0) {
      let similarArtists: LastFmArtist[] = []

      if ('similarArtists' in lastFmData && lastFmData.similarArtists) {
        similarArtists = lastFmData.similarArtists
      } else if ('artist' in lastFmData && lastFmData.artist) {
        // If we have artist data but no similar artists, fetch them
        try {
          similarArtists = await this.lastFm.artist.getSimilar(lastFmData.artist.name, {
            limit: 20,
            autocorrect: true,
          })
        } catch (error) {
          console.warn('Could not fetch similar artists:', error)
        }
      }

      if (similarArtists.length > 0) {
        const artistAlbums = await this.findAlbumsBySimilarArtists(
          similarArtists,
          Math.ceil(maxResults * normalizedSimilarWeight * 2),
        )
        similarArtistAlbums.push(...artistAlbums)
      }
    }

    // Combine and score albums
    const allAlbums = [...tagBasedAlbums, ...similarArtistAlbums]
    const processedAlbums = this.combineAndScoreAlbums(
      allAlbums,
      normalizedTagWeight,
      normalizedSimilarWeight,
      diversityFactor,
    )

    // Filter out original artist if requested
    let filteredAlbums = processedAlbums
    if (excludeOriginalArtist && 'artist' in lastFmData && lastFmData.artist) {
      const originalArtistName = lastFmData.artist.name.toLowerCase()
      filteredAlbums = processedAlbums.filter((album) => {
        const albumArtistName =
          typeof album.album.artist === 'string'
            ? album.album.artist.toLowerCase()
            : album.album.artist.name.toLowerCase()
        return albumArtistName !== originalArtistName
      })
    }

    // Apply algorithmic randomness while preserving quality
    const selectedAlbums = this.selectAlbumsWithRandomness(
      filteredAlbums,
      maxResults,
      diversityFactor,
    )

    // Try to find Spotify IDs for the selected albums
    const spotifyIds = await this.findSpotifyIds(selectedAlbums)

    return {
      albums: selectedAlbums,
      totalFound: allAlbums.length,
      tagBasedCount: tagBasedAlbums.length,
      similarArtistCount: similarArtistAlbums.length,
      spotifyIdsFound: spotifyIds,
    }
  }

  /**
   * Find albums by tags
   */
  private async findAlbumsByTags(
    tags: LastFmTag[],
    maxAlbums: number,
    minTagCount: number,
  ): Promise<RelatedAlbumResult[]> {
    const albums: RelatedAlbumResult[] = []
    const seenAlbumIds = new Set<string>()

    // Sort tags by count (popularity) and take the most relevant ones
    const sortedTags = tags
      .filter((tag) => tag.count >= minTagCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Use top 8 tags maximum

    for (const tag of sortedTags) {
      if (albums.length >= maxAlbums) break

      try {
        const tagAlbums = await this.lastFm.tag.getTopAlbums(tag.name, {
          limit: Math.min(20, Math.ceil(maxAlbums / sortedTags.length) + 5),
        })

        for (const album of tagAlbums) {
          if (albums.length >= maxAlbums) break

          const albumKey = `${album.name}-${
            typeof album.artist === 'string' ? album.artist : album.artist.name
          }`
          if (seenAlbumIds.has(albumKey)) continue

          seenAlbumIds.add(albumKey)

          // Calculate tag-based score
          const tagScore = this.calculateTagScore(tag, tags)

          albums.push({
            album,
            score: tagScore,
            source: 'tag',
            sourceDetails: {
              matchingTags: [tag.name],
              tagScore,
            },
          })
        }
      } catch (error) {
        console.warn(`Could not fetch albums for tag "${tag.name}":`, error)
      }
    }

    return albums
  }

  /**
   * Find albums by similar artists
   */
  private async findAlbumsBySimilarArtists(
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
   * Combine and score albums from different sources
   */
  private combineAndScoreAlbums(
    albums: RelatedAlbumResult[],
    tagWeight: number,
    artistWeight: number,
    diversityFactor: number,
  ): RelatedAlbumResult[] {
    // Group albums by unique identifier
    const albumMap = new Map<string, RelatedAlbumResult[]>()

    albums.forEach((album) => {
      const key = `${album.album.name}-${
        typeof album.album.artist === 'string' ? album.album.artist : album.album.artist.name
      }`
      if (!albumMap.has(key)) {
        albumMap.set(key, [])
      }
      albumMap.get(key)!.push(album)
    })

    // Combine scores for albums found through multiple sources
    const combinedAlbums: RelatedAlbumResult[] = []

    albumMap.forEach((albumGroup) => {
      if (albumGroup.length === 1) {
        // Single source album
        const album = albumGroup[0]
        let finalScore = album.score

        if (album.source === 'tag') {
          finalScore *= tagWeight
        } else if (album.source === 'similar_artist') {
          finalScore *= artistWeight
        }

        combinedAlbums.push({
          ...album,
          score: finalScore,
        })
      } else {
        // Multi-source album - combine scores
        const tagAlbums = albumGroup.filter((a) => a.source === 'tag')
        const artistAlbums = albumGroup.filter((a) => a.source === 'similar_artist')

        const tagScore =
          tagAlbums.length > 0 ? Math.max(...tagAlbums.map((a) => a.score)) * tagWeight : 0

        const artistScore =
          artistAlbums.length > 0 ? Math.max(...artistAlbums.map((a) => a.score)) * artistWeight : 0

        const combinedScore = tagScore + artistScore + 0.1 * diversityFactor // Bonus for multi-source

        const baseAlbum = albumGroup[0]
        const allMatchingTags = tagAlbums.flatMap((a) => a.sourceDetails.matchingTags || [])
        const similarArtists = artistAlbums
          .map((a) => a.sourceDetails.similarArtist)
          .filter(Boolean)

        combinedAlbums.push({
          ...baseAlbum,
          score: Math.min(combinedScore, 1.0), // Cap at 1.0
          source: 'combined',
          sourceDetails: {
            matchingTags: [...new Set(allMatchingTags)],
            similarArtist: similarArtists[0],
            tagScore,
            artistScore,
          },
        })
      }
    })

    return combinedAlbums.sort((a, b) => b.score - a.score)
  }

  /**
   * Select albums with algorithmic randomness
   */
  private selectAlbumsWithRandomness(
    albums: RelatedAlbumResult[],
    maxResults: number,
    diversityFactor: number,
  ): RelatedAlbumResult[] {
    if (albums.length <= maxResults) {
      return albums
    }

    const selected: RelatedAlbumResult[] = []
    const remaining = [...albums]

    // Always take the top scoring albums (quality preservation)
    const guaranteedCount = Math.ceil(maxResults * (1 - diversityFactor))
    selected.push(...remaining.splice(0, guaranteedCount))

    // Fill remaining slots with weighted random selection
    const remainingSlots = maxResults - selected.length

    for (let i = 0; i < remainingSlots && remaining.length > 0; i++) {
      // Create weighted selection based on scores
      const weights = remaining.map((album) => Math.pow(album.score, 2)) // Square to emphasize higher scores
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

      if (totalWeight === 0) {
        // Fallback to random selection
        const randomIndex = Math.floor(Math.random() * remaining.length)
        selected.push(remaining.splice(randomIndex, 1)[0])
      } else {
        // Weighted random selection
        let randomValue = Math.random() * totalWeight
        let selectedIndex = 0

        for (let j = 0; j < weights.length; j++) {
          randomValue -= weights[j]
          if (randomValue <= 0) {
            selectedIndex = j
            break
          }
        }

        selected.push(remaining.splice(selectedIndex, 1)[0])
      }
    }

    return selected.sort((a, b) => b.score - a.score)
  }

  /**
   * Calculate tag-based score
   */
  private calculateTagScore(tag: LastFmTag, allTags: LastFmTag[]): number {
    const maxCount = Math.max(...allTags.map((t) => t.count))
    const normalizedCount = tag.count / maxCount

    // Give higher scores to more popular tags
    return Math.min(normalizedCount, 1.0)
  }

  /**
   * Find Spotify IDs for albums
   */
  private async findSpotifyIds(albums: RelatedAlbumResult[]): Promise<string[]> {
    if (!this.spotify) {
      return []
    }

    const spotifyIds: string[] = []

    for (const albumResult of albums.slice(0, 10)) {
      // Limit to avoid API rate limits
      try {
        const artistName =
          typeof albumResult.album.artist === 'string'
            ? albumResult.album.artist
            : albumResult.album.artist.name

        const searchQuery = `album:"${albumResult.album.name}" artist:"${artistName}"`
        const searchResult = await this.spotify.search.albums(searchQuery, { limit: 1 })

        if (searchResult.albums && searchResult.albums.items.length > 0) {
          const spotifyAlbum = searchResult.albums.items[0]
          albumResult.spotifyId = spotifyAlbum.id
          spotifyIds.push(spotifyAlbum.id)
        }
      } catch (error) {
        console.warn('Could not find Spotify ID for album:', albumResult.album.name, error)
      }
    }

    return spotifyIds
  }

  /**
   * Get related albums for a specific tag
   */
  async getAlbumsByTag(
    tagName: string,
    options?: {
      limit?: number
      page?: number
    },
  ): Promise<LastFmAlbum[]> {
    try {
      return await this.lastFm.tag.getTopAlbums(tagName, options)
    } catch (error) {
      console.error('Error fetching albums by tag:', error)
      return []
    }
  }

  /**
   * Get albums from a specific similar artist
   */
  async getAlbumsBySimilarArtist(
    artistName: string,
    options?: {
      limit?: number
      includeGroups?: string
    },
  ): Promise<LastFmAlbum[]> {
    try {
      return await this.lastFm.artist.getTopAlbums(artistName, {
        limit: options?.limit || 20,
        autocorrect: true,
      })
    } catch (error) {
      console.error('Error fetching albums by similar artist:', error)
      return []
    }
  }
}

export default LastFmRelated
