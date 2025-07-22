/**
 * @file spotifyIntegration.utils.ts
 * @description Utilities for finding Spotify IDs for Last.fm albums
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { SpotifyApi } from '../spotifyApi'
import type { RelatedAlbumResult } from '../lastFmRelated'

/**
 * Utilities for Spotify integration with Last.fm data
 */
export class SpotifyIntegration {
  private spotify?: SpotifyApi

  constructor(spotifyAccessToken?: string) {
    if (spotifyAccessToken) {
      this.spotify = new SpotifyApi(spotifyAccessToken)
    }
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
   * Find Spotify IDs for the selected albums
   */
  async findSpotifyIds(albums: RelatedAlbumResult[]): Promise<string[]> {
    if (!this.spotify) return []

    const spotifyIds: string[] = []
    const maxSearchAttempts = Math.min(albums.length, 10) // Limit API calls

    for (let i = 0; i < maxSearchAttempts; i++) {
      const album = albums[i]
      
      try {
        const artistName = typeof album.album.artist === 'string' 
          ? album.album.artist 
          : album.album.artist.name
        
        const searchQuery = `album:"${album.album.name}" artist:"${artistName}"`
        const searchResults = await this.spotify.search(searchQuery, ['album'], { limit: 1 })
        
        if (searchResults.albums?.items && searchResults.albums.items.length > 0) {
          const spotifyId = searchResults.albums.items[0].id
          if (spotifyId) {
            spotifyIds.push(spotifyId)
            // Add Spotify ID to album result
            album.spotifyId = spotifyId
          }
        }
      } catch (error) {
        console.warn(`Could not find Spotify ID for album "${album.album.name}":`, error)
      }
      
      // Small delay to avoid rate limiting
      if (i < maxSearchAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return spotifyIds
  }
}