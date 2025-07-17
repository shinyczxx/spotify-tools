/**
 * @file playlists.ts
 * @description Playlist-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifyPlaylist, SpotifyPagingObject } from '../types'

export class PlaylistEndpoints extends BaseEndpoint {
  /**
   * Get current user's playlists
   */
  async getUserPlaylists(options?: {
    limit?: number
    offset?: number
  }): Promise<SpotifyPlaylist[]> {
    let allPlaylists: SpotifyPlaylist[] = []
    let offset = options?.offset || 0
    const limit = options?.limit || 50

    try {
      while (true) {
        const response = await this.makeRequest<SpotifyPagingObject<SpotifyPlaylist>>('/me/playlists', {
          params: { limit, offset },
        })

        allPlaylists = allPlaylists.concat(response.items)

        if (!response.next || response.items.length === 0) {
          break
        }

        offset += limit
      }

      return allPlaylists
    } catch (error) {
      console.error('Error fetching playlists:', error)
      throw new Error('Failed to fetch playlists')
    }
  }

  /**
   * Create a new playlist
   */
  async create(
    name: string,
    options?: {
      description?: string
      public?: boolean
      collaborative?: boolean
    },
  ): Promise<SpotifyPlaylist> {
    try {
      // Get current user info first
      const userResponse = await this.makeRequest('/me')
      const userId = userResponse.id

      // Create the playlist
      const playlistData = {
        name,
        description: options?.description || `Created on ${new Date().toLocaleDateString()}`,
        public: options?.public ?? false,
        collaborative: options?.collaborative ?? false,
      }

      const response = await this.makeRequest<SpotifyPlaylist>(`/users/${userId}/playlists`, {
        method: 'POST',
        data: playlistData,
      })

      return response
    } catch (error) {
      console.error('Error creating playlist:', error)
      throw new Error('Failed to create playlist')
    }
  }

  /**
   * Add tracks to a playlist
   */
  async addTracks(
    playlistId: string,
    trackUris: string[],
    options?: {
      position?: number
    },
  ): Promise<{ snapshot_id: string }> {
    try {
      const batchSize = 100
      let lastResponse: any

      for (let i = 0; i < trackUris.length; i += batchSize) {
        const batch = trackUris.slice(i, i + batchSize)
        const data: any = { uris: batch }

        if (options?.position !== undefined) {
          data.position = options.position + i
        }

        lastResponse = await this.makeRequest(`/playlists/${playlistId}/tracks`, {
          method: 'POST',
          data,
        })
      }

      return lastResponse
    } catch (error) {
      console.error('Error adding tracks to playlist:', error)
      throw new Error('Failed to add tracks to playlist')
    }
  }

  /**
   * Get tracks from a playlist
   */
  async getTracks(
    playlistId: string,
    options?: {
      limit?: number
      offset?: number
      fields?: string
    },
  ): Promise<any> {
    try {
      const params: any = {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
      }

      if (options?.fields) {
        params.fields = options.fields
      }

      const response = await this.makeRequest(`/playlists/${playlistId}/tracks`, {
        params,
      })

      return response
    } catch (error) {
      console.error('Error fetching playlist tracks:', error)
      throw new Error('Failed to fetch playlist tracks')
    }
  }

  /**
   * Get a playlist by ID
   */
  async getById(
    playlistId: string,
    options?: {
      fields?: string
      market?: string
    },
  ): Promise<SpotifyPlaylist> {
    try {
      const params: any = {}

      if (options?.fields) {
        params.fields = options.fields
      }
      if (options?.market) {
        params.market = options.market
      }

      const response = await this.makeRequest<SpotifyPlaylist>(`/playlists/${playlistId}`, {
        params,
      })

      return response
    } catch (error) {
      console.error('Error fetching playlist:', error)
      throw new Error('Failed to fetch playlist')
    }
  }

  /**
   * Update playlist details
   */
  async update(
    playlistId: string,
    options: {
      name?: string
      description?: string
      public?: boolean
      collaborative?: boolean
    },
  ): Promise<void> {
    try {
      await this.makeRequest(`/playlists/${playlistId}`, {
        method: 'PUT',
        data: options,
      })
    } catch (error) {
      console.error('Error updating playlist:', error)
      throw new Error('Failed to update playlist')
    }
  }

  /**
   * Remove tracks from a playlist
   */
  async removeTracks(
    playlistId: string,
    tracks: Array<{ uri: string; positions?: number[] }>,
  ): Promise<{ snapshot_id: string }> {
    try {
      const response = await this.makeRequest<{ snapshot_id: string }>(`/playlists/${playlistId}/tracks`, {
        method: 'DELETE',
        data: { tracks },
      })

      return response
    } catch (error) {
      console.error('Error removing tracks from playlist:', error)
      throw new Error('Failed to remove tracks from playlist')
    }
  }
}
