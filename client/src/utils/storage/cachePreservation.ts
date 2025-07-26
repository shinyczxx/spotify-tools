/**
 * @file cachePreservation.ts
 * @description Utilities for preserving cached data during auth token refresh
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

/**
 * Keys for data that should be preserved during auth issues
 */
const PRESERVE_KEYS = [
  'album_cache_',
  'playlist_cache_',
  'track_cache_',
  'lastfm_cache_',
  'shuffle_history_',
] as const

/**
 * Check if a localStorage key should be preserved during auth cleanup
 */
export function shouldPreserveKey(key: string): boolean {
  return PRESERVE_KEYS.some(prefix => key.startsWith(prefix))
}

/**
 * Clear auth-related data while preserving cached albums and other data
 */
export function clearAuthDataOnly(): void {
  const keysToRemove: string[] = []
  
  // Collect auth-related keys to remove
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && isAuthRelatedKey(key)) {
      keysToRemove.push(key)
    }
  }
  
  // Remove only auth-related keys
  keysToRemove.forEach(key => {
    console.log(`[Cache] Preserving non-auth data, removing: ${key}`)
    localStorage.removeItem(key)
  })
}

/**
 * Check if a key is auth-related (should be cleared on auth failure)
 */
function isAuthRelatedKey(key: string): boolean {
  const authKeys = [
    'spotify_access_token',
    'spotify_refresh_token',
    'spotify_code_verifier',
    'spotify_state',
    'user_profile',
  ]
  
  return authKeys.includes(key)
}

/**
 * Get a summary of what data would be preserved vs cleared
 */
export function getDataPreservationSummary(): {
  preserved: string[]
  cleared: string[]
} {
  const preserved: string[] = []
  const cleared: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      if (shouldPreserveKey(key)) {
        preserved.push(key)
      } else if (isAuthRelatedKey(key)) {
        cleared.push(key)
      }
    }
  }
  
  return { preserved, cleared }
}

/**
 * Backup important cache data before auth operations
 */
export function backupCacheData(): Map<string, string> {
  const backup = new Map<string, string>()
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && shouldPreserveKey(key)) {
      const value = localStorage.getItem(key)
      if (value) {
        backup.set(key, value)
      }
    }
  }
  
  console.log(`[Cache] Backed up ${backup.size} cache entries`)
  return backup
}

/**
 * Restore cache data from backup
 */
export function restoreCacheData(backup: Map<string, string>): void {
  backup.forEach((value, key) => {
    localStorage.setItem(key, value)
  })
  
  console.log(`[Cache] Restored ${backup.size} cache entries`)
}