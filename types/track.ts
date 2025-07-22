/**
 * @file track.ts
 * @description Types for track information and search functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

export interface TrackInfo {
  id: string
  name: string
  artist: string
  album: string
  duration: string
  popularity: number
  energy?: number
  danceability?: number
  valence?: number
  tempo?: number
  acousticness?: number
  instrumentalness?: number
  speechiness?: number
  liveness?: number
  explicit: boolean
  preview_url?: string
  external_urls?: {
    spotify: string
  }
}

export interface SearchResult {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  popularity: number
  explicit: boolean
  preview_url?: string
  external_urls: {
    spotify: string
  }
}