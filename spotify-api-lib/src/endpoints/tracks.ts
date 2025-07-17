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
    try {
      const params = {
        limit: options?.limit || 50,
        offset: options?.offset || 0,
        ...(options?.market && { market: options.market }),
      }

      const response = await this.makeRequest<SpotifyPagingObject<{ added_at: string; track: SpotifyTrack }>>('/me/tracks', { params })
      return response
    } catch (error) {
      console.error('Error fetching saved tracks:', error)
      throw new Error('Failed to fetch saved tracks')
    }
  }

  /**
   * Get albums from user's liked songs
   */
  async getLikedSongsAlbums(fetchLimit?: number): Promise<any[]> {
    try {
      const albumsMap = new Map<string, any>()
      const singlesMap = new Map<string, any>()
      let offset = 0
      let fetchedItems = 0
      const limit = 50

      while (!fetchLimit || fetchedItems < fetchLimit) {
        const response = await this.makeRequest('/me/tracks', {
          params: { limit, offset },
        })

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
    } catch (error) {
      console.error('Error fetching liked songs albums:', error)
      throw new Error('Failed to fetch liked songs albums')
    }
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
    try {
      const params: any = {}
      if (options?.market) {
        params.market = options.market
      }

      const response = await this.makeRequest<SpotifyTrack>(`/tracks/${trackId}`, { params })
      return response
    } catch (error) {
      console.error('Error fetching track:', error)
      throw new Error('Failed to fetch track')
    }
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
    try {
      const params: any = {
        ids: trackIds.join(','),
      }
      if (options?.market) {
        params.market = options.market
      }

      const response = await this.makeRequest<{ tracks: SpotifyTrack[] }>('/tracks', { params })
      return response
    } catch (error) {
      console.error('Error fetching tracks:', error)
      throw new Error('Failed to fetch tracks')
    }
  }

  /**
   * Save tracks for current user
   */
  async saveTracks(trackIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/tracks', {
        method: 'PUT',
        data: { ids: trackIds },
      })
    } catch (error) {
      console.error('Error saving tracks:', error)
      throw new Error('Failed to save tracks')
    }
  }

  /**
   * Remove tracks from current user's saved tracks
   */
  async removeTracks(trackIds: string[]): Promise<void> {
    try {
      await this.makeRequest('/me/tracks', {
        method: 'DELETE',
        data: { ids: trackIds },
      })
    } catch (error) {
      console.error('Error removing tracks:', error)
      throw new Error('Failed to remove tracks')
    }
  }

  /**
   * Check if tracks are saved for current user
   */
  async checkSavedTracks(trackIds: string[]): Promise<boolean[]> {
    try {
      const response = await this.makeRequest<boolean[]>('/me/tracks/contains', {
        params: { ids: trackIds.join(',') },
      })
      return response
    } catch (error) {
      console.error('Error checking saved tracks:', error)
      throw new Error('Failed to check saved tracks')
    }
  }

  /**
   * Get audio features for a track
   */
  async getAudioFeatures(trackId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/audio-features/${trackId}`)
      return response
    } catch (error) {
      console.error('Error fetching audio features:', error)
      throw new Error('Failed to fetch audio features')
    }
  }

  /**
   * Get audio analysis for a track
   */
  async getAudioAnalysis(trackId: string): Promise<any> {
    try {
      const response = await this.makeRequest(`/audio-analysis/${trackId}`)
      return response
    } catch (error) {
      console.error('Error fetching audio analysis:', error)
      throw new Error('Failed to fetch audio analysis')
    }
  }
}
