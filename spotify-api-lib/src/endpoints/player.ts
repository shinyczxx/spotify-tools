/**
 * @file player.ts
 * @description Player-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'

export interface SpotifyPlaybackState {
  device: {
    id: string
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    type: string
    volume_percent: number
  }
  repeat_state: 'off' | 'track' | 'context'
  shuffle_state: boolean
  context: {
    type: string
    href: string
    external_urls: { spotify: string }
    uri: string
  } | null
  timestamp: number
  progress_ms: number
  is_playing: boolean
  item: any // Track or Episode
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown'
  actions: {
    interrupting_playback?: boolean
    pausing?: boolean
    resuming?: boolean
    seeking?: boolean
    skipping_next?: boolean
    skipping_prev?: boolean
    toggling_repeat_context?: boolean
    toggling_shuffle?: boolean
    toggling_repeat_track?: boolean
    transferring_playback?: boolean
  }
}

export class PlayerEndpoints extends BaseEndpoint {
  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying(options?: {
    market?: string
    additional_types?: string[]
  }): Promise<any> {
    try {
      const params: any = {}
      if (options?.market) {
        params.market = options.market
      }
      if (options?.additional_types) {
        params.additional_types = options.additional_types.join(',')
      }

      const response = await this.makeRequest('/me/player/currently-playing', { params })
      return response
    } catch (error) {
      console.error('Error fetching currently playing:', error)
      throw new Error('Failed to fetch currently playing track')
    }
  }

  /**
   * Get playback state
   */
  async getPlaybackState(options?: { 
    market?: string 
    additional_types?: string[] 
  }): Promise<SpotifyPlaybackState> {
    try {
      const params: any = {}
      if (options?.market) {
        params.market = options.market
      }
      if (options?.additional_types) {
        params.additional_types = options.additional_types.join(',')
      }

      const response = await this.makeRequest<SpotifyPlaybackState>('/me/player', { params })
      return response
    } catch (error) {
      console.error('Error fetching playback state:', error)
      throw new Error('Failed to fetch playback state')
    }
  }

  /**
   * Transfer playback to a device
   */
  async transferPlayback(deviceIds: string[], play?: boolean): Promise<void> {
    try {
      await this.makeRequest('/me/player', {
        method: 'PUT',
        data: {
          device_ids: deviceIds,
          play: play ?? false,
        },
      })
    } catch (error) {
      console.error('Error transferring playback:', error)
      throw new Error('Failed to transfer playback')
    }
  }

  /**
   * Get available devices
   */
  async getDevices(): Promise<{ devices: any[] }> {
    try {
      const response = await this.makeRequest<{ devices: any[] }>('/me/player/devices')
      return response
    } catch (error) {
      console.error('Error fetching devices:', error)
      throw new Error('Failed to fetch devices')
    }
  }

  /**
   * Start/Resume playback
   */
  async play(options?: {
    device_id?: string
    context_uri?: string
    uris?: string[]
    offset?: { position: number } | { uri: string }
    position_ms?: number
  }): Promise<void> {
    try {
      const params: any = {}
      if (options?.device_id) {
        params.device_id = options.device_id
      }

      const data: any = {}
      if (options?.context_uri) {
        data.context_uri = options.context_uri
      }
      if (options?.uris) {
        data.uris = options.uris
      }
      if (options?.offset) {
        data.offset = options.offset
      }
      if (options?.position_ms) {
        data.position_ms = options.position_ms
      }

      await this.makeRequest('/me/player/play', {
        method: 'PUT',
        params,
        data: Object.keys(data).length > 0 ? data : undefined,
      })
    } catch (error) {
      console.error('Error starting playback:', error)
      throw new Error('Failed to start playback')
    }
  }

  /**
   * Pause playback
   */
  async pause(device_id?: string): Promise<void> {
    try {
      const params: any = {}
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/pause', {
        method: 'PUT',
        params,
      })
    } catch (error) {
      console.error('Error pausing playback:', error)
      throw new Error('Failed to pause playback')
    }
  }

  /**
   * Skip to next track
   */
  async next(device_id?: string): Promise<void> {
    try {
      const params: any = {}
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/next', {
        method: 'POST',
        params,
      })
    } catch (error) {
      console.error('Error skipping to next:', error)
      throw new Error('Failed to skip to next track')
    }
  }

  /**
   * Skip to previous track
   */
  async previous(device_id?: string): Promise<void> {
    try {
      const params: any = {}
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/previous', {
        method: 'POST',
        params,
      })
    } catch (error) {
      console.error('Error skipping to previous:', error)
      throw new Error('Failed to skip to previous track')
    }
  }

  /**
   * Seek to position in track
   */
  async seek(position_ms: number, device_id?: string): Promise<void> {
    try {
      const params: any = { position_ms }
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/seek', {
        method: 'PUT',
        params,
      })
    } catch (error) {
      console.error('Error seeking:', error)
      throw new Error('Failed to seek')
    }
  }

  /**
   * Set repeat mode
   */
  async setRepeat(state: 'track' | 'context' | 'off', device_id?: string): Promise<void> {
    try {
      const params: any = { state }
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/repeat', {
        method: 'PUT',
        params,
      })
    } catch (error) {
      console.error('Error setting repeat:', error)
      throw new Error('Failed to set repeat mode')
    }
  }

  /**
   * Set shuffle mode
   */
  async setShuffle(state: boolean, device_id?: string): Promise<void> {
    try {
      const params: any = { state }
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/shuffle', {
        method: 'PUT',
        params,
      })
    } catch (error) {
      console.error('Error setting shuffle:', error)
      throw new Error('Failed to set shuffle mode')
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume_percent: number, device_id?: string): Promise<void> {
    try {
      const params: any = { volume_percent }
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/volume', {
        method: 'PUT',
        params,
      })
    } catch (error) {
      console.error('Error setting volume:', error)
      throw new Error('Failed to set volume')
    }
  }

  /**
   * Add item to playback queue
   */
  async addToQueue(uri: string, device_id?: string): Promise<void> {
    try {
      const params: any = { uri }
      if (device_id) {
        params.device_id = device_id
      }

      await this.makeRequest('/me/player/queue', {
        method: 'POST',
        params,
      })
    } catch (error) {
      console.error('Error adding to queue:', error)
      throw new Error('Failed to add to queue')
    }
  }

  /**
   * Get the user's queue
   */
  async getQueue(): Promise<any> {
    try {
      const response = await this.makeRequest('/me/player/queue')
      return response
    } catch (error) {
      console.error('Error fetching queue:', error)
      throw new Error('Failed to fetch queue')
    }
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayed(options?: {
    limit?: number
    after?: number
    before?: number
  }): Promise<any> {
    try {
      const params: any = {
        limit: options?.limit || 20,
      }
      if (options?.after) {
        params.after = options.after
      }
      if (options?.before) {
        params.before = options.before
      }

      const response = await this.makeRequest('/me/player/recently-played', { params })
      return response
    } catch (error) {
      console.error('Error fetching recently played:', error)
      throw new Error('Failed to fetch recently played tracks')
    }
  }
}
