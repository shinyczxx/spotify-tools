/**
 * @file trackRetrieval.utils.ts
 * @description Utilities for retrieving tracks from playlists and track operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import spotifyApi from '../api'
import { SpotifyTrack } from 'spotify-api-lib'

/**
 * Utilities for track retrieval and operations
 */
export class TrackRetrieval {
  /**
   * Get all unique tracks from selected playlists
   */
  async getTracksFromPlaylists(
    playlistIds: string[],
    accessToken: string,
  ): Promise<SpotifyTrack[]> {
    const allTracks = new Set<string>()
    const trackMap = new Map<string, SpotifyTrack>()
    let totalFetched = 0
    let playlistsProcessed = 0

    for (const playlistId of playlistIds) {
      try {
        playlistsProcessed++
        let tracksFromPlaylist = 0
        let url = playlistId === 'liked-songs' ? '/me/tracks' : `/playlists/${playlistId}/tracks`

        // Handle pagination
        let pageNumber = 1
        while (url) {
          const response = await spotifyApi.get(url)

          const tracks = response.data.items
            .map((item: any) => (playlistId === 'liked-songs' ? item.track : item.track))
            .filter((track: any) => track && track.id) // Filter out null/undefined tracks

          for (const track of tracks) {
            if (!allTracks.has(track.id)) {
              allTracks.add(track.id)
              trackMap.set(track.id, track)
              tracksFromPlaylist++
              totalFetched++
            }
          }

          url = response.data.next
            ? response.data.next.replace('https://api.spotify.com/v1', '')
            : null
          pageNumber++
        }
      } catch (error) {
        console.error(`Error fetching tracks for playlist ${playlistId}:`, error)
      }
    }

    const result = Array.from(trackMap.values())

    return result
  }

  /**
   * Extract unique albums from tracks
   */
  extractAlbumsFromTracks(tracks: SpotifyTrack[]): any[] {
    const albumMap = new Map<string, any>()
    
    for (const track of tracks) {
      if (track.album && !albumMap.has(track.album.id)) {
        albumMap.set(track.album.id, track.album)
      }
    }
    
    return Array.from(albumMap.values())
  }
}