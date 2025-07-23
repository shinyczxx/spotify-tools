/**
 * @file shuffleEngine.utils.ts
 * @description Advanced shuffle engine with Last.fm integration
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { SpotifyAlbum, SpotifyTrack, SpotifyApi } from 'spotify-api-lib'
import LastFm from 'lastfm-api-lib'
import { AdvancedShuffleConfig, ShuffleContext, AlbumScore } from 'types/albumShuffle'

/**
 * Advanced album shuffle engine with Last.fm integration
 */
export class AdvancedShuffleEngine {
  private spotifyApi: SpotifyApi
  private lastFm: LastFm

  constructor(
    spotifyToken: string,
    lastFmApiKey?: string,
  ) {
    this.spotifyApi = new SpotifyApi(spotifyToken)
    this.lastFm = new LastFm(lastFmApiKey || '')
  }

  /**
   * Perform advanced album shuffle with Last.fm integration
   */
  async shuffleAlbums(
    seedAlbums: SpotifyAlbum[],
    settings: AdvancedShuffleConfig,
    context: ShuffleContext = {},
    targetCount: number = 20,
  ): Promise<SpotifyAlbum[]> {
    console.log('🎯 Starting advanced shuffle with settings:', settings)

    let candidateAlbums = [...seedAlbums]

    // Expand album pool using Last.fm if enabled
    if (settings.useLastFmData && candidateAlbums.length > 0) {
      candidateAlbums = await this.expandAlbumPool(candidateAlbums, settings)
    }

    // Score each album
    const scoredAlbums = await this.scoreAlbums(candidateAlbums, settings, context)

    // Apply filters
    const filteredAlbums = this.applyFilters(scoredAlbums, settings)

    // Select final albums using weighted random selection
    const selectedAlbums = this.selectAlbums(filteredAlbums, targetCount, settings)

    console.log('✅ Advanced shuffle complete:', {
      seedCount: seedAlbums.length,
      candidateCount: candidateAlbums.length,
      filteredCount: filteredAlbums.length,
      selectedCount: selectedAlbums.length,
    })

    return selectedAlbums.map((scored) => scored.album)
  }

  /**
   * Expand album pool using Last.fm similar albums and tag-based discovery
   */
  private async expandAlbumPool(
    seedAlbums: SpotifyAlbum[],
    settings: AdvancedShuffleConfig,
  ): Promise<SpotifyAlbum[]> {
    const expandedAlbums = new Set<string>() // Use Set to avoid duplicates

    // Add seed albums
    seedAlbums.forEach((album) => expandedAlbums.add(album.id))

    for (const album of seedAlbums) {
      try {
        // Get Last.fm info for this album
        const artistName = album.artists[0]?.name
        if (!artistName) continue

        // TODO: Implement Last.fm album expansion
        // For now, simplified - just continue with seed albums
        // Will add proper album expansion based on tags and similar artists later
      } catch (error) {
        console.warn('Failed to expand album pool for:', album.name, error)
      }
    }

    // Convert album IDs back to SpotifyAlbum objects
    const allAlbumIds = Array.from(expandedAlbums)
    const albums: SpotifyAlbum[] = []

    // Fetch album data in batches
    for (let i = 0; i < allAlbumIds.length; i += 20) {
      const batch = allAlbumIds.slice(i, i + 20)
      try {
        const albumsData = await this.spotifyApi.albums.getByIds(batch)
        if (albumsData.albums) {
          albums.push(
            ...(albumsData.albums.filter(
              (album: SpotifyAlbum | null) => album !== null,
            ) as SpotifyAlbum[]),
          )
        }
      } catch (error) {
        console.warn('Failed to fetch album batch:', batch, error)
      }
    }

    return albums
  }

