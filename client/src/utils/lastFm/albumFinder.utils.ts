/**
 * @file albumFinder.utils.ts
 * @description Utilities for finding Last.fm album information
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFm } from '../lastFmApi'
import type { SpotifyAlbum } from '../spotifyApi'
import type { LastFmAlbumResult } from '../lastFmFinder'
import { DataMatching } from './dataMatching.utils'
import { GenreClassification } from './genreClassification.utils'

/**
 * Album finding utilities for Last.fm integration
 */
export class AlbumFinder {
  private lastFm: LastFm
  private dataMatching: DataMatching
  private genreClassification: GenreClassification

  constructor(lastFm: LastFm) {
    this.lastFm = lastFm
    this.dataMatching = new DataMatching()
    this.genreClassification = new GenreClassification()
  }

  /**
   * Find Last.fm info for a Spotify album
   */
  async findAlbumInfo(album: SpotifyAlbum): Promise<LastFmAlbumResult> {
    try {
      const artistName = this.dataMatching.extractPrimaryArtistName(album.artists)
      const albumName = this.dataMatching.cleanTitle(album.name)

      // Get album tags
      const albumTags = await this.lastFm.album.getTopTags(artistName, albumName, {
        autocorrect: true,
      })

      // Get artist tags as fallback
      const artistTags = await this.lastFm.artist.getTopTags(artistName, {
        autocorrect: true,
      })

      // Get album info
      let albumInfo
      try {
        albumInfo = await this.lastFm.album.getInfo(artistName, albumName, {
          autocorrect: true,
        })
      } catch (error) {
        // Album info might not be available, continue with tags
        console.warn(`Could not get album info for "${albumName}" by ${artistName}`)
      }

      // Combine tags (album tags have priority)
      const allTags = [...albumTags, ...artistTags.filter(
        artistTag => !albumTags.some(albumTag => 
          albumTag.name.toLowerCase() === artistTag.name.toLowerCase()
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
}