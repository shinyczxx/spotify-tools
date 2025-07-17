/**
 * @file lastFmApi.test.ts
 * @description Test file for Last.fm API utility
 */

import { LastFm } from '../lastFmApi'

describe('LastFm API', () => {
  let lastFm: LastFm

  beforeEach(() => {
    // Initialize without API key for basic testing
    lastFm = new LastFm('test-api-key')
  })

  test('should initialize with correct structure', () => {
    expect(lastFm).toBeDefined()
    expect(lastFm.album).toBeDefined()
    expect(lastFm.artist).toBeDefined()
    expect(lastFm.track).toBeDefined()
    expect(lastFm.tag).toBeDefined()
  })

  test('should allow setting API key', () => {
    expect(() => {
      lastFm.setApiKey('new-test-key')
    }).not.toThrow()
  })

  test('should have all required methods on album', () => {
    expect(typeof lastFm.album.getTopTags).toBe('function')
    expect(typeof lastFm.album.getInfo).toBe('function')
    expect(typeof lastFm.album.search).toBe('function')
  })

  test('should have all required methods on artist', () => {
    expect(typeof lastFm.artist.getSimilar).toBe('function')
    expect(typeof lastFm.artist.getTopTags).toBe('function')
    expect(typeof lastFm.artist.getTopAlbums).toBe('function')
    expect(typeof lastFm.artist.getInfo).toBe('function')
    expect(typeof lastFm.artist.search).toBe('function')
  })

  test('should have all required methods on track', () => {
    expect(typeof lastFm.track.getTopTags).toBe('function')
    expect(typeof lastFm.track.getSimilar).toBe('function')
    expect(typeof lastFm.track.getInfo).toBe('function')
    expect(typeof lastFm.track.search).toBe('function')
  })

  test('should have all required methods on tag', () => {
    expect(typeof lastFm.tag.getTopAlbums).toBe('function')
    expect(typeof lastFm.tag.getTopArtists).toBe('function')
    expect(typeof lastFm.tag.getTopTracks).toBe('function')
    expect(typeof lastFm.tag.getInfo).toBe('function')
    expect(typeof lastFm.tag.getSimilar).toBe('function')
    expect(typeof lastFm.tag.getTopTags).toBe('function')
  })
})
