/**
 * @file playlistCreation.utils.ts
 * @description Utilities for creating Spotify playlists from album collections
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import SpotifyApi, { SpotifyAlbum } from 'spotify-api-lib'
import type { ShuffleType } from '../../../types/album'

/**
 * Playlist creation utilities
 */
export class PlaylistCreation {
  /**
   * Generate a unique playlist name
   */
  generatePlaylistName(
    albums: SpotifyAlbum[],
    shuffleType: ShuffleType,
    selectedCount?: number,
  ): string {
    const date = new Date().toLocaleDateString()
    const shuffleTypeNames = {
      'random': 'Random',
      'weighted': 'Weighted (Newer)',
      'weighted-older': 'Weighted (Older)',
      'chronological': 'Chronological',
    }

    // Use selectedCount if provided, otherwise use total albums length
    const albumCount = selectedCount ?? albums.length
    const shuffleName = shuffleTypeNames[shuffleType]

    return `Album Shuffle - ${shuffleName} (${albumCount} albums) - ${date}`
  }

  /**
   * Create a Spotify playlist from shuffled albums
   */
  async createSpotifyPlaylist(
    albums: SpotifyAlbum[],
    playlistName: string,
    isPublic: boolean,
    accessToken: string,
  ): Promise<{ id: string; external_urls: { spotify: string } }> {
    try {
      const spotify = new SpotifyApi(accessToken)

      // Create the playlist
      const createResponse = await spotify.playlists.create(playlistName, {
        description: `Album shuffle playlist created on ${new Date().toLocaleDateString()}`,
        public: isPublic,
      })

      const playlistId = createResponse.id

      // Get all track URIs from albums
      const trackUris: string[] = []

      for (const album of albums) {
        try {
          const tracksData = await spotify.albums.getTracks(album.id)
          const tracks = tracksData.items || []
          trackUris.push(...tracks.map((track) => track.uri))
        } catch (error) {
          console.error(`Error fetching album tracks for ${album.id}:`, error)
        }
      }

      // Add tracks to playlist
      if (trackUris.length > 0) {
        await spotify.playlists.addTracks(playlistId, trackUris)
      }

      return createResponse
    } catch (error) {
      console.error('Error creating playlist:', error)
      throw new Error('Failed to create playlist')
    }
  }
}