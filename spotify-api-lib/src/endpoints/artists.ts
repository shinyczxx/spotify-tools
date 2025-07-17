/**
 * @file artists.ts
 * @description Artist-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifyArtist, SpotifyAlbum, SpotifyTrack, SpotifyPagingObject } from '../types'

export class ArtistEndpoints extends BaseEndpoint {
  /**
   * Get artist by ID
   */
  async getById(artistId: string): Promise<SpotifyArtist> {
    try {
      const response = await this.makeRequest<SpotifyArtist>(`/artists/${artistId}`)
      return response
    } catch (error) {
      console.error('Error fetching artist:', error)
      throw new Error('Failed to fetch artist')
    }
  }

  /**
   * Get multiple artists by IDs
   */
  async getByIds(artistIds: string[]): Promise<{ artists: SpotifyArtist[] }> {
    try {
      const params = {
        ids: artistIds.join(','),
      }

      const response = await this.makeRequest<{ artists: SpotifyArtist[] }>('/artists', { params })
      return response
    } catch (error) {
      console.error('Error fetching artists:', error)
      throw new Error('Failed to fetch artists')
    }
  }

  /**
   * Get artist's albums
   */
  async getAlbums(
    artistId: string,
    options?: {
      include_groups?: string[]
      market?: string
      limit?: number
      offset?: number
    },
  ): Promise<SpotifyPagingObject<SpotifyAlbum>> {
    try {
      const params = {
        include_groups: options?.include_groups?.join(',') || 'album',
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        ...(options?.market && { market: options.market }),
      }

      const response = await this.makeRequest<SpotifyPagingObject<SpotifyAlbum>>(`/artists/${artistId}/albums`, { params })
      return response
    } catch (error) {
      console.error('Error fetching artist albums:', error)
      throw new Error('Failed to fetch artist albums')
    }
  }

  /**
   * Get artist's top tracks
   */
  async getTopTracks(
    artistId: string,
    options?: {
      market?: string
    },
  ): Promise<{ tracks: SpotifyTrack[] }> {
    try {
      const params = {
        market: options?.market || 'US',
      }

      const response = await this.makeRequest<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks`, { params })
      return response
    } catch (error) {
      console.error('Error fetching artist top tracks:', error)
      throw new Error('Failed to fetch artist top tracks')
    }
  }

  /**
   * Get related artists
   */
  async getRelatedArtists(artistId: string): Promise<{ artists: SpotifyArtist[] }> {
    try {
      const response = await this.makeRequest<{ artists: SpotifyArtist[] }>(`/artists/${artistId}/related-artists`)
      return response
    } catch (error) {
      console.error('Error fetching related artists:', error)
      throw new Error('Failed to fetch related artists')
    }
  }

  /**
   * Follow artists
   */
  async follow(artistIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/following', {
        method: 'PUT',
        params: { type: 'artist' },
        data: { ids: artistIds },
      })
    } catch (error) {
      console.error('Error following artists:', error)
      throw new Error('Failed to follow artists')
    }
  }

  /**
   * Unfollow artists
   */
  async unfollow(artistIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/following', {
        method: 'DELETE',
        params: { type: 'artist' },
        data: { ids: artistIds },
      })
    } catch (error) {
      console.error('Error unfollowing artists:', error)
      throw new Error('Failed to unfollow artists')
    }
  }

  /**
   * Check if user follows artists
   */
  async checkFollowing(artistIds: string[]): Promise<boolean[]> {
    try {
      const response = await this.makeRequest<boolean[]>('/me/following/contains', {
        params: { 
          type: 'artist',
          ids: artistIds.join(',') 
        },
      })
      return response
    } catch (error) {
      console.error('Error checking following:', error)
      throw new Error('Failed to check following')
    }
  }

  /**
   * Get user's followed artists
   */
  async getFollowed(options?: {
    limit?: number
    after?: string
  }): Promise<{ artists: SpotifyPagingObject<SpotifyArtist> }> {
    try {
      const params = {
        type: 'artist',
        limit: options?.limit || 20,
        ...(options?.after && { after: options.after }),
      }

      const response = await this.makeRequest<{ artists: SpotifyPagingObject<SpotifyArtist> }>('/me/following', { params })
      return response
    } catch (error) {
      console.error('Error fetching followed artists:', error)
      throw new Error('Failed to fetch followed artists')
    }
  }
}
