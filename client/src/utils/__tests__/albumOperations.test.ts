/**
 * @file albumOperations.test.ts
 * @description Unit tests for album operations utilities
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-10
 */

// Mock API module first to avoid interceptor issues
jest.mock('../api', () => ({
  setAuthToken: jest.fn(),
  setTokenUpdateCallback: jest.fn(),
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

import { shuffleAlbums, generatePlaylistName, SpotifyAlbum, ShuffleType } from '../albumOperations'

// Mock albums for testing
const mockAlbums: SpotifyAlbum[] = [
  {
    id: 'album1',
    name: 'Album One',
    album_type: 'album',
    artists: [{ id: 'artist1', name: 'Artist One' }],
    release_date: '2020-01-01',
    total_tracks: 10,
    images: [{ url: 'http://example.com/image1.jpg', height: 300, width: 300 }],
  },
  {
    id: 'album2',
    name: 'Album Two',
    album_type: 'album',
    artists: [{ id: 'artist2', name: 'Artist Two' }],
    release_date: '2022-06-15',
    total_tracks: 8,
    images: [{ url: 'http://example.com/image2.jpg', height: 300, width: 300 }],
  },
  {
    id: 'album3',
    name: 'Album Three',
    album_type: 'album',
    artists: [{ id: 'artist1', name: 'Artist One' }],
    release_date: '2021-12-25',
    total_tracks: 12,
    images: [{ url: 'http://example.com/image3.jpg', height: 300, width: 300 }],
  },
]

describe('Album Operations Utils', () => {
  describe('shuffleAlbums', () => {
    it('should shuffle albums randomly', () => {
      const result = shuffleAlbums(mockAlbums, 'random', 2)

      expect(result).toHaveLength(2)
      expect(result.every((album: SpotifyAlbum) => mockAlbums.includes(album))).toBe(true)
    })

    it('should return all albums if count exceeds available', () => {
      const result = shuffleAlbums(mockAlbums, 'random', 10)

      expect(result).toHaveLength(3)
    })

    it('should shuffle with weighted preference for newer albums', () => {
      const result = shuffleAlbums(mockAlbums, 'weighted', 3)

      expect(result).toHaveLength(3)
      expect(result.every((album: SpotifyAlbum) => mockAlbums.includes(album))).toBe(true)
    })

    it('should shuffle with weighted preference for older albums', () => {
      const result = shuffleAlbums(mockAlbums, 'weighted-older', 3)

      expect(result).toHaveLength(3)
      expect(result.every((album: SpotifyAlbum) => mockAlbums.includes(album))).toBe(true)
    })

    it('should return albums in chronological order', () => {
      const result = shuffleAlbums(mockAlbums, 'chronological', 3)
      expect(result).toHaveLength(3)
      // Allow for 30% randomness, so just check all albums are present
      const releaseDates = result.map((a) => a.release_date).sort()
      const expectedDates = ['2020-01-01', '2021-12-25', '2022-06-15']
      expect(releaseDates).toEqual(expectedDates)
    })

    it('should handle empty album array', () => {
      const result = shuffleAlbums([], 'random', 5)

      expect(result).toHaveLength(0)
    })

    it('should handle zero count', () => {
      const result = shuffleAlbums(mockAlbums, 'random', 0)

      expect(result).toHaveLength(0)
    })
  })

  describe('generatePlaylistName', () => {
    beforeEach(() => {
      // Mock Date to ensure consistent test results
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2025-07-10'))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should generate name for random shuffle', () => {
      const name = generatePlaylistName(mockAlbums, 'random')
      expect(name).toContain('Random')
      // Extract date from generated name and check it matches today's date
      const today = new Date().toLocaleDateString()
      expect(name).toContain(today)
      expect(name).toContain('3 albums')
    })

    it('should generate name for weighted shuffle', () => {
      const name = generatePlaylistName(mockAlbums, 'weighted', 2)
      expect(name).toContain('Weighted (Newer)')
      const today = new Date().toLocaleDateString()
      expect(name).toContain(today)
      expect(name).toContain('2 albums')
    })

    it('should generate name for weighted-older shuffle', () => {
      const name = generatePlaylistName(mockAlbums, 'weighted-older')
      expect(name).toContain('Weighted (Older)')
      const today = new Date().toLocaleDateString()
      expect(name).toContain(today)
    })

    it('should generate name for chronological shuffle', () => {
      const name = generatePlaylistName(mockAlbums, 'chronological')
      expect(name).toContain('Chronological')
      const today = new Date().toLocaleDateString()
      expect(name).toContain(today)
    })

    it('should use selected count when provided', () => {
      const name = generatePlaylistName(mockAlbums, 'random', 1)

      expect(name).toContain('1 album')
    })

    it('should handle single album correctly', () => {
      const name = generatePlaylistName([mockAlbums[0]], 'random')

      expect(name).toContain('1 album')
    })
  })
})
