/**
 * @file spotifyApiWrapper.ts
 * @description Wrapper around spotify-api-lib that uses our main spotifyApi client with automatic token refresh
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-24
 */

import spotifyApi from './api'

/**
 * Spotify API wrapper that routes calls through our main API client
 * This ensures all requests benefit from automatic token refresh
 */
export class SpotifyApiWrapper {
  /**
   * Get tracks from a playlist with automatic token refresh
   */
  async getPlaylistTracks(playlistId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options
    
    if (playlistId === 'liked-songs') {
      const response = await spotifyApi.get(`/me/tracks?limit=${limit}&offset=${offset}`)
      return response.data
    } else {
      const response = await spotifyApi.get(`/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`)
      return response.data
    }
  }

  /**
   * Get saved tracks (liked songs) with automatic token refresh
   */
  async getSavedTracks(options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options
    const response = await spotifyApi.get(`/me/tracks?limit=${limit}&offset=${offset}`)
    return response.data
  }

  /**
   * Get user profile with automatic token refresh
   */
  async getUserProfile() {
    const response = await spotifyApi.get('/me')
    return response.data
  }

  /**
   * Get user's playlists with automatic token refresh
   */
  async getUserPlaylists(options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options
    const response = await spotifyApi.get(`/me/playlists?limit=${limit}&offset=${offset}`)
    return response.data
  }

  /**
   * Get playlist details with automatic token refresh
   */
  async getPlaylist(playlistId: string) {
    const response = await spotifyApi.get(`/playlists/${playlistId}`)
    return response.data
  }

  /**
   * Create a new playlist with automatic token refresh
   */
  async createPlaylist(userId: string, data: { name: string; description?: string; public?: boolean }) {
    const response = await spotifyApi.post(`/users/${userId}/playlists`, data)
    return response.data
  }

  /**
   * Add tracks to a playlist with automatic token refresh
   */
  async addTracksToPlaylist(playlistId: string, trackUris: string[]) {
    const response = await spotifyApi.post(`/playlists/${playlistId}/tracks`, {
      uris: trackUris
    })
    return response.data
  }

  /**
   * Get album details with automatic token refresh
   */
  async getAlbum(albumId: string) {
    const response = await spotifyApi.get(`/albums/${albumId}`)
    return response.data
  }

  /**
   * Get album tracks with automatic token refresh
   */
  async getAlbumTracks(albumId: string, options: { limit?: number; offset?: number } = {}) {
    const { limit = 50, offset = 0 } = options
    const response = await spotifyApi.get(`/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`)
    return response.data
  }

  /**
   * Get multiple albums with automatic token refresh
   */
  async getAlbums(albumIds: string[]) {
    const response = await spotifyApi.get(`/albums?ids=${albumIds.join(',')}`)
    return response.data
  }

  /**
   * Search for tracks, albums, artists, etc. with automatic token refresh
   */
  async search(query: string, options: { types?: string[]; limit?: number; offset?: number; market?: string; include_external?: string } = {}) {
    const { types = ['track'], limit = 20, offset = 0, market, include_external } = options
    const typeString = types.join(',')
    const encodedQuery = encodeURIComponent(query)
    
    let url = `/search?q=${encodedQuery}&type=${typeString}&limit=${limit}&offset=${offset}`
    if (market) url += `&market=${market}`
    if (include_external) url += `&include_external=${include_external}`
    
    const response = await spotifyApi.get(url)
    return response.data
  }

  /**
   * Generic GET request with automatic token refresh
   */
  async get(endpoint: string) {
    const response = await spotifyApi.get(endpoint)
    return response.data
  }

  /**
   * Generic POST request with automatic token refresh
   */
  async post(endpoint: string, data?: any) {
    const response = await spotifyApi.post(endpoint, data)
    return response.data
  }
}

// Export singleton instance that matches spotify-api-lib interface
const spotifyApiWrapper = new SpotifyApiWrapper()

// Create a wrapper that mimics the spotify-api-lib structure
export default function createSpotifyApiWrapper() {
  return {
    tracks: {
      getSavedTracks: (options?: { limit?: number; offset?: number }) => 
        spotifyApiWrapper.getSavedTracks(options)
    },
    playlists: {
      getTracks: (playlistId: string, options?: { limit?: number; offset?: number }) => 
        spotifyApiWrapper.getPlaylistTracks(playlistId, options),
      get: (playlistId: string) => 
        spotifyApiWrapper.getPlaylist(playlistId),
      create: (userId: string, data: { name: string; description?: string; public?: boolean }) =>
        spotifyApiWrapper.createPlaylist(userId, data),
      addTracks: (playlistId: string, trackUris: string[]) =>
        spotifyApiWrapper.addTracksToPlaylist(playlistId, trackUris)
    },
    albums: {
      get: (albumId: string) => 
        spotifyApiWrapper.getAlbum(albumId),
      getTracks: (albumId: string, options?: { limit?: number; offset?: number }) => 
        spotifyApiWrapper.getAlbumTracks(albumId, options),
      getMultiple: (albumIds: string[]) =>
        spotifyApiWrapper.getAlbums(albumIds)
    },
    users: {
      getProfile: () => 
        spotifyApiWrapper.getUserProfile(),
      getPlaylists: (options?: { limit?: number; offset?: number }) =>
        spotifyApiWrapper.getUserPlaylists(options)
    },
    search: {
      search: (query: string, options?: { types?: string[]; limit?: number; offset?: number; market?: string; include_external?: string }) =>
        spotifyApiWrapper.search(query, options)
    },
    // Compatibility methods for direct access
    setAccessToken: (token: string) => {
      // No-op since our wrapper handles tokens automatically
    },
    clearAccessToken: () => {
      // No-op since our wrapper handles tokens automatically  
    }
  }
}

// Export both the wrapper instance and the factory function
export { spotifyApiWrapper }