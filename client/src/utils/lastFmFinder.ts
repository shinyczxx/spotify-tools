/**
 * @file lastFmFinder.ts
 * @description Utility for matching Spotify data with Last.fm data and extracting genre information
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @description
 * This utility takes Spotify album, artist, or track data and uses it to fetch
 * corresponding Last.fm information. It attempts to find the best genre match
 * from the available tag data.
 *
 * @usage
 * ```javascript
 * const finder = new LastFmFinder(lastFmApiKey);
 * const result = await finder.findAlbumInfo(spotifyAlbum);
 * console.log(result.primaryGenre);
 * ```
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with album, artist, and track finding capabilities
 */

import { LastFm, LastFmTag, LastFmArtist, LastFmAlbum, LastFmTrack } from './lastFmApi'
import type { SpotifyAlbum, SpotifyArtist, SpotifyTrack } from './spotifyApi'

export interface LastFmMatchResult {
  found: boolean
  primaryGenre: string | null
  secondaryGenres: string[]
  tags: LastFmTag[]
  confidence: number // 0-1 scale
  lastFmData?: any
}

export interface LastFmAlbumResult extends LastFmMatchResult {
  album?: LastFmAlbum
  albumTags?: LastFmTag[]
  artistTags?: LastFmTag[]
}

export interface LastFmArtistResult extends LastFmMatchResult {
  artist?: LastFmArtist
  similarArtists?: LastFmArtist[]
  topAlbums?: LastFmAlbum[]
}

export interface LastFmTrackResult extends LastFmMatchResult {
  track?: LastFmTrack
  trackTags?: LastFmTag[]
  artistTags?: LastFmTag[]
}

/**
 * Genre classification map for common Last.fm tags
 */
const GENRE_CLASSIFICATION = {
  // Primary genres (high priority)
  primary: [
    'rock',
    'pop',
    'jazz',
    'blues',
    'country',
    'folk',
    'classical',
    'electronic',
    'dance',
    'house',
    'techno',
    'trance',
    'dubstep',
    'ambient',
    'experimental',
    'hip hop',
    'rap',
    'rnb',
    'soul',
    'funk',
    'reggae',
    'punk',
    'metal',
    'alternative',
    'indie',
    'grunge',
    'garage',
    'post-rock',
    'shoegaze',
  ],
  // Secondary genres (medium priority)
  secondary: [
    'alternative rock',
    'indie rock',
    'hard rock',
    'progressive rock',
    'art rock',
    'psychedelic',
    'synthpop',
    'electropop',
    'dream pop',
    'britpop',
    'new wave',
    'post-punk',
    'gothic',
    'darkwave',
    'industrial',
    'minimal',
    'downtempo',
    'chillout',
    'lounge',
    'trip hop',
    'drum and bass',
    'jungle',
    'breakbeat',
    'garage rock',
    'noise rock',
    'math rock',
    'emo',
    'hardcore',
    'metalcore',
    'black metal',
    'death metal',
    'thrash metal',
    'doom metal',
    'progressive metal',
  ],
  // Style/mood descriptors (lower priority)
  descriptive: [
    'melancholic',
    'atmospheric',
    'melodic',
    'rhythmic',
    'energetic',
    'mellow',
    'upbeat',
    'dark',
    'beautiful',
    'catchy',
    'emotional',
    'intense',
    'relaxing',
    'danceable',
    'groovy',
    'haunting',
    'dreamy',
    'aggressive',
    'peaceful',
    'epic',
  ],
  // Time period/geographical tags
  contextual: [
    '90s',
    '80s',
    '70s',
    '60s',
    '2000s',
    '2010s',
    'british',
    'american',
    'german',
    'french',
    'swedish',
    'icelandic',
    'canadian',
    'australian',
    'japanese',
  ],
}

/**
 * Last.fm finder utility class
 */
export class LastFmFinder {
  private lastFm: LastFm

  constructor(apiKey?: string) {
    this.lastFm = new LastFm(apiKey)
  }

  /**
   * Set Last.fm API key
   */
  setApiKey(apiKey: string): void {
    this.lastFm.setApiKey(apiKey)
  }

  /**
   * Find Last.fm info for a Spotify album
   */
  async findAlbumInfo(album: SpotifyAlbum): Promise<LastFmAlbumResult> {
    try {
      const artistName = this.extractPrimaryArtistName(album.artists)
      const albumName = this.cleanTitle(album.name)

      // Get album tags
      const albumTags = await this.lastFm.album.getTopTags(artistName, albumName, {
        autocorrect: true,
      })

      // Get artist tags for additional context
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get album info
      let albumInfo: any = null
      try {
        albumInfo = await this.lastFm.album.getInfo(artistName, albumName, {
          autocorrect: true,
        })
      } catch (error) {
        console.warn('Could not fetch album info from Last.fm:', error)
      }

      // Combine all tags for genre analysis
      const allTags = [...albumTags, ...artistTags]
      const genreInfo = this.extractGenreFromTags(allTags)

      const confidence = this.calculateConfidence(albumTags, artistTags, albumInfo)

      return {
        found: albumTags.length > 0 || artistTags.length > 0,
        primaryGenre: genreInfo.primary,
        secondaryGenres: genreInfo.secondary,
        tags: allTags,
        confidence,
        lastFmData: albumInfo,
        album: albumInfo,
        albumTags,
        artistTags,
      }
    } catch (error) {
      console.error('Error finding album info:', error)
      return {
        found: false,
        primaryGenre: null,
        secondaryGenres: [],
        tags: [],
        confidence: 0,
      }
    }
  }

  /**
   * Find Last.fm info for a Spotify artist
   */
  async findArtistInfo(artist: SpotifyArtist): Promise<LastFmArtistResult> {
    try {
      const artistName = this.cleanTitle(artist.name)

      // Get artist tags
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get similar artists
      let similarArtists: LastFmArtist[] = []
      try {
        similarArtists = await this.lastFm.artist.getSimilar(artistName, {
          limit: 20,
          autocorrect: true,
        })
      } catch (error) {
        console.warn('Could not fetch similar artists:', error)
      }

      // Get top albums
      let topAlbums: LastFmAlbum[] = []
      try {
        topAlbums = await this.lastFm.artist.getTopAlbums(artistName, {
          limit: 10,
          autocorrect: true,
        })
      } catch (error) {
        console.warn('Could not fetch top albums:', error)
      }

      // Get artist info
      let artistInfo: any = null
      try {
        artistInfo = await this.lastFm.artist.getInfo(artistName, {
          autocorrect: true,
        })
      } catch (error) {
        console.warn('Could not fetch artist info:', error)
      }

      const genreInfo = this.extractGenreFromTags(artistTags)
      const confidence = this.calculateConfidence(artistTags, [], artistInfo)

      return {
        found: artistTags.length > 0,
        primaryGenre: genreInfo.primary,
        secondaryGenres: genreInfo.secondary,
        tags: artistTags,
        confidence,
        lastFmData: artistInfo,
        artist: artistInfo,
        similarArtists,
        topAlbums,
      }
    } catch (error) {
      console.error('Error finding artist info:', error)
      return {
        found: false,
        primaryGenre: null,
        secondaryGenres: [],
        tags: [],
        confidence: 0,
      }
    }
  }

  /**
   * Find Last.fm info for a Spotify track
   */
  async findTrackInfo(track: SpotifyTrack): Promise<LastFmTrackResult> {
    try {
      const artistName = this.extractPrimaryArtistName(track.artists)
      const trackName = this.cleanTitle(track.name)

      // Get track tags
      const trackTags = await this.lastFm.track.getTopTags(artistName, trackName, {
        autocorrect: true,
      })

      // Get artist tags for additional context
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get track info
      let trackInfo: any = null
      try {
        trackInfo = await this.lastFm.track.getInfo(artistName, trackName, {
          autocorrect: true,
        })
      } catch (error) {
        console.warn('Could not fetch track info:', error)
      }

      // Combine all tags for genre analysis
      const allTags = [...trackTags, ...artistTags]
      const genreInfo = this.extractGenreFromTags(allTags)

      const confidence = this.calculateConfidence(trackTags, artistTags, trackInfo)

      return {
        found: trackTags.length > 0 || artistTags.length > 0,
        primaryGenre: genreInfo.primary,
        secondaryGenres: genreInfo.secondary,
        tags: allTags,
        confidence,
        lastFmData: trackInfo,
        track: trackInfo,
        trackTags,
        artistTags,
      }
    } catch (error) {
      console.error('Error finding track info:', error)
      return {
        found: false,
        primaryGenre: null,
        secondaryGenres: [],
        tags: [],
        confidence: 0,
      }
    }
  }

