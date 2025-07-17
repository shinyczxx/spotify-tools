/**
 * @file advancedShuffleSettings.simple.test.ts
 * @description Simplified tests for the advanced shuffle settings functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with basic tests for settings management
 */

import { AdvancedShuffleSettings, defaultAdvancedSettings } from '../advancedShuffleSettings'
import { getMockSpotifyAlbums } from '../mockData'

// Mock the API classes to avoid actual network calls
jest.mock('../lastFmApi')
jest.mock('../spotifyApi')
jest.mock('../lastFmFinder')
jest.mock('../lastFmRelated')

describe('AdvancedShuffleSettings - Basic Functionality', () => {
  let advancedSettings: AdvancedShuffleSettings

  beforeEach(() => {
    jest.clearAllMocks()
    advancedSettings = new AdvancedShuffleSettings('test-spotify-token', 'test-lastfm-key')
  })

  describe('Settings Management', () => {
    it('should initialize with default settings', () => {
      const settings = advancedSettings.getSettings()

      expect(settings.useLastFmData).toBe(defaultAdvancedSettings.useLastFmData)
      expect(settings.lastFmTagsWeight).toBe(defaultAdvancedSettings.lastFmTagsWeight)
      expect(settings.lastFmSimilarAlbumsWeight).toBe(
        defaultAdvancedSettings.lastFmSimilarAlbumsWeight,
      )
      expect(settings.blacklistTags).toEqual(defaultAdvancedSettings.blacklistTags)
      expect(settings.maxAlbumsPerArtist).toBe(defaultAdvancedSettings.maxAlbumsPerArtist)
    })

    it('should update Last.fm settings', () => {
      advancedSettings.updateSetting('useLastFmData', false)
      advancedSettings.updateSetting('lastFmTagsWeight', 60)
      advancedSettings.updateSetting('lastFmSimilarAlbumsWeight', 70)

      const settings = advancedSettings.getSettings()
      expect(settings.useLastFmData).toBe(false)
      expect(settings.lastFmTagsWeight).toBe(60)
      expect(settings.lastFmSimilarAlbumsWeight).toBe(70)
    })

    it('should update tag filtering settings', () => {
      advancedSettings.updateSetting('blacklistTags', ['pop', 'country'])
      advancedSettings.updateSetting('requireTags', ['rock', 'alternative'])

      const settings = advancedSettings.getSettings()
      expect(settings.blacklistTags).toEqual(['pop', 'country'])
      expect(settings.requireTags).toEqual(['rock', 'alternative'])
    })

    it('should validate weight settings (0-100)', () => {
      expect(() => {
        advancedSettings.updateSetting('lastFmTagsWeight', 150)
      }).toThrow('Weight must be between 0 and 100')

      expect(() => {
        advancedSettings.updateSetting('popularityWeight', -10)
      }).toThrow('Weight must be between 0 and 100')
    })

    it('should validate vintage year range', () => {
      expect(() => {
        advancedSettings.updateSetting('vintage', {
          enabled: true,
          startYear: 2025,
          endYear: 2020,
        })
      }).toThrow('Minimum year cannot be greater than maximum year')
    })
  })

  describe('Album Shuffling', () => {
    const mockAlbums = getMockSpotifyAlbums()

    it('should handle simple shuffle without Last.fm', async () => {
      advancedSettings.updateSetting('useLastFmData', false)

      const result = await advancedSettings.shuffleAlbums(mockAlbums, 3)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeLessThanOrEqual(3)
      expect(result.length).toBeLessThanOrEqual(mockAlbums.length)
    })

    it('should respect artist diversity limits', async () => {
      const radioheadAlbums = mockAlbums.filter((album) => album.artists[0].name === 'Radiohead')

      advancedSettings.updateSetting('maxAlbumsPerArtist', 1)
      advancedSettings.updateSetting('useLastFmData', false)

      const result = await advancedSettings.shuffleAlbums(radioheadAlbums, 10)

      expect(result.length).toBeLessThanOrEqual(1)
    })

    it('should filter by vintage years when enabled', async () => {
      advancedSettings.updateSetting('vintage', {
        enabled: true,
        startYear: 1995,
        endYear: 2005,
      })
      advancedSettings.updateSetting('useLastFmData', false)

      const result = await advancedSettings.shuffleAlbums(mockAlbums, 10)

      result.forEach((album) => {
        const year = parseInt(album.release_date.split('-')[0])
        expect(year).toBeGreaterThanOrEqual(1995)
        expect(year).toBeLessThanOrEqual(2005)
      })
    })

    it('should handle empty album array', async () => {
      const result = await advancedSettings.shuffleAlbums([], 5)

      expect(result).toEqual([])
    })

    it('should handle requesting more albums than available', async () => {
      const smallAlbumSet = mockAlbums.slice(0, 2)

      const result = await advancedSettings.shuffleAlbums(smallAlbumSet, 10)

      expect(result.length).toBeLessThanOrEqual(smallAlbumSet.length)
    })
  })

  describe('Settings Summary', () => {
    it('should generate readable settings summary', () => {
      advancedSettings.updateSetting('useLastFmData', true)
      advancedSettings.updateSetting('lastFmTagsWeight', 70)
      advancedSettings.updateSetting('blacklistTags', ['pop', 'country'])
      advancedSettings.updateSetting('vintage', {
        enabled: true,
        startYear: 1990,
        endYear: 2020,
      })

      const summary = advancedSettings.getSettingsSummary()

      expect(typeof summary).toBe('string')
      expect(summary).toContain('Last.fm integration: Enabled')
      expect(summary).toContain('Tag weight: 70%')
      expect(summary).toContain('Blacklisted tags: pop, country')
      expect(summary).toContain('Year range: 1990-2020')
    })

    it('should show disabled Last.fm status', () => {
      advancedSettings.updateSetting('useLastFmData', false)

      const summary = advancedSettings.getSettingsSummary()

      expect(summary).toContain('Last.fm integration: Disabled')
    })
  })

  describe('Error Handling', () => {
    it('should not crash when Last.fm is enabled but APIs fail', async () => {
      const mockAlbums = getMockSpotifyAlbums()
      advancedSettings.updateSetting('useLastFmData', true)

      // Mock console.warn to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await advancedSettings.shuffleAlbums(mockAlbums, 3)

      expect(Array.isArray(result)).toBe(true)

      consoleSpy.mockRestore()
    })
  })
})
