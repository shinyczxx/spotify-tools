/**
 * @file mockDataUtils.ts
 * @description Utilities for generating mock Last.fm data for testing
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import { LastFmSearchResult } from '@services/lastfm'
import { mockAlbumsData, MockAlbum } from '@data/lastfm/mockAlbums'

/**
 * Generate mock album data for testing based on requested tags
 * @param tags - Array of tags to filter albums by
 * @returns Array of LastFmSearchResult objects with mock data
 */
export const generateMockAlbumData = (tags: string[]): LastFmSearchResult[] => {
  // Filter albums that match at least one of the requested tags
  const matchingAlbums = mockAlbumsData.filter(album => 
    tags.some(tag => album.tags.some(albumTag => 
      albumTag.toLowerCase().includes(tag.toLowerCase()) || 
      tag.toLowerCase().includes(albumTag.toLowerCase())
    ))
  )

  // If no matches, return a subset of all albums
  const albumsToUse = matchingAlbums.length > 0 ? matchingAlbums : mockAlbumsData.slice(0, 8)

  return albumsToUse.map((album, index) => transformMockAlbumToSearchResult(album, index))
}

/**
 * Transform a MockAlbum to a LastFmSearchResult with realistic mock data
 * @param album - The mock album data
 * @param index - Index for generating unique IDs and images
 * @returns LastFmSearchResult with mock data
 */
export const transformMockAlbumToSearchResult = (album: MockAlbum, index: number): LastFmSearchResult => ({
  id: `mock-${index}-${album.name.replace(/\s+/g, '-').toLowerCase()}`,
  name: album.name,
  artist: album.artist,
  tags: album.tags,
  image: `https://picsum.photos/300/300?random=${index}`, // Mock album cover
  url: `https://last.fm/music/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`,
  playcount: Math.floor(Math.random() * 1000000) + 10000
})

/**
 * Simulate API delay for realistic testing experience
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Promise that resolves after the specified delay
 */
export const simulateApiDelay = (delay: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delay))
}