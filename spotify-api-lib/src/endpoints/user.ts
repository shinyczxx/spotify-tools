/**
 * @file user.ts
 * @description User-related API endpoints
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { BaseEndpoint } from '../baseEndpoint'
import { SpotifyUser } from '../types'

export class UserEndpoints extends BaseEndpoint {
  /**
   * Get current user's profile
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    try {
      const response = await this.makeRequest<SpotifyUser>('/me')
      return response
    } catch (error) {
      console.error('Error fetching current user:', error)
      throw new Error('Failed to fetch current user')
    }
  }

  /**
   * Get user's profile by ID
   */
  async getById(userId: string): Promise<SpotifyUser> {
    try {
      const response = await this.makeRequest<SpotifyUser>(`/users/${userId}`)
      return response
    } catch (error) {
      console.error('Error fetching user:', error)
      throw new Error('Failed to fetch user')
    }
  }

  /**
   * Get user's top items (tracks or artists)
   */
  async getTopItems(
    type: 'tracks' | 'artists',
    options?: {
      time_range?: 'short_term' | 'medium_term' | 'long_term'
      limit?: number
      offset?: number
    },
  ): Promise<any> {
    try {
      const params = {
        time_range: options?.time_range || 'medium_term',
        limit: options?.limit || 20,
        offset: options?.offset || 0,
      }

      const response = await this.makeRequest(`/me/top/${type}`, { params })
      return response
    } catch (error) {
      console.error(`Error fetching top ${type}:`, error)
      throw new Error(`Failed to fetch top ${type}`)
    }
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(options?: {
    time_range?: 'short_term' | 'medium_term' | 'long_term'
    limit?: number
    offset?: number
  }): Promise<any> {
    return this.getTopItems('tracks', options)
  }

  /**
   * Get user's top artists
   */
  async getTopArtists(options?: {
    time_range?: 'short_term' | 'medium_term' | 'long_term'
    limit?: number
    offset?: number
  }): Promise<any> {
    return this.getTopItems('artists', options)
  }

  /**
   * Follow a user
   */
  async followUser(userId: string): Promise<void> {
    try {
      await this.makeRequest('/me/following', {
        method: 'PUT',
        params: { type: 'user' },
        data: { ids: [userId] },
      })
    } catch (error) {
      console.error('Error following user:', error)
      throw new Error('Failed to follow user')
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId: string): Promise<void> {
    try {
      await this.makeRequest('/me/following', {
        method: 'DELETE',
        params: { type: 'user' },
        data: { ids: [userId] },
      })
    } catch (error) {
      console.error('Error unfollowing user:', error)
      throw new Error('Failed to unfollow user')
    }
  }

  /**
   * Check if current user follows users
   */
  async checkFollowingUsers(userIds: string[]): Promise<boolean[]> {
    try {
      const response = await this.makeRequest<boolean[]>('/me/following/contains', {
        params: { 
          type: 'user',
          ids: userIds.join(',') 
        },
      })
      return response
    } catch (error) {
      console.error('Error checking following users:', error)
      throw new Error('Failed to check following users')
    }
  }
}