  /**
   * Score albums based on multiple factors
   */
  private async scoreAlbums(
    albums: SpotifyAlbum[],
    settings: AdvancedShuffleConfig,
    context: ShuffleContext,
  ): Promise<AlbumScore[]> {
    const scoredAlbums: AlbumScore[] = []

    for (const album of albums) {
      const score: AlbumScore = {
        album,
        score: 0,
        factors: {
          lastFmTags: 0,
          lastFmSimilarity: 0,
          releaseDate: 0,
          popularity: 0,
          diversity: 0,
          seasonal: 0,
          adaptive: 0,
        },
      }

      // Last.fm factors
      if (settings.useLastFmData) {
        const lastFmFactors = await this.calculateLastFmFactors(album, settings)
        score.factors.lastFmTags = lastFmFactors.tags
        score.factors.lastFmSimilarity = lastFmFactors.similarity
      }

      // Release date factor
      score.factors.releaseDate = this.calculateReleaseDateFactor(album, settings)

      // Popularity factor
      score.factors.popularity = this.calculatePopularityFactor(album, settings)

      // Diversity factor
      score.factors.diversity = this.calculateDiversityFactor(album, albums, settings)

      // Seasonal factor
      if (settings.seasonalAdjustment && context.currentSeason) {
        score.factors.seasonal = await this.calculateSeasonalFactor(album, context.currentSeason)
      }

      // Adaptive factor
      if (settings.adaptiveSelection && context.recentTracks) {
        score.factors.adaptive = this.calculateAdaptiveFactor(album, context.recentTracks)
      }

      // Calculate total score
      score.score = this.calculateTotalScore(score.factors, settings)

      scoredAlbums.push(score)
    }

    return scoredAlbums
  }

  /**
   * Calculate Last.fm related factors
   */
  private async calculateLastFmFactors(
    album: SpotifyAlbum,
    settings: AdvancedShuffleConfig,
  ): Promise<{ tags: number; similarity: number }> {
    try {
      const artistName = album.artists[0]?.name
      if (!artistName) return { tags: 0, similarity: 0 }

      // Simplified Last.fm scoring - get album tags
      
      // TODO: Implement Last.fm tag fetching with proper API structure
      const lastFmInfo = { tags: [] }
      if (!lastFmInfo) return { tags: 0, similarity: 0 }

      // Calculate tag score
      let tagScore = 0
      if (lastFmInfo.tags && lastFmInfo.tags.length > 0) {
        const albumTags = lastFmInfo.tags.map((t: any) => t.name.toLowerCase())

        // Check against blacklisted tags
        const hasBlacklistedTag = albumTags.some((tag: string) =>
          settings.blacklistTags.some((blacklisted) => tag.includes(blacklisted.toLowerCase())),
        )

        if (hasBlacklistedTag) {
          tagScore = -50 // Heavy penalty for blacklisted tags
        } else {
          // Bonus for required tags
          const requiredTagMatches = settings.requireTags.filter((required) =>
            albumTags.some((tag: string) => tag.includes(required.toLowerCase())),
          ).length

          tagScore = (requiredTagMatches / Math.max(1, settings.requireTags.length)) * 100
        }
      }

      // Similarity score (placeholder - would need to implement similarity logic)
      const similarityScore = 50 // Default neutral score

      return { tags: tagScore, similarity: similarityScore }
    } catch (error) {
      console.warn('Failed to calculate Last.fm factors for:', album.name, error)
      return { tags: 0, similarity: 0 }
    }
  }

  /**
   * Calculate release date factor
   */
  private calculateReleaseDateFactor(album: SpotifyAlbum, settings: AdvancedShuffleConfig): number {
    const releaseYear = new Date(album.release_date).getFullYear()
    const currentYear = new Date().getFullYear()

    // Vintage filtering
    if (settings.vintage.enabled) {
      const startYear = settings.vintage.startYear || 1900
      const endYear = settings.vintage.endYear || currentYear

      if (releaseYear < startYear || releaseYear > endYear) {
        return -100 // Exclude albums outside vintage range
      }
    }

    // Age-based scoring
    const ageInYears = currentYear - releaseYear
    const maxAge = 50 // Assume max age for scoring

    if (settings.releaseDateWeight > 50) {
      // Prefer newer releases
      return ((maxAge - ageInYears) / maxAge) * 100
    } else {
      // Prefer older releases or neutral
      return (ageInYears / maxAge) * 100
    }
  }

  /**
   * Calculate popularity factor
   */
  private calculatePopularityFactor(album: SpotifyAlbum, settings: AdvancedShuffleConfig): number {
    const popularity = (album as any).popularity || 50 // Default to medium popularity

    if (settings.preferObscure) {
      // Invert popularity score to prefer less popular albums
      return 100 - popularity
    }

    // Weight by popularity setting
    return (popularity / 100) * settings.popularityWeight
  }

