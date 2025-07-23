/**
 * @file shuffleSettings.utils.ts
 * @description Settings management for advanced shuffle functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { SpotifyAlbum } from 'spotify-api-lib'
import { AdvancedShuffleEngine } from './shuffleEngine.utils'
import { AdvancedShuffleConfig, ShuffleContext } from 'types/albumShuffle'

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
  ) {
    this.settings = { ...defaultAdvancedSettings }
    this.engine = new AdvancedShuffleEngine(spotifyToken, lastFmApiKey)
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