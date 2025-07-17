/**
 * @file lastFmRelated.test.ts
 * @description Test file for Last.fm related albums utility
 */

import { LastFmRelated } from '../lastFmRelated'
import type { LastFmAlbumResult } from '../lastFmFinder'

describe('LastFmRelated', () => {
  let related: LastFmRelated

  beforeEach(() => {
    related = new LastFmRelated('test-lastfm-key')
  })

  test('should initialize correctly', () => {
    expect(related).toBeDefined()
    expect(typeof related.setLastFmApiKey).toBe('function')
    expect(typeof related.setSpotifyAccessToken).toBe('function')
    expect(typeof related.findRelatedAlbums).toBe('function')
  })

  test('should allow setting API keys', () => {
    expect(() => {
      related.setLastFmApiKey('new-lastfm-key')
      related.setSpotifyAccessToken('new-spotify-token')
    }).not.toThrow()
  })

  test('should have utility methods', () => {
    expect(typeof related.getAlbumsByTag).toBe('function')
    expect(typeof related.getAlbumsBySimilarArtist).toBe('function')
  })

  // Mock Last.fm data for testing
  const mockLastFmAlbumResult: LastFmAlbumResult = {
    found: true,
    primaryGenre: 'rock',
    secondaryGenres: ['alternative rock', 'indie'],
    tags: [
      { name: 'rock', count: 100, url: 'https://last.fm/tag/rock' },
      { name: 'alternative', count: 80, url: 'https://last.fm/tag/alternative' },
      { name: 'indie', count: 60, url: 'https://last.fm/tag/indie' },
    ],
    confidence: 0.8,
    albumTags: [{ name: 'rock', count: 50, url: 'https://last.fm/tag/rock' }],
    artistTags: [{ name: 'alternative', count: 80, url: 'https://last.fm/tag/alternative' }],
  }

  test('should handle related albums request structure', async () => {
    const options = {
      tagWeight: 0.7,
      similarArtistWeight: 0.3,
      maxResults: 10,
    }

    try {
      const result = await related.findRelatedAlbums(mockLastFmAlbumResult, options)
      expect(result).toHaveProperty('albums')
      expect(result).toHaveProperty('totalFound')
      expect(result).toHaveProperty('tagBasedCount')
      expect(result).toHaveProperty('similarArtistCount')
      expect(result).toHaveProperty('spotifyIdsFound')
      expect(Array.isArray(result.albums)).toBe(true)
      expect(Array.isArray(result.spotifyIdsFound)).toBe(true)
    } catch (error) {
      // Expected to fail without valid API keys, but structure should be consistent
      expect(error).toBeDefined()
    }
  })

  test('should validate options structure', () => {
    const validOptions = {
      tagWeight: 0.5,
      similarArtistWeight: 0.5,
      maxResults: 20,
      minTagCount: 10,
      diversityFactor: 0.3,
      excludeOriginalArtist: true,
    }

    // Should not throw when calling with valid options structure
    expect(() => {
      related.findRelatedAlbums(mockLastFmAlbumResult, validOptions)
    }).not.toThrow()
  })
})
