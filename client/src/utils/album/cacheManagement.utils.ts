/**
 * @file cacheManagement.utils.ts
 * @description Utilities for managing album-related caches
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { SpotifyAlbum } from 'spotify-api-lib'

// Global album cache
const albumCache = new Map<string, { albums: SpotifyAlbum[]; timestamp: number }>()

/**
 * Cache management utilities
 */
export class CacheManagement {
  /**
   * Clear the album cache
   */
  static clearAlbumCache(): void {
    albumCache.clear()
  }

  /**
   * Get album cache for readonly access
   */
  static getAlbumCache(): Map<string, { albums: SpotifyAlbum[]; timestamp: number }> {
    return albumCache
  }

  /**
   * Check if cache entry is valid
   */
  static isCacheValid(timestamp: number, duration: number): boolean {
    return Date.now() - timestamp < duration
  }
}

// Export the cache for use by other utilities
export { albumCache }