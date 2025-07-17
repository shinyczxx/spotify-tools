/**
 * @file types.ts
 * @description TypeScript interfaces for Spotify API responses
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyArtist {
  external_urls: { spotify: string }
  followers?: { href: string | null; total: number }
  genres?: string[]
  href: string
  id: string
  images?: SpotifyImage[]
  name: string
  popularity?: number
  type: 'artist'
  uri: string
}

export interface SpotifyAlbum {
  album_type: 'album' | 'single' | 'compilation'
  artists: SpotifyArtist[]
  available_markets: string[]
  external_urls: { spotify: string }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  release_date: string
  release_date_precision: 'year' | 'month' | 'day'
  total_tracks: number
  type: 'album'
  uri: string
  popularity?: number
  label?: string
}

export interface SpotifyTrack {
  album: SpotifyAlbum
  artists: SpotifyArtist[]
  available_markets: string[]
  disc_number: number
  duration_ms: number
  explicit: boolean
  external_ids: { isrc?: string; ean?: string; upc?: string }
  external_urls: { spotify: string }
  href: string
  id: string
  is_local: boolean
  name: string
  popularity: number
  preview_url: string | null
  track_number: number
  type: 'track'
  uri: string
}

export interface SpotifyPlaylist {
  collaborative: boolean
  description: string | null
  external_urls: { spotify: string }
  followers: { href: string | null; total: number }
  href: string
  id: string
  images: SpotifyImage[]
  name: string
  owner: {
    display_name: string | null
    external_urls: { spotify: string }
    href: string
    id: string
    type: 'user'
    uri: string
  }
  primary_color: string | null
  public: boolean | null
  snapshot_id: string
  tracks: {
    href: string
    total: number
  }
  type: 'playlist'
  uri: string
}

export interface SpotifyUser {
  country?: string
  display_name: string | null
  email?: string
  explicit_content?: {
    filter_enabled: boolean
    filter_locked: boolean
  }
  external_urls: { spotify: string }
  followers: { href: string | null; total: number }
  href: string
  id: string
  images: SpotifyImage[]
  product?: string
  type: 'user'
  uri: string
}

export interface SpotifySearchResponse {
  tracks?: {
    href: string
    items: SpotifyTrack[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  albums?: {
    href: string
    items: SpotifyAlbum[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  artists?: {
    href: string
    items: SpotifyArtist[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
  playlists?: {
    href: string
    items: SpotifyPlaylist[]
    limit: number
    next: string | null
    offset: number
    previous: string | null
    total: number
  }
}

export interface SpotifyPagingObject<T> {
  href: string
  items: T[]
  limit: number
  next: string | null
  offset: number
  previous: string | null
  total: number
}
