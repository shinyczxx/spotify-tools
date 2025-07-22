/**
 * @file albumDiscovery.utils.ts
 * @description Utilities for discovering and filtering albums
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import api from '../api'
import SpotifyApi, { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'
import type { AlbumFilters, ShuffleType } from '../../../types/album'
import { albumCache } from './cacheManagement.utils'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Album discovery utilities
 */
export class AlbumDiscovery {
  /**
   * Check if a single/compilation track exists on a proper album by searching the artist's discography
   */
  async findTrackOnAlbum(
    track: SpotifyTrack,
    accessToken: string,
  ): Promise<SpotifyAlbum | null> {
    try {
      const spotify = new SpotifyApi(accessToken)

      // Search for albums by the primary artist
      const artistId = track.artists[0]?.id
      if (!artistId) {
        return null
      }

      // Get albums for this artist
      const albums = await spotify.getArtistAlbums(artistId, {
        include_groups: ['album'], // Only proper albums, not singles/compilations
        limit: 50,
      })

      // Search for the track in these albums
      for (const album of albums.items) {
        try {
          const albumTracks = await spotify.getAlbumTracks(album.id)
          const foundTrack = albumTracks.items.find(
            (albumTrack: any) =>
              albumTrack.name.toLowerCase() === track.name.toLowerCase() ||
              this.normalizeTrackName(albumTrack.name) === this.normalizeTrackName(track.name),
          )

          if (foundTrack) {
            // Return the full album object
            const fullAlbum = await spotify.getAlbum(album.id)
            return fullAlbum
          }
        } catch (error) {
          console.warn(`Error checking album ${album.name}:`, error)
        }
      }

      return null
    } catch (error) {
      console.error('Error finding track on album:', error)
      return null
    }
  }

  /**
   * Discover albums from a list of tracks with optional filtering
   */
  async discoverAlbums(
    tracks: SpotifyTrack[],
    filters: AlbumFilters,
    accessToken: string,
  ): Promise<SpotifyAlbum[]> {
    const cacheKey = `${JSON.stringify(tracks.slice(0, 10).map(t => t.id))}-${JSON.stringify(filters)}`
    
    // Check cache first
    const cached = albumCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.albums.slice(0, filters.albumCount)
    }

    console.debug('🔍 Starting album discovery...', {
      trackCount: tracks.length,
      filters,
      cacheKey: cacheKey.substring(0, 50),
    })

    const albumMap = new Map<string, SpotifyAlbum>()
    const processedAlbums = new Set<string>()

    for (const track of tracks) {
      try {
        if (!track.album) continue

        const album = track.album
        const albumKey = `${album.id}-${album.album_type}`

        // Skip if already processed
        if (processedAlbums.has(albumKey)) continue
        processedAlbums.add(albumKey)

        // Apply filters
        const shouldInclude = this.shouldIncludeAlbum(album, filters)

        if (shouldInclude) {
          albumMap.set(album.id, album)
        } else if (album.album_type === 'single' || album.album_type === 'compilation') {
          // For singles/compilations, try to find the track on a proper album
          try {
            const properAlbum = await this.findTrackOnAlbum(track, accessToken)
            if (properAlbum && !albumMap.has(properAlbum.id)) {
              const shouldIncludeProper = this.shouldIncludeAlbum(properAlbum, {
                ...filters,
                includeSingles: true,
                includeCompilations: true,
              })
              
              if (shouldIncludeProper) {
                albumMap.set(properAlbum.id, properAlbum)
              }
            }
          } catch (error) {
            console.warn(`Error finding proper album for track "${track.name}":`, error)
          }
        }
      } catch (error) {
        console.error(`Error processing track "${track.name}":`, error)
      }
    }

    const albums = Array.from(albumMap.values())

    // Cache the result
    albumCache.set(cacheKey, {
      albums,
      timestamp: Date.now(),
    })

    console.debug('✅ Album discovery complete', {
      discoveredAlbums: albums.length,
      requestedCount: filters.albumCount,
    })

    return albums.slice(0, filters.albumCount)
  }

  /**
   * Check if an album should be included based on filters
   */
  private shouldIncludeAlbum(album: SpotifyAlbum, filters: AlbumFilters): boolean {
    // Check album type filters
    if (album.album_type === 'single' && !filters.includeSingles) {
      return false
    }
    
    if (album.album_type === 'compilation' && !filters.includeCompilations) {
      return false
    }

    // Add any additional filtering logic here
    return true
  }

  /**
   * Normalize track name for better matching
   */
  private normalizeTrackName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Clear the album cache
   * @deprecated Use CacheManagement.clearAlbumCache() instead
   */
  clearAlbumCache(): void {
    albumCache.clear()
  }
}