/**
 * @file getNonStandardPlaylists.ts
 * @description Utility to fetch and construct non-standard Spotify playlists (Liked Songs, Discover Weekly, Daylist) as virtual playlist objects for use in selectors and shufflers.
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-08
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation
 */

import api from './api'
import type { PlaylistItem } from '../components/PlaylistSelector/PlaylistSelector'

/**
 * Fetches non-standard Spotify playlists (Liked Songs, Discover Weekly, Daylist) as virtual playlist objects.
 * @param accessToken Spotify API access token
 * @returns Promise<PlaylistItem[]>
 */
export async function getNonStandardPlaylists(accessToken: string): Promise<PlaylistItem[]> {
  //
  // Fetch liked songs count
  const likedSongsResponse = await api.get('/me/tracks?limit=1')
  //
  let totalLikedSongs = 0
  if (typeof likedSongsResponse.data.total === 'number') {
    totalLikedSongs = likedSongsResponse.data.total
  } else if (
    likedSongsResponse.data.data &&
    typeof likedSongsResponse.data.data.total === 'number'
  ) {
    totalLikedSongs = likedSongsResponse.data.data.total
  } else if (
    Array.isArray(likedSongsResponse.data.items) &&
    typeof likedSongsResponse.data.limit === 'number'
  ) {
    totalLikedSongs = likedSongsResponse.data.items.length
  } else {
    //
  }

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
  //

  // Fetch all playlists to find Discover Weekly and Daylist
  const playlistsResponse = await api.get('/me/playlists')
  const items = playlistsResponse.data.items as PlaylistItem[]

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
