/**
 * @file albumHistory.ts
 * @description Types and interfaces for album retrieval history functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 */

export interface AlbumHistoryEntry {
  id: string
  date: string
  playlistNames: string[]
  playlistIds: string[]
  albumsHash: string // Hash for efficient storage lookup
  albumCount: number
}

export interface AlbumCacheEntry {
  hash: string
  albums: any[] // SpotifyAlbum array
  timestamp: number
}

export interface AlbumHistoryStorage {
  entries: AlbumHistoryEntry[]
  version: string
}