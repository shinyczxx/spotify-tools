/**
 * @file trackFinder.utils.ts
 * @description Utilities for finding Last.fm track information
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFm } from '../lastFmApi'
import type { SpotifyTrack } from '../spotifyApi'
import type { LastFmTrackResult } from '../lastFmFinder'
import { DataMatching } from './dataMatching.utils'
import { GenreClassification } from './genreClassification.utils'

/**
 * Track finding utilities for Last.fm integration
 */
export class TrackFinder {
  private lastFm: LastFm
  private dataMatching: DataMatching
  private genreClassification: GenreClassification

  constructor(lastFm: LastFm) {
    this.lastFm = lastFm
    this.dataMatching = new DataMatching()
    this.genreClassification = new GenreClassification()
  }

  /**
   * Find Last.fm info for a Spotify track
   */
  async findTrackInfo(track: SpotifyTrack): Promise<LastFmTrackResult> {
    try {
      const artistName = this.dataMatching.extractPrimaryArtistName(track.artists)
      const trackName = this.dataMatching.cleanTitle(track.name)

      // Get track tags
      const trackTags = await this.lastFm.track.getTopTags(artistName, trackName, {
        autocorrect: true,
      })

      // Get artist tags as fallback
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get track info
      let trackInfo
      try {
        trackInfo = await this.lastFm.track.getInfo(artistName, trackName, {
          autocorrect: true,
        })
      } catch (error) {
        console.warn(`Could not get track info for "${trackName}" by ${artistName}`)
      }

      // Combine tags (track tags have priority)
      const allTags = [...trackTags, ...artistTags.filter(
        artistTag => !trackTags.some(trackTag => 
          trackTag.name.toLowerCase() === artistTag.name.toLowerCase()
        )
      )]

      // Extract genre information
      const genreInfo = this.genreClassification.extractGenreFromTags(allTags)
      const confidence = this.genreClassification.calculateConfidence(allTags)

      return {
        found: allTags.length > 0,
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
}