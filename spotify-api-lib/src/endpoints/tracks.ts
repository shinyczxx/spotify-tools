/**
 * @file tracks.ts
 * @description Track-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifyTrack, SpotifyPagingObject } from '../types'

export class TrackEndpoints extends BaseEndpoint {
  /**
   * Get user's saved tracks (liked songs)
   */
  async getSavedTracks(options?: {
    limit?: number
    offset?: number
    market?: string
  }): Promise<SpotifyPagingObject<{ added_at: string; track: SpotifyTrack }>> {
    // Validate parameters
    const limit = this.validateLimit(options?.limit, 50)
    const offset = this.validateOffset(options?.offset)
    
    const params = {
      limit,
      offset,
      ...(options?.market && { market: options.market }),
    }

    return await this.get<SpotifyPagingObject<{ added_at: string; track: SpotifyTrack }>>('/me/tracks', params)
  }

  /**
   * Validate limit parameter
   */
  private validateLimit(limit?: number, defaultValue: number = 20): number {
    if (!limit) return defaultValue
    return Math.min(Math.max(1, limit), 50) // Spotify API limit is 50
  }

  /**
   * Validate offset parameter
   */
  private validateOffset(offset?: number): number {
    return Math.max(0, offset || 0)
  }

  /**
   * Get albums from user's liked songs
   */
  async getLikedSongsAlbums(fetchLimit?: number): Promise<any[]> {
    const albumsMap = new Map<string, any>()
    const singlesMap = new Map<string, any>()
    let offset = 0
    let fetchedItems = 0
    const limit = 50

    while (!fetchLimit || fetchedItems < fetchLimit) {
      const response = await this.get('/me/tracks', { limit, offset })
      const items = response.items

      if (items.length === 0) break

      fetchedItems += items.length

      items.forEach((item: any) => {
        if (item.track && item.track.album) {
          const album = item.track.album
          if (album.album_type === 'single') {
            singlesMap.set(album.id, {
              id: album.id,
              name: album.name,
              artists: album.artists,
              artistIds: album.artists.map((a: any) => a.id),
              track: item.track.name,
              images: album.images,
              release_date: album.release_date,
              album_type: album.album_type,
            })
          }
          if (!albumsMap.has(album.id)) {
            albumsMap.set(album.id, {
              id: album.id,
              name: album.name,
              artists: album.artists.map((a: any) => a.name).join(', '),
              release_date: album.release_date,
              total_tracks: album.total_tracks,
              images: album.images,
              album_type: album.album_type,
            })
          }
        }
      })

      offset += limit
    }

    return Array.from(albumsMap.values())
  }

  /**
   * Get track by ID
   */
  async getById(
    trackId: string,
    options?: {
      market?: string
    },
  ): Promise<SpotifyTrack> {
    const params: any = {}
    if (options?.market) {
      params.market = options.market
    }

    return await this.get<SpotifyTrack>(`/tracks/${trackId}`, params)
  }

  /**
   * Get multiple tracks by IDs
   */
  async getByIds(
    trackIds: string[],
    options?: {
      market?: string
    },
  ): Promise<{ tracks: SpotifyTrack[] }> {
    const params: any = {
      ids: trackIds.join(','),
    }
    if (options?.market) {
      params.market = options.market
    }

    return await this.get<{ tracks: SpotifyTrack[] }>('/tracks', params)
  }

  /**
   * Save tracks for current user
   */
  async saveTracks(trackIds: string[]): Promise<void> {
    await this.put('/me/tracks', { ids: trackIds })
  }

  /**
   * Remove tracks from current user's saved tracks
   */
  async removeTracks(trackIds: string[]): Promise<void> {
    await this.delete('/me/tracks', { ids: trackIds })
  }

  /**
   * Check if tracks are saved for current user
   */
  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    return await this.get<boolean[]>('/me/tracks/contains', { ids: trackIds.join(',') })
  }

  /**
   * Get audio features for a track
   */
  async getAudioFeatures(trackId: string): Promise<any> {
    return await this.get(`/audio-features/${trackId}`)
  }

  /**
   * Get audio analysis for a track
   */
  async getAudioAnalysis(trackId: string): Promise<any> {
    return await this.get(`/audio-analysis/${trackId}`)
  }
}
