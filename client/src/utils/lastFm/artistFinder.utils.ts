/**
 * @file artistFinder.utils.ts
 * @description Utilities for finding Last.fm artist information
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFm } from '../lastFmApi'
import type { SpotifyArtist } from '../spotifyApi'
import type { LastFmArtistResult } from '../lastFmFinder'
import { DataMatching } from './dataMatching.utils'
import { GenreClassification } from './genreClassification.utils'

/**
 * Artist finding utilities for Last.fm integration
 */
export class ArtistFinder {
  private lastFm: LastFm
  private dataMatching: DataMatching
  private genreClassification: GenreClassification

  constructor(lastFm: LastFm) {
    this.lastFm = lastFm
    this.dataMatching = new DataMatching()
    this.genreClassification = new GenreClassification()
  }

  /**
   * Find Last.fm info for a Spotify artist
   */
  async findArtistInfo(artist: SpotifyArtist): Promise<LastFmArtistResult> {
    try {
      const artistName = artist.name

      // Get artist tags
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get artist info
      let artistInfo
      try {
        artistInfo = await this.lastFm.artist.getInfo(artistName, {
          autocorrect: true,
        })
      } catch (error) {
        console.warn(`Could not get artist info for "${artistName}"`)
      }

      // Get similar artists
      let similarArtists
      try {
        similarArtists = await this.lastFm.artist.getSimilar(artistName, {
          limit: 20,
          autocorrect: true,
        })
      } catch (error) {
        console.warn(`Could not get similar artists for "${artistName}"`)
        similarArtists = []
      }

      // Get top albums
      let topAlbums
      try {
        topAlbums = await this.lastFm.artist.getTopAlbums(artistName, {
          limit: 10,
          autocorrect: true,
        })
      } catch (error) {
        console.warn(`Could not get top albums for "${artistName}"`)
        topAlbums = []
      }

      // Extract genre information
      const genreInfo = this.genreClassification.extractGenreFromTags(artistTags)
      const confidence = this.genreClassification.calculateConfidence(artistTags)

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
}