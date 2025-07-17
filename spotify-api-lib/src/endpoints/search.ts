/**
 * @file search.ts
 * @description Search-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifySearchResponse } from '../types'

export class SearchEndpoints extends BaseEndpoint {
  /**
   * Search for items
   */
  async search(
    query: string,
    options?: {
      type?: string[]
      limit?: number
      offset?: number
      market?: string
      include_external?: string
    },
  ): Promise<SpotifySearchResponse> {
    try {
      const params = {
        q: query,
        type: options?.type?.join(',') || 'track',
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        ...(options?.market && { market: options.market }),
        ...(options?.include_external && { include_external: options.include_external }),
      }

      const response = await this.makeRequest<SpotifySearchResponse>('/search', { params })
      return response
    } catch (error) {
      console.error('Error searching:', error)
      throw new Error('Failed to search')
    }
  }

  /**
   * Search for tracks
   */
  async tracks(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['track'],
    })
  }

  /**
   * Search for albums
   */
  async albums(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['album'],
    })
  }

  /**
   * Search for artists
   */
  async artists(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['artist'],
    })
  }

  /**
   * Search for playlists
   */
  async playlists(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['playlist'],
    })
  }

  /**
   * Search for shows
   */
  async shows(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['show'],
    })
  }

  /**
   * Search for episodes
   */
  async episodes(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['episode'],
    })
  }

  /**
   * Search for audiobooks
   */
  async audiobooks(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['audiobook'],
    })
  }

  /**
   * Search everything
   */
  async all(
    query: string,
    options?: {
      limit?: number
      offset?: number
      market?: string
    },
  ): Promise<SpotifySearchResponse> {
    return this.search(query, {
      ...options,
      type: ['track', 'album', 'artist', 'playlist', 'show', 'episode', 'audiobook'],
    })
  }
}