  /**
   * Extract primary artist name from Spotify artists array
   */
  private extractPrimaryArtistName(artists: SpotifyArtist[]): string {
    if (!artists || artists.length === 0) {
      throw new Error('No artists provided')
    }
    return artists[0].name
  }

  /**
   * Clean title for better Last.fm matching
   */
  private cleanTitle(title: string): string {
    // Remove common variations that might not match on Last.fm
    return title
      .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
      .replace(/\s*\[.*?\]\s*/g, '') // Remove brackets content
      .replace(/\s*-\s*(Remaster|Deluxe|Expanded|Edition).*$/i, '') // Remove remaster/edition info
      .replace(/\s*\((19|20)\d{2}.*?\)/g, '') // Remove year info
      .trim()
  }

  /**
   * Extract genre information from Last.fm tags
   */
  private extractGenreFromTags(tags: LastFmTag[]): {
    primary: string | null
    secondary: string[]
  } {
    if (!tags || tags.length === 0) {
      return { primary: null, secondary: [] }
    }

    // Sort tags by count (popularity)
    const sortedTags = [...tags].sort((a, b) => b.count - a.count)

    // Find primary genre
    let primaryGenre: string | null = null
    const secondaryGenres: string[] = []

    // Look for primary genres first
    for (const tag of sortedTags) {
      const tagName = tag.name.toLowerCase()

      if (GENRE_CLASSIFICATION.primary.includes(tagName) && !primaryGenre) {
        primaryGenre = tag.name
        continue
      }

      if (GENRE_CLASSIFICATION.secondary.includes(tagName) && secondaryGenres.length < 3) {
        secondaryGenres.push(tag.name)
      }
    }

    // If no primary genre found, use the most popular secondary genre as primary
    if (!primaryGenre && secondaryGenres.length > 0) {
      primaryGenre = secondaryGenres.shift() || null
    }

    // If still no primary genre, use the most popular descriptive tag
    if (!primaryGenre) {
      for (const tag of sortedTags) {
        const tagName = tag.name.toLowerCase()
        if (GENRE_CLASSIFICATION.descriptive.includes(tagName)) {
          primaryGenre = tag.name
          break
        }
      }
    }

    // If still no genre, use the most popular tag
    if (!primaryGenre && sortedTags.length > 0) {
      primaryGenre = sortedTags[0].name
    }

    return {
      primary: primaryGenre,
      secondary: secondaryGenres,
    }
  }

  /**
   * Calculate confidence score based on available data
   */
  private calculateConfidence(
    primaryTags: LastFmTag[],
    secondaryTags: LastFmTag[],
    info: any,
  ): number {
    let confidence = 0

    // Base confidence from having tags
    if (primaryTags.length > 0) confidence += 0.4
    if (secondaryTags.length > 0) confidence += 0.2

    // Bonus for having detailed info
    if (info) confidence += 0.2

    // Bonus for having high-count tags
    const totalTags = [...primaryTags, ...secondaryTags]
    const highCountTags = totalTags.filter((tag) => tag.count > 10)
    if (highCountTags.length > 0) confidence += 0.1

    // Bonus for having many tags
    if (totalTags.length > 5) confidence += 0.1

    return Math.min(confidence, 1.0)
  }

  /**
   * Search for albums by combining artist and album name
   */
  async searchAlbum(artistName: string, albumName: string): Promise<LastFmAlbum[]> {
    try {
      const searchQuery = `${albumName} ${artistName}`
      const results = await this.lastFm.album.search(searchQuery, { limit: 10 })
      return results
    } catch (error) {
      console.error('Error searching for album:', error)
      return []
    }
  }

  /**
   * Search for artists by name
   */
  async searchArtist(artistName: string): Promise<LastFmArtist[]> {
    try {
      const results = await this.lastFm.artist.search(artistName, { limit: 10 })
      return results
    } catch (error) {
      console.error('Error searching for artist:', error)
      return []
    }
  }

  /**
   * Get genre suggestions based on tags
   */
  getGenreSuggestions(tags: LastFmTag[]): string[] {
    const allGenres = [...GENRE_CLASSIFICATION.primary, ...GENRE_CLASSIFICATION.secondary]

    return tags
      .filter((tag) => allGenres.includes(tag.name.toLowerCase()))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((tag) => tag.name)
  }
}

export default LastFmFinder
