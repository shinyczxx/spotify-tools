/**
 * @file index.ts
 * @description Last.fm API library for fetching music metadata and play counts
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-10-20
 */

import axios, { AxiosInstance } from 'axios'

export interface LastFmTag {
  name: string
  count: number
}

export interface LastFmArtist {
  name: string
  mbid?: string
  url: string
  playcount?: string
  listeners?: string
}

export interface LastFmAlbum {
  name: string
  artist: string
  mbid?: string
  url: string
  playcount?: string
  listeners?: string
}

export interface LastFmTrack {
  name: string
  artist: {
    name: string
    mbid?: string
    url?: string
  }
  album?: {
    title: string
    mbid?: string
    url?: string
  }
  mbid?: string
  url: string
  playcount?: string
  listeners?: string
  userplaycount?: string
}

export interface LastFmApiResponse<T> {
  data: T | null
  success: boolean
  error?: string
}

export default class LastFmApi {
  private apiKey: string
  private username?: string
  private baseUrl: string = 'https://ws.audioscrobbler.com/2.0/'
  private axiosInstance: AxiosInstance

  constructor(apiKey: string, username?: string) {
    this.apiKey = apiKey
    this.username = username
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    })
  }

  /**
   * Get track information including play count
   */
  async getTrackInfo(artist: string, track: string): Promise<LastFmApiResponse<LastFmTrack>> {
    try {
      const params: any = {
        method: 'track.getInfo',
        api_key: this.apiKey,
        artist: artist,
        track: track,
        format: 'json',
      }

      if (this.username) {
        params.username = this.username
      }

      const response = await this.axiosInstance.get('', { params })

      if (response.data.error) {
        return {
          data: null,
          success: false,
          error: response.data.message || 'Unknown error',
        }
      }

      return {
        data: response.data.track,
        success: true,
      }
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message || 'Failed to fetch track info',
      }
    }
  }

  /**
   * Get artist information
   */
  async getArtistInfo(artist: string): Promise<LastFmApiResponse<LastFmArtist>> {
    try {
      const params = {
        method: 'artist.getInfo',
        api_key: this.apiKey,
        artist: artist,
        format: 'json',
      }

      const response = await this.axiosInstance.get('', { params })

      if (response.data.error) {
        return {
          data: null,
          success: false,
          error: response.data.message || 'Unknown error',
        }
      }

      return {
        data: response.data.artist,
        success: true,
      }
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message || 'Failed to fetch artist info',
      }
    }
  }

  /**
   * Get album information
   */
  async getAlbumInfo(artist: string, album: string): Promise<LastFmApiResponse<LastFmAlbum>> {
    try {
      const params = {
        method: 'album.getInfo',
        api_key: this.apiKey,
        artist: artist,
        album: album,
        format: 'json',
      }

      const response = await this.axiosInstance.get('', { params })

      if (response.data.error) {
        return {
          data: null,
          success: false,
          error: response.data.message || 'Unknown error',
        }
      }

      return {
        data: response.data.album,
        success: true,
      }
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message || 'Failed to fetch album info',
      }
    }
  }

  /**
   * Get multiple track play counts in batch
   * This method attempts to fetch play counts for multiple tracks
   * Returns a map of trackKey (artist-track) to play count
   */
  async getBatchTrackPlayCounts(
    tracks: Array<{ artist: string; track: string }>
  ): Promise<Map<string, number>> {
    const playCountMap = new Map<string, number>()

    // Process tracks in parallel with rate limiting
    const batchSize = 5 // Limit concurrent requests
    for (let i = 0; i < tracks.length; i += batchSize) {
      const batch = tracks.slice(i, i + batchSize)
      const promises = batch.map(async ({ artist, track }) => {
        const trackKey = `${artist.toLowerCase()}-${track.toLowerCase()}`
        const result = await this.getTrackInfo(artist, track)

        if (result.success && result.data) {
          const playcount = result.data.userplaycount || result.data.playcount || '0'
          playCountMap.set(trackKey, parseInt(playcount, 10))
        } else {
          playCountMap.set(trackKey, 0)
        }
      })

      await Promise.all(promises)

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < tracks.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    return playCountMap
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit: number = 30): Promise<LastFmApiResponse<LastFmTrack[]>> {
    try {
      const params = {
        method: 'track.search',
        api_key: this.apiKey,
        track: query,
        limit: limit,
        format: 'json',
      }

      const response = await this.axiosInstance.get('', { params })

      if (response.data.error) {
        return {
          data: null,
          success: false,
          error: response.data.message || 'Unknown error',
        }
      }

      const tracks = response.data.results?.trackmatches?.track || []
      return {
        data: Array.isArray(tracks) ? tracks : [tracks],
        success: true,
      }
    } catch (error: any) {
      return {
        data: null,
        success: false,
        error: error.message || 'Failed to search tracks',
      }
    }
  }
}
