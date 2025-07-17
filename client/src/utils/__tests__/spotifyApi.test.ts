/**
 * @file spotifyApi.test.ts
 * @description Test file for refactored Spotify API utility
 */

import { SpotifyApi } from '../spotifyApi'

describe('SpotifyApi', () => {
  let spotify: SpotifyApi

  beforeEach(() => {
    // Initialize without access token for basic testing
    spotify = new SpotifyApi()
  })

  test('should initialize with correct structure', () => {
    expect(spotify).toBeDefined()
    expect(spotify.playlist).toBeDefined()
    expect(spotify.track).toBeDefined()
    expect(spotify.album).toBeDefined()
    expect(spotify.artist).toBeDefined()
    expect(spotify.search).toBeDefined()
    expect(spotify.player).toBeDefined()
  })

  test('should allow setting access token', () => {
    expect(() => {
      spotify.setAccessToken('new-test-token')
    }).not.toThrow()
  })

  test('should allow clearing access token', () => {
    expect(() => {
      spotify.clearAccessToken()
    }).not.toThrow()
  })

  test('should have all required methods on playlist', () => {
    expect(typeof spotify.playlist.getUserPlaylists).toBe('function')
    expect(typeof spotify.playlist.create).toBe('function')
    expect(typeof spotify.playlist.addTracks).toBe('function')
    expect(typeof spotify.playlist.getTracks).toBe('function')
    expect(typeof spotify.playlist.getById).toBe('function')
  })

  test('should have all required methods on track', () => {
    expect(typeof spotify.track.getSavedTracks).toBe('function')
    expect(typeof spotify.track.getLikedSongsAlbums).toBe('function')
    expect(typeof spotify.track.getById).toBe('function')
    expect(typeof spotify.track.getByIds).toBe('function')
  })

  test('should have all required methods on album', () => {
    expect(typeof spotify.album.getById).toBe('function')
    expect(typeof spotify.album.getByIds).toBe('function')
    expect(typeof spotify.album.getTracks).toBe('function')
  })

  test('should have all required methods on artist', () => {
    expect(typeof spotify.artist.getById).toBe('function')
    expect(typeof spotify.artist.getAlbums).toBe('function')
    expect(typeof spotify.artist.getTopTracks).toBe('function')
    expect(typeof spotify.artist.getRelatedArtists).toBe('function')
  })

  test('should have all required methods on search', () => {
    expect(typeof spotify.search.search).toBe('function')
    expect(typeof spotify.search.tracks).toBe('function')
    expect(typeof spotify.search.albums).toBe('function')
    expect(typeof spotify.search.artists).toBe('function')
    expect(typeof spotify.search.playlists).toBe('function')
  })

  test('should have all required methods on player', () => {
    expect(typeof spotify.player.getCurrentlyPlaying).toBe('function')
    expect(typeof spotify.player.getPlaybackState).toBe('function')
  })
})
