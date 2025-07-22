/**
 * @file lastFmFinder.ts
 * @description Utility for matching Spotify data with Last.fm data using modular finders
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
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
 * - 2.0.0: Modularized with domain-specific finder utilities
 * - 1.0.0: Initial implementation with album, artist, and track finding capabilities
 */

import { LastFm, LastFmTag, LastFmArtist, LastFmAlbum, LastFmTrack } from './lastFmApi'
import type { SpotifyAlbum, SpotifyArtist, SpotifyTrack } from './spotifyApi'
import { AlbumFinder } from './lastFm/albumFinder.utils'
import { ArtistFinder } from './lastFm/artistFinder.utils'
import { TrackFinder } from './lastFm/trackFinder.utils'
import { DataMatching } from './lastFm/dataMatching.utils'
import { GenreClassification } from './lastFm/genreClassification.utils'

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
 * Last.fm finder utility class
 */
export class LastFmFinder {
  private lastFm: LastFm
  private albumFinder: AlbumFinder
  private artistFinder: ArtistFinder
  private trackFinder: TrackFinder
  private dataMatching: DataMatching
  private genreClassification: GenreClassification

  constructor(apiKey?: string) {
    this.lastFm = new LastFm(apiKey)
    this.albumFinder = new AlbumFinder(this.lastFm)
    this.artistFinder = new ArtistFinder(this.lastFm)
    this.trackFinder = new TrackFinder(this.lastFm)
    this.dataMatching = new DataMatching()
    this.genreClassification = new GenreClassification()
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
    return this.albumFinder.findAlbumInfo(album)
  }

  /**
   * Find Last.fm info for a Spotify artist
   */
  async findArtistInfo(artist: SpotifyArtist): Promise<LastFmArtistResult> {
    return this.artistFinder.findArtistInfo(artist)
  }

  /**
   * Find Last.fm info for a Spotify track
   */
  async findTrackInfo(track: SpotifyTrack): Promise<LastFmTrackResult> {
    return this.trackFinder.findTrackInfo(track)
  }

  /**
   * Extract primary artist name from Spotify artists array
   * @deprecated Use DataMatching utility directly
   */
  extractPrimaryArtistName(artists: SpotifyArtist[]): string {
    return this.dataMatching.extractPrimaryArtistName(artists)
  }

  /**
   * Clean title for better Last.fm matching
   * @deprecated Use DataMatching utility directly
   */
  cleanTitle(title: string): string {
    return this.dataMatching.cleanTitle(title)
  }

  /**
   * Extract genre information from Last.fm tags
   * @deprecated Use GenreClassification utility directly
   */
  extractGenreFromTags(tags: LastFmTag[]): {
    primary: string | null
    secondary: string[]
  } {
    return this.genreClassification.extractGenreFromTags(tags)
  }

  /**
   * Calculate confidence score based on tag quality and count
   * @deprecated Use GenreClassification utility directly
   */
  calculateConfidence(tags: LastFmTag[]): number {
    return this.genreClassification.calculateConfidence(tags)
  }
}

export default LastFmFinder