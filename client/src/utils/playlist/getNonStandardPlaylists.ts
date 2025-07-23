/**
 * @file getNonStandardPlaylists.ts
 * @description Utility to fetch and construct non-standard Spotify playlists (Liked Songs, Discover Weekly, Daylist) as virtual playlist objects for use in selectors and shufflers.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-08
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation
 */

import SpotifyApi from 'spotify-api-lib'
import type { PlaylistItem } from 'types/spotify'

/**
 * Fetches non-standard Spotify playlists (Liked Songs, Discover Weekly, Daylist) as virtual playlist objects.
 * @param accessToken Spotify API access token
 * @returns Promise<PlaylistItem[]>
 */
export async function getNonStandardPlaylists(accessToken: string): Promise<PlaylistItem[]> {
  const spotify = new SpotifyApi()
  spotify.setAccessToken(accessToken)
  
  // Fetch liked songs count using the API
  const likedSongsResponse = await spotify.tracks.getSavedTracks({ limit: 1, offset: 0 })
  let totalLikedSongs = likedSongsResponse.total || 0

  const likedSongsPlaylist: PlaylistItem = {
    id: 'liked-songs',
    name: 'Liked Songs',
    description: 'Your saved tracks',
    images: [
      {
        url: 'https://misc.scdn.co/liked-songs/liked-songs-64.png',
        height: 64,
        width: 64,
      },
    ],
    owner: {
      display_name: 'You',
      id: 'current_user',
    },
    tracks: {
      total: totalLikedSongs,
    },
  }

  // Fetch all playlists to find Discover Weekly and Daylist
  const items = await spotify.playlists.getUserPlaylists({ limit: 50, offset: 0 }) as PlaylistItem[]

  // Find Discover Weekly and Daylist by name and owner
  const discoverWeekly = items.find(
    (p) =>
      p.name.toLowerCase() === 'discover weekly' &&
      (p.owner.display_name.toLowerCase().includes('spotify') || p.owner.id === 'spotify'),
  )
  const daylist = items.find(
    (p) =>
      p.name.toLowerCase() === 'daylist' &&
      (p.owner.display_name.toLowerCase().includes('spotify') || p.owner.id === 'spotify'),
  )

  // Only include if found
  const specialPlaylists: PlaylistItem[] = [likedSongsPlaylist]
  if (discoverWeekly) specialPlaylists.push(discoverWeekly)
  if (daylist) specialPlaylists.push(daylist)

  return specialPlaylists
}