  /**
   * Calculate diversity factor
   */
  private calculateDiversityFactor(
    album: SpotifyAlbum,
    allAlbums: SpotifyAlbum[],
    settings: AdvancedShuffleConfig,
  ): number {
    const artistId = album.artists[0]?.id
    if (!artistId) return 50

    // Count albums by this artist
    const albumsByArtist = allAlbums.filter((a) =>
      a.artists.some((artist) => artist.id === artistId),
    ).length

    if (albumsByArtist > settings.maxAlbumsPerArtist) {
      return -50 // Penalty for too many albums by same artist
    }

    // Higher diversity score for less represented artists
    return Math.max(0, 100 - albumsByArtist * 20)
  }

  /**
   * Calculate seasonal factor (placeholder implementation)
   */
  private async calculateSeasonalFactor(_album: SpotifyAlbum, _season: string): Promise<number> {
    // This would analyze album tags/genres for seasonal appropriateness
    // For now, return neutral score
    return 50
  }

  /**
   * Calculate adaptive factor based on listening history
   */
  private calculateAdaptiveFactor(_album: SpotifyAlbum, _recentTracks: SpotifyTrack[]): number {
    // Analyze if this album's style matches recent listening patterns
    // For now, return neutral score
    return 50
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(
    factors: AlbumScore['factors'],
    settings: AdvancedShuffleConfig,
  ): number {
    let totalScore = 0
    let totalWeight = 0

    if (settings.useLastFmData) {
      totalScore += factors.lastFmTags * (settings.lastFmTagsWeight / 100)
      totalScore += factors.lastFmSimilarity * (settings.lastFmSimilarAlbumsWeight / 100)
      totalWeight += (settings.lastFmTagsWeight + settings.lastFmSimilarAlbumsWeight) / 100
    }

    totalScore += factors.releaseDate * (settings.releaseDateWeight / 100)
    totalScore += factors.popularity * (settings.popularityWeight / 100)
    totalScore += factors.diversity * (settings.artistDiversification / 100)
    totalWeight +=
      (settings.releaseDateWeight + settings.popularityWeight + settings.artistDiversification) /
      100

    if (settings.seasonalAdjustment) {
      totalScore += factors.seasonal * 0.2
      totalWeight += 0.2
    }

    if (settings.adaptiveSelection) {
      totalScore += factors.adaptive * 0.3
      totalWeight += 0.3
    }

    return totalWeight > 0 ? totalScore / totalWeight : 50
  }

  /**
   * Apply filters to scored albums
   */
  private applyFilters(scoredAlbums: AlbumScore[], settings: AdvancedShuffleConfig): AlbumScore[] {
    return scoredAlbums.filter((scoredAlbum) => {
      const album = scoredAlbum.album

      // Album type filter
      const albumTypeWeight = (settings.albumTypeWeights as any)[album.album_type] || 0
      if (albumTypeWeight === 0) return false

      // Score threshold (remove very low scoring albums)
      if (scoredAlbum.score < -25) return false

      return true
    })
  }

  /**
   * Select final albums using weighted random selection
   */
  private selectAlbums(
    scoredAlbums: AlbumScore[],
    targetCount: number,
    settings: AdvancedShuffleConfig,
  ): AlbumScore[] {
    if (scoredAlbums.length <= targetCount) {
      return scoredAlbums
    }

    // Sort by score descending
    const sortedAlbums = [...scoredAlbums].sort((a, b) => b.score - a.score)

    // Apply artist diversification
    const selectedAlbums: AlbumScore[] = []
    const artistCounts = new Map<string, number>()

    for (const scoredAlbum of sortedAlbums) {
      if (selectedAlbums.length >= targetCount) break

      const artistId = scoredAlbum.album.artists[0]?.id
      const currentCount = artistCounts.get(artistId || '') || 0

      if (currentCount < settings.maxAlbumsPerArtist) {
        selectedAlbums.push(scoredAlbum)
        artistCounts.set(artistId || '', currentCount + 1)
      }
    }

    return selectedAlbums
  }
}