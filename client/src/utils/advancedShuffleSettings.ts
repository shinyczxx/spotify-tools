/**
 * @file advancedShuffleSettings.ts
 * @description Advanced shuffle settings interface and algorithms that integrate Last.fm data
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with Last.fm integration
 */

import { SpotifyApi, SpotifyAlbum, SpotifyTrack } from './spotifyApi'
import { LastFm } from './lastFmApi'
import { LastFmFinder } from './lastFmFinder'
import { LastFmRelated } from './lastFmRelated'

export interface AdvancedShuffleConfig {
  // Last.fm settings
  useLastFmData: boolean
  lastFmTagsWeight: number // 0-100
  lastFmSimilarAlbumsWeight: number // 0-100

  // Tag filtering
  blacklistTags: string[]
  requireTags: string[]

  // Album filtering
  albumTypeWeights: {
    album: number
    single: number
    compilation: number
  }

  // Release date preferences
  releaseDateWeight: number // 0-100, higher = prefer newer releases
  vintage: {
    enabled: boolean
    startYear?: number
    endYear?: number
  }

  // Popularity settings
  popularityWeight: number // 0-100
  preferObscure: boolean // Prefer less popular albums

  // Diversity settings
  artistDiversification: number // 0-100, higher = more diverse artists
  maxAlbumsPerArtist: number

  // Smart selection
  adaptiveSelection: boolean // Use listening history to improve recommendations
  seasonalAdjustment: boolean // Adjust for seasonal preferences
}

export interface ShuffleContext {
  userProfile?: any
  recentTracks?: SpotifyTrack[]
  topArtists?: any[]
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter'
}

export interface AlbumScore {
  album: SpotifyAlbum
  score: number
  factors: {
    lastFmTags: number
    lastFmSimilarity: number
    releaseDate: number
    popularity: number
    diversity: number
    seasonal: number
    adaptive: number
  }
}

/**
 * Advanced album shuffle engine with Last.fm integration
 */
export class AdvancedShuffleEngine {
  private spotifyApi: SpotifyApi
  private lastFmApi: LastFm
  private lastFmFinder: LastFmFinder
  private lastFmRelated: LastFmRelated

  constructor(
    spotifyToken: string,
    lastFmApiKey?: string,
    lastFmSecret?: string,
    lastFmSession?: string,
  ) {
    this.spotifyApi = new SpotifyApi(spotifyToken)
    this.lastFmApi = new LastFm(lastFmApiKey, lastFmSecret)
    this.lastFmFinder = new LastFmFinder(lastFmApiKey)
    this.lastFmRelated = new LastFmRelated(lastFmApiKey)

    if (lastFmSession) {
      this.lastFmApi.setSessionKey(lastFmSession)
    }

    if (spotifyToken) {
      this.lastFmRelated.setSpotifyAccessToken(spotifyToken)
    }
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

        const lastFmInfo = await this.lastFmFinder.findAlbumInfo(album)
        if (!lastFmInfo) continue

        // Get related albums using Last.fm data
        const relatedAlbumsResponse = await this.lastFmRelated.findRelatedAlbums(lastFmInfo, {
          tagWeight: settings.lastFmTagsWeight,
          similarArtistWeight: settings.lastFmSimilarAlbumsWeight,
          maxResults: Math.min(10, Math.floor(50 / seedAlbums.length)), // Limit per seed album
        })

        // Add related albums to pool
        if (relatedAlbumsResponse.albums) {
          relatedAlbumsResponse.albums.forEach((relatedAlbum: any) => {
            if (relatedAlbum.spotifyId) {
              expandedAlbums.add(relatedAlbum.spotifyId)
            }
          })
        }
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
        const albumsData = await this.spotifyApi.album.getByIds(batch)
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

      const lastFmInfo = await this.lastFmFinder.findAlbumInfo(album)
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
      const albumTypeWeight = settings.albumTypeWeights[album.album_type] || 0
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

/**
 * Default advanced shuffle settings
 */
export const defaultAdvancedSettings: AdvancedShuffleConfig = {
  useLastFmData: true,
  lastFmTagsWeight: 30,
  lastFmSimilarAlbumsWeight: 40,
  blacklistTags: [],
  requireTags: [],
  albumTypeWeights: {
    album: 100,
    single: 20,
    compilation: 50,
  },
  releaseDateWeight: 50,
  vintage: {
    enabled: false,
  },
  popularityWeight: 30,
  preferObscure: false,
  artistDiversification: 70,
  maxAlbumsPerArtist: 2,
  adaptiveSelection: true,
  seasonalAdjustment: false,
}

/**
 * Settings management class for advanced shuffle functionality
 */
export class AdvancedShuffleSettings {
  private settings: AdvancedShuffleConfig
  private engine: AdvancedShuffleEngine

  constructor(
    spotifyToken: string,
    lastFmApiKey?: string,
    lastFmSecret?: string,
    lastFmSession?: string,
  ) {
    this.settings = { ...defaultAdvancedSettings }
    this.engine = new AdvancedShuffleEngine(spotifyToken, lastFmApiKey, lastFmSecret, lastFmSession)
  }

  /**
   * Get current settings
   */
  getSettings(): AdvancedShuffleConfig {
    return { ...this.settings }
  }

  /**
   * Update a specific setting with validation
   */
  updateSetting<K extends keyof AdvancedShuffleConfig>(
    key: K,
    value: AdvancedShuffleConfig[K],
  ): void {
    // Validation rules
    if (
      key === 'lastFmTagsWeight' ||
      key === 'lastFmSimilarAlbumsWeight' ||
      key === 'releaseDateWeight' ||
      key === 'popularityWeight' ||
      key === 'artistDiversification'
    ) {
      const numValue = value as number
      if (numValue < 0 || numValue > 100) {
        throw new Error('Weight must be between 0 and 100')
      }
    }

    if (key === 'vintage' && typeof value === 'object' && value !== null) {
      const vintage = value as AdvancedShuffleConfig['vintage']
      if (
        vintage.enabled &&
        vintage.startYear &&
        vintage.endYear &&
        vintage.startYear > vintage.endYear
      ) {
        throw new Error('Minimum year cannot be greater than maximum year')
      }
    }

    this.settings[key] = value
  }

  /**
   * Shuffle albums using current settings
   */
  async shuffleAlbums(
    albums: SpotifyAlbum[],
    targetCount: number,
    context: ShuffleContext = {},
  ): Promise<SpotifyAlbum[]> {
    if (!this.settings.useLastFmData) {
      // Simple shuffle without Last.fm
      return this.simpleShuffleWithFilters(albums, targetCount)
    }

    return this.engine.shuffleAlbums(albums, this.settings, context, targetCount)
  }

  /**
   * Find related albums for a source album
   */
  async findRelatedAlbums(
    sourceAlbum: SpotifyAlbum,
    maxResults: number = 10,
  ): Promise<SpotifyAlbum[]> {
    if (!this.settings.useLastFmData) {
      return []
    }

    // This would use the engine to find related albums
    // For now, return empty array as placeholder
    return []
  }

  /**
   * Simple shuffle with basic filters (when Last.fm is disabled)
   */
  private simpleShuffleWithFilters(albums: SpotifyAlbum[], targetCount: number): SpotifyAlbum[] {
    let filteredAlbums = [...albums]

    // Apply year filters if vintage is enabled
    if (this.settings.vintage.enabled) {
      const startYear = this.settings.vintage.startYear || 1900
      const endYear = this.settings.vintage.endYear || new Date().getFullYear()

      filteredAlbums = filteredAlbums.filter((album) => {
        const year = new Date(album.release_date).getFullYear()
        return year >= startYear && year <= endYear
      })
    }

    // Apply popularity filters
    if ('minPopularity' in this.settings || 'maxPopularity' in this.settings) {
      filteredAlbums = filteredAlbums.filter((album) => {
        const popularity = (album as any).popularity
        if (popularity === undefined) return true // Include albums without popularity scores

        const minPop = (this.settings as any).minPopularity || 0
        const maxPop = (this.settings as any).maxPopularity || 100
        return popularity >= minPop && popularity <= maxPop
      })
    }

    // Apply artist diversity limit
    const artistCounts = new Map<string, number>()
    const diverseAlbums: SpotifyAlbum[] = []

    // Shuffle first, then apply artist limits
    const shuffled = [...filteredAlbums].sort(() => Math.random() - 0.5)

    for (const album of shuffled) {
      if (diverseAlbums.length >= targetCount) break

      const artistId = album.artists[0]?.id || 'unknown'
      const currentCount = artistCounts.get(artistId) || 0

      if (currentCount < this.settings.maxAlbumsPerArtist) {
        diverseAlbums.push(album)
        artistCounts.set(artistId, currentCount + 1)
      }
    }

    return diverseAlbums.slice(0, targetCount)
  }

  /**
   * Get a summary of current settings for UI display
   */
  getSettingsSummary(): string {
    const parts: string[] = []

    parts.push(`Last.fm integration: ${this.settings.useLastFmData ? 'Enabled' : 'Disabled'}`)

    if (this.settings.useLastFmData) {
      parts.push(`Tag weight: ${this.settings.lastFmTagsWeight}%`)
      parts.push(`Similar artist weight: ${this.settings.lastFmSimilarAlbumsWeight}%`)

      if (this.settings.blacklistTags.length > 0) {
        parts.push(`Blacklisted tags: ${this.settings.blacklistTags.join(', ')}`)
      }
    }

    if (this.settings.vintage.enabled) {
      const start = this.settings.vintage.startYear || 'earliest'
      const end = this.settings.vintage.endYear || 'latest'
      parts.push(`Year range: ${start}-${end}`)
    }

    parts.push(`Max albums per artist: ${this.settings.maxAlbumsPerArtist}`)

    return parts.join('\n')
  }
}
