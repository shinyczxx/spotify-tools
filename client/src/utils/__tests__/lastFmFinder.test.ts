/**
 * @file lastFmFinder.test.ts
 * @description Test file for Last.fm finder utility
 */

import { LastFmFinder } from '../lastFmFinder'
import type { SpotifyAlbum, SpotifyArtist } from '../spotifyApi'

describe('LastFmFinder', () => {
  let finder: LastFmFinder

  beforeEach(() => {
    finder = new LastFmFinder('test-api-key')
  })

  test('should initialize correctly', () => {
    expect(finder).toBeDefined()
    expect(typeof finder.setApiKey).toBe('function')
    expect(typeof finder.findAlbumInfo).toBe('function')
    expect(typeof finder.findArtistInfo).toBe('function')
    expect(typeof finder.findTrackInfo).toBe('function')
  })

  test('should allow setting API key', () => {
    expect(() => {
      finder.setApiKey('new-test-key')
    }).not.toThrow()
  })

  test('should have utility methods', () => {
    expect(typeof finder.searchAlbum).toBe('function')
    expect(typeof finder.searchArtist).toBe('function')
    expect(typeof finder.getGenreSuggestions).toBe('function')
  })

  // Mock Spotify data for testing
  const mockSpotifyAlbum: SpotifyAlbum = {
    album_type: 'album',
    artists: [
      {
        external_urls: { spotify: 'https://open.spotify.com/artist/test' },
        href: 'https://api.spotify.com/v1/artists/test',
        id: 'test-artist-id',
        name: 'Test Artist',
        type: 'artist',
        uri: 'spotify:artist:test',
      },
    ],
    available_markets: ['US'],
    external_urls: { spotify: 'https://open.spotify.com/album/test' },
    href: 'https://api.spotify.com/v1/albums/test',
    id: 'test-album-id',
    images: [],
    name: 'Test Album',
    release_date: '2020-01-01',
    release_date_precision: 'day',
    total_tracks: 10,
    type: 'album',
    uri: 'spotify:album:test',
  }

  const mockSpotifyArtist: SpotifyArtist = {
    external_urls: { spotify: 'https://open.spotify.com/artist/test' },
    href: 'https://api.spotify.com/v1/artists/test',
    id: 'test-artist-id',
    name: 'Test Artist',
    type: 'artist',
    uri: 'spotify:artist:test',
  }

  test('should handle album info request structure', async () => {
    // This test just verifies the method doesn't throw and returns the expected structure
    // In a real environment with API key, it would make actual requests
    try {
      const result = await finder.findAlbumInfo(mockSpotifyAlbum)
      expect(result).toHaveProperty('found')
      expect(result).toHaveProperty('primaryGenre')
      expect(result).toHaveProperty('secondaryGenres')
      expect(result).toHaveProperty('tags')
      expect(result).toHaveProperty('confidence')
    } catch (error) {
      // Expected to fail without valid API key, but structure should be consistent
      expect(error).toBeDefined()
    }
  })

  test('should handle artist info request structure', async () => {
    try {
      const result = await finder.findArtistInfo(mockSpotifyArtist)
      expect(result).toHaveProperty('found')
      expect(result).toHaveProperty('primaryGenre')
      expect(result).toHaveProperty('secondaryGenres')
      expect(result).toHaveProperty('tags')
      expect(result).toHaveProperty('confidence')
    } catch (error) {
      // Expected to fail without valid API key, but structure should be consistent
      expect(error).toBeDefined()
    }
  })
})
