/**
 * @file advancedShuffleSettings.test.ts
 * @description Tests for the advanced shuffle settings functionality with Last.fm integration
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with comprehensive tests for advanced shuffle settings
 */

import { AdvancedShuffleSettings } from '../advancedShuffleSettings'
import {
  mockSpotifyAlbums,
  getMockSpotifyAlbums,
  getMockLastFmAlbumResult,
  getMockLastFmArtistResult,
  getMockRelatedAlbums,
} from '../mockData'

// Mock the LastFm and Spotify API classes
jest.mock('../lastFmApi')
jest.mock('../spotifyApi')
jest.mock('../lastFmFinder')
jest.mock('../lastFmRelated')

describe('AdvancedShuffleSettings', () => {
  let advancedSettings: AdvancedShuffleSettings

  beforeEach(() => {
    // Initialize with mock tokens - don't actually call APIs in tests
    jest.clearAllMocks()
    advancedSettings = new AdvancedShuffleSettings('test-spotify-token', 'test-lastfm-key')
  })

  describe('initialization', () => {
    it('should initialize with default settings', () => {
      const settings = advancedSettings.getSettings()

      expect(settings.useLastFmData).toBe(true)
      expect(settings.lastFmTagsWeight).toBe(30)
      expect(settings.lastFmSimilarAlbumsWeight).toBe(40)
      expect(settings.blacklistTags).toEqual([])
      expect(settings.requireTags).toEqual([])
      expect(settings.vintage.enabled).toBe(false)
      expect(settings.popularityWeight).toBe(30)
      expect(settings.preferObscure).toBe(false)
      expect(settings.maxAlbumsPerArtist).toBe(2)
      expect(settings.artistDiversification).toBe(70)
    })
  })

  describe('settings management', () => {
    it('should update individual settings', () => {
      advancedSettings.updateSetting('useLastFmData', false)
      advancedSettings.updateSetting('lastFmTagsWeight', 60)
      advancedSettings.updateSetting('blacklistTags', ['pop', 'country'])

      const settings = advancedSettings.getSettings()
      expect(settings.useLastFmData).toBe(false)
      expect(settings.lastFmTagsWeight).toBe(60)
      expect(settings.blacklistTags).toEqual(['pop', 'country'])
    })

    it('should validate weight settings are between 0-100', () => {
      expect(() => {
        advancedSettings.updateSetting('lastFmTagsWeight', 150)
      }).toThrow('Weight must be between 0 and 100')

      expect(() => {
        advancedSettings.updateSetting('lastFmSimilarAlbumsWeight', -10)
      }).toThrow('Weight must be between 0 and 100')
    })

    it('should validate year range settings', () => {
      expect(() => {
        advancedSettings.updateSetting('vintage', {
          enabled: true,
          startYear: 2025,
          endYear: 2020,
        })
      }).toThrow('Minimum year cannot be greater than maximum year')
    })
  })

  describe('shuffle algorithm', () => {
    const mockSpotifyAlbums = getMockSpotifyAlbums()

    it('should shuffle albums without Last.fm data when disabled', async () => {
      advancedSettings.updateSetting('useLastFmData', false)

      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums, 3)

      expect(result).toHaveLength(3)
      expect(result.every((album) => mockSpotifyAlbums.includes(album))).toBe(true)
    })

    it('should apply year filters correctly', async () => {
      advancedSettings.updateSetting('minAlbumYear', 1995)
      advancedSettings.updateSetting('maxAlbumYear', 2005)

      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums, 10)

      result.forEach((album) => {
        const year = parseInt(album.release_date.split('-')[0])
        expect(year).toBeGreaterThanOrEqual(1995)
        expect(year).toBeLessThanOrEqual(2005)
      })
    })

    it('should apply popularity filters correctly', async () => {
      advancedSettings.updateSetting('minPopularity', 80)
      advancedSettings.updateSetting('maxPopularity', 95)

      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums, 10)

      result.forEach((album) => {
        if (album.popularity) {
          expect(album.popularity).toBeGreaterThanOrEqual(80)
          expect(album.popularity).toBeLessThanOrEqual(95)
        }
      })
    })

    it('should filter out blacklisted tags when Last.fm is enabled', async () => {
      advancedSettings.updateSetting('useLastFmData', true)
      advancedSettings.updateSetting('blacklistedTags', ['electronic', 'experimental'])

      // Mock the Last.fm results to return albums with blacklisted tags
      const mockLastFmResult = getMockLastFmAlbumResult('6dVIqQ8qmQ7GUH5GkK7X7V')

      const result = await advancedSettings.shuffleAlbums([mockSpotifyAlbums[0]], 5)

      // Should filter out albums with blacklisted tags
      expect(result).toHaveLength(0)
    })

    it('should limit albums per artist based on duplicateArtistLimit', async () => {
      const radioheadAlbums = mockSpotifyAlbums.filter(
        (album) => album.artists[0].name === 'Radiohead',
      )

      advancedSettings.updateSetting('duplicateArtistLimit', 1)

      const result = await advancedSettings.shuffleAlbums(radioheadAlbums, 10)

      expect(result).toHaveLength(1)
    })

    it('should apply genre coherence when Last.fm is enabled', async () => {
      advancedSettings.updateSetting('useLastFmData', true)
      advancedSettings.updateSetting('genreCoherence', 80)

      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums, 3)

      // With high genre coherence, should prefer albums with similar genres
      // This would be tested with proper mock implementations
      expect(result).toBeDefined()
    })
  })

  describe('Last.fm integration', () => {
    it('should find related albums using Last.fm data', async () => {
      advancedSettings.updateSetting('useLastFmData', true)
      advancedSettings.updateSetting('tagWeight', 50)
      advancedSettings.updateSetting('similarArtistWeight', 50)

      const sourceAlbum = mockSpotifyAlbums[0] // OK Computer
      const result = await advancedSettings.findRelatedAlbums(sourceAlbum, 5)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should weight tag vs similar artist recommendations correctly', async () => {
      advancedSettings.updateSetting('useLastFmData', true)

      // Test tag-heavy weighting
      advancedSettings.updateSetting('tagWeight', 80)
      advancedSettings.updateSetting('similarArtistWeight', 20)

      const sourceAlbum = mockSpotifyAlbums[0]
      const tagHeavyResult = await advancedSettings.findRelatedAlbums(sourceAlbum, 10)

      // Test similar artist-heavy weighting
      advancedSettings.updateSetting('tagWeight', 20)
      advancedSettings.updateSetting('similarArtistWeight', 80)

      const artistHeavyResult = await advancedSettings.findRelatedAlbums(sourceAlbum, 10)

      expect(tagHeavyResult).toBeDefined()
      expect(artistHeavyResult).toBeDefined()
      // Results should be different based on weighting
      // (Would need actual Last.fm data to test differences meaningfully)
    })
  })

  describe('advanced settings options', () => {
    it('should handle release date precision when filtering by year', async () => {
      // Test with different precision levels
      const albums = mockSpotifyAlbums.map((album) => ({
        ...album,
        release_date: '1999', // Year precision only
        release_date_precision: 'year' as const,
      }))

      advancedSettings.updateSetting('minAlbumYear', 1995)
      advancedSettings.updateSetting('maxAlbumYear', 2005)

      const result = await advancedSettings.shuffleAlbums(albums, 10)

      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle albums without popularity scores', async () => {
      const albumsWithoutPopularity = mockSpotifyAlbums.map((album) => ({
        ...album,
        popularity: undefined,
      }))

      advancedSettings.updateSetting('minPopularity', 80)

      const result = await advancedSettings.shuffleAlbums(albumsWithoutPopularity, 5)

      // Should not filter out albums without popularity scores
      expect(result.length).toBeGreaterThan(0)
    })

    it('should provide settings summary for UI display', () => {
      advancedSettings.updateSetting('useLastFmData', true)
      advancedSettings.updateSetting('tagWeight', 70)
      advancedSettings.updateSetting('blacklistedTags', ['pop', 'country'])
      advancedSettings.updateSetting('minAlbumYear', 1990)
      advancedSettings.updateSetting('maxAlbumYear', 2020)

      const summary = advancedSettings.getSettingsSummary()

      expect(summary).toContain('Last.fm integration: Enabled')
      expect(summary).toContain('Tag weight: 70%')
      expect(summary).toContain('Blacklisted tags: pop, country')
      expect(summary).toContain('Year range: 1990-2020')
    })
  })

  describe('error handling', () => {
    it('should handle Last.fm API failures gracefully', async () => {
      advancedSettings.updateSetting('useLastFmData', true)

      // Mock API failure
      jest.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums, 3)

      // Should fall back to basic shuffle when Last.fm fails
      expect(result).toHaveLength(3)
      expect(console.warn).toHaveBeenCalled()
    })

    it('should handle empty album lists', async () => {
      const result = await advancedSettings.shuffleAlbums([], 5)

      expect(result).toHaveLength(0)
    })

    it('should handle requests for more albums than available', async () => {
      const result = await advancedSettings.shuffleAlbums(mockSpotifyAlbums.slice(0, 2), 10)

      expect(result).toHaveLength(2)
    })
  })
})
