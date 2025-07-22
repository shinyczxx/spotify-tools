/**
 * @file lastFmRelated.ts
 * @description Utility for finding related albums using modular Last.fm discovery services
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
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
 * - 2.0.0: Modularized with domain-specific utility classes
 * - 1.0.0: Initial implementation with tag-based and similar artist album discovery
 */

import { LastFm, LastFmTag, LastFmArtist, LastFmAlbum } from './lastFmApi'
import type { LastFmAlbumResult, LastFmArtistResult } from './lastFmFinder'
import { TagBasedDiscovery } from './lastFm/tagBasedDiscovery.utils'
import { SimilarArtistDiscovery } from './lastFm/similarArtistDiscovery.utils'
import { AlbumScoring } from './lastFm/albumScoring.utils'
import { SpotifyIntegration } from './lastFm/spotifyIntegration.utils'

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
  private tagDiscovery: TagBasedDiscovery
  private artistDiscovery: SimilarArtistDiscovery
  private albumScoring: AlbumScoring
  private spotifyIntegration: SpotifyIntegration

  constructor(lastFmApiKey?: string, spotifyAccessToken?: string) {
    this.lastFm = new LastFm(lastFmApiKey)
    this.tagDiscovery = new TagBasedDiscovery(this.lastFm)
    this.artistDiscovery = new SimilarArtistDiscovery(this.lastFm)
    this.albumScoring = new AlbumScoring()
    this.spotifyIntegration = new SpotifyIntegration(spotifyAccessToken)
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
    this.spotifyIntegration.setSpotifyAccessToken(token)
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
      const tagAlbums = await this.tagDiscovery.findAlbumsByTags(
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
        similarArtists = await this.artistDiscovery.getSimilarArtists(lastFmData.artist.name, 20)
      }

      if (similarArtists.length > 0) {
        const artistAlbums = await this.artistDiscovery.findAlbumsBySimilarArtists(
          similarArtists,
          Math.ceil(maxResults * normalizedSimilarWeight * 2),
        )
        similarArtistAlbums.push(...artistAlbums)
      }
    }

    // Combine and score albums
    const allAlbums = [...tagBasedAlbums, ...similarArtistAlbums]
    const processedAlbums = this.albumScoring.combineAndScoreAlbums(
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
    const selectedAlbums = this.albumScoring.selectAlbumsWithRandomness(
      filteredAlbums,
      maxResults,
      diversityFactor,
    )

    // Try to find Spotify IDs for the selected albums
    const spotifyIds = await this.spotifyIntegration.findSpotifyIds(selectedAlbums)

    return {
      albums: selectedAlbums,
      totalFound: allAlbums.length,
      tagBasedCount: tagBasedAlbums.length,
      similarArtistCount: similarArtistAlbums.length,
      spotifyIdsFound: spotifyIds,
    }
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