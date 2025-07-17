/**
 * @file utils/albumHistory.ts
 * @description Utilities for managing album retrieval history with efficient storage
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 */

import type { SpotifyAlbum } from 'spotify-api-lib'
import type { AlbumHistoryEntry, AlbumCacheEntry, AlbumHistoryStorage } from 'types/albumHistory'

const HISTORY_STORAGE_KEY = 'albumRetrievalHistory'
const ALBUM_CACHE_KEY = 'albumCache'
const MAX_HISTORY_ENTRIES = 50
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Generate a hash for efficient album storage
 */
function generateAlbumsHash(albums: SpotifyAlbum[]): string {
  const ids = albums
    .map((album) => album.id)
    .sort()
    .join(',')
  return btoa(ids)
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 16)
}

/**
 * Get all history entries
 */
export function getAlbumHistory(): AlbumHistoryEntry[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!stored) return []

    const data: AlbumHistoryStorage = JSON.parse(stored)
    return data.entries || []
  } catch (error) {
    console.error('Error loading album history:', error)
    return []
  }
}

/**
 * Save a new album retrieval to history
 */
export function saveAlbumHistory(
  playlistNames: string[],
  playlistIds: string[],
  albums: SpotifyAlbum[],
): string {
  try {
    const albumsHash = generateAlbumsHash(albums)
    const entry: AlbumHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      playlistNames: [...playlistNames],
      playlistIds: [...playlistIds],
      albumsHash,
      albumCount: albums.length,
    }

    // Save albums to cache
    saveAlbumsToCache(albumsHash, albums)

    // Save entry to history
    const history = getAlbumHistory()
    history.unshift(entry) // Add to beginning

    // Keep only latest entries
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES)
    }

    const storage: AlbumHistoryStorage = {
      entries: history,
      version: '1.0.0',
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(storage))
    return entry.id
  } catch (error) {
    console.error('Error saving album history:', error)
    return ''
  }
}

/**
 * Save albums to cache with hash key
 */
function saveAlbumsToCache(hash: string, albums: SpotifyAlbum[]): void {
  try {
    const cacheEntry: AlbumCacheEntry = {
      hash,
      albums,
      timestamp: Date.now(),
    }

    const existingCache = getAlbumCache()
    existingCache[hash] = cacheEntry

    // Clean expired entries
    const now = Date.now()
    Object.keys(existingCache).forEach((key) => {
      if (now - existingCache[key].timestamp > CACHE_TTL) {
        delete existingCache[key]
      }
    })

    localStorage.setItem(ALBUM_CACHE_KEY, JSON.stringify(existingCache))
  } catch (error) {
    console.error('Error saving albums to cache:', error)
  }
}

/**
 * Get albums cache
 */
function getAlbumCache(): Record<string, AlbumCacheEntry> {
  try {
    const stored = localStorage.getItem(ALBUM_CACHE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Error loading album cache:', error)
    return {}
  }
}

/**
 * Get albums by hash from cache
 */
export function getAlbumsByHash(hash: string): SpotifyAlbum[] | null {
  try {
    const cache = getAlbumCache()
    const entry = cache[hash]

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      delete cache[hash]
      localStorage.setItem(ALBUM_CACHE_KEY, JSON.stringify(cache))
      return null
    }

    return entry.albums
  } catch (error) {
    console.error('Error getting albums from cache:', error)
    return null
  }
}

/**
 * Delete a history entry
 */
export function deleteHistoryEntry(entryId: string): void {
  try {
    const history = getAlbumHistory()
    const filteredHistory = history.filter((entry) => entry.id !== entryId)

    const storage: AlbumHistoryStorage = {
      entries: filteredHistory,
      version: '1.0.0',
    }

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(storage))
  } catch (error) {
    console.error('Error deleting history entry:', error)
  }
}

/**
 * Clear all history and cache
 */
export function clearAlbumHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY)
    localStorage.removeItem(ALBUM_CACHE_KEY)
  } catch (error) {
    console.error('Error clearing album history:', error)
  }
}
