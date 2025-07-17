/**
 * @file albums.ts
 * @description Album-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifyAlbum, SpotifyTrack, SpotifyPagingObject } from '../types'

export class AlbumEndpoints extends BaseEndpoint {
  /**
   * Get album by ID
   */
  async getById(
    albumId: string,
    options?: {
      market?: string
    },
  ): Promise<SpotifyAlbum> {
    try {
      const params: any = {}
      if (options?.market) {
        params.market = options.market
      }

      const response = await this.makeRequest<SpotifyAlbum>(`/albums/${albumId}`, { params })
      return response
    } catch (error) {
      console.error('Error fetching album:', error)
      throw new Error('Failed to fetch album')
    }
  }

  /**
   * Get multiple albums by IDs
   */
  async getByIds(
    albumIds: string[],
    options?: {
      market?: string
    },
  ): Promise<{ albums: SpotifyAlbum[] }> {
    try {
      const params: any = {
        ids: albumIds.join(','),
      }
      if (options?.market) {
        params.market = options.market
      }

      const response = await this.makeRequest<{ albums: SpotifyAlbum[] }>('/albums', { params })
      return response
    } catch (error) {
      console.error('Error fetching albums:', error)
      throw new Error('Failed to fetch albums')
    }
  }

  /**
   * Get album tracks
   */
  async getTracks(
    albumId: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifyPagingObject<SpotifyTrack>> {
    try {
      const params = {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        ...(options?.market && { market: options.market }),
      }

      const response = await this.makeRequest<SpotifyPagingObject<SpotifyTrack>>(`/albums/${albumId}/tracks`, { params })
      return response
    } catch (error) {
      console.error('Error fetching album tracks:', error)
      throw new Error('Failed to fetch album tracks')
    }
  }

  /**
   * Get user's saved albums
   */
  async getSavedAlbums(options?: {
    limit?: number
    offset?: number
    market?: string
  }): Promise<SpotifyPagingObject<{ added_at: string; album: SpotifyAlbum }>> {
    try {
      const params = {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        ...(options?.market && { market: options.market }),
      }

      const response = await this.makeRequest<SpotifyPagingObject<{ added_at: string; album: SpotifyAlbum }>>('/me/albums', { params })
      return response
    } catch (error) {
      console.error('Error fetching saved albums:', error)
      throw new Error('Failed to fetch saved albums')
    }
  }

  /**
   * Save albums for current user
   */
  async saveAlbums(albumIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/albums', {
        method: 'PUT',
        data: { ids: albumIds },
      })
    } catch (error) {
      console.error('Error saving albums:', error)
      throw new Error('Failed to save albums')
    }
  }

  /**
   * Remove albums from current user's saved albums
   */
  async removeAlbums(albumIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/albums', {
        method: 'DELETE',
        data: { ids: albumIds },
      })
    } catch (error) {
      console.error('Error removing albums:', error)
      throw new Error('Failed to remove albums')
    }
  }

  /**
   * Check if albums are saved for current user
   */
  async checkSavedAlbums(albumIds: string[]): Promise<boolean[]> {
    try {
      const response = await this.makeRequest<boolean[]>('/me/albums/contains', {
        params: { ids: albumIds.join(',') },
      })
      return response
    } catch (error) {
      console.error('Error checking saved albums:', error)
      throw new Error('Failed to check saved albums')
    }
  }

  /**
   * Get new album releases
   */
  async getNewReleases(options?: {
    country?: string
    limit?: number
    offset?: number
  }): Promise<SpotifyPagingObject<SpotifyAlbum>> {
    try {
      const params = {
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        ...(options?.country && { country: options.country }),
      }

      const response = await this.makeRequest<{ albums: SpotifyPagingObject<SpotifyAlbum> }>('/browse/new-releases', { params })
      return response.albums
    } catch (error) {
      console.error('Error fetching new releases:', error)
      throw new Error('Failed to fetch new releases')
    }
  }
}
