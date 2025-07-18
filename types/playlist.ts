/**
 * @file playlist.ts
 * @description Types for playlist and album items used in selectors and tools
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 */

export interface BaseItem {
  id: string
  name: string
  images: Array<{ url: string; height?: number; width?: number }>
}

export interface PlaylistItem extends BaseItem {
  description?: string
  owner: {
    display_name: string
    id: string
  }
  tracks: {
    total: number
  }
}

export interface AlbumItem extends BaseItem {
  artists: Array<{ name: string; id: string }>
  release_date: string
  total_tracks: number
}

// Playlist configuration types
export interface AlbumShuffleSettings {
  allowSingles: boolean
  allowCompilations: boolean
  numberOfAlbums: number
}

export interface ShuffleSettings {
  algorithm: 'random' | 'none'
}

export type ShuffleAlgorithm = 'random' | 'weighted-newer' | 'weighted-older' | 'chronological' | 'spiral-dance'

// Extended track types for shuffled results
export interface ShuffledTrack {
  id: string
  name: string
  uri: string
  artists: Array<{ name: string; id: string }>
  album?: {
    id: string
    name: string
    album_type?: string
    images?: Array<{ url: string; height?: number; width?: number }>
  }
  albumName: string
  albumId: string
  energy?: number // Audio feature property
  // Additional Spotify track properties
  available_markets?: string[]
  disc_number?: number
  duration_ms?: number
  explicit?: boolean
  external_ids?: Record<string, string>
  external_urls?: Record<string, string>
  href?: string
  is_local?: boolean
  popularity?: number
  preview_url?: string | null
  track_number?: number
  type?: string
}
