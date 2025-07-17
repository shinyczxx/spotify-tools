/**
 * @file spotifyApiHelpers.ts
 * @description Helper functions for direct Spotify API calls
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-10
 */

import api from './api'

/**
 * Create a new playlist for the current user
 */
export async function createPlaylist(
  playlistName: string,
  description: string = '',
  isPublic: boolean = false,
): Promise<any> {
  try {
    // Get current user info first
    const userResponse = await api.get('/me')
    const userId = userResponse.data.id

    // Create the playlist
    const createResponse = await api.post(`/users/${userId}/playlists`, {
      name: playlistName,
      description:
        description || `Album shuffle playlist created on ${new Date().toLocaleDateString()}`,
      public: isPublic,
    })

    return createResponse.data
  } catch (error) {
    console.error('Error creating playlist:', error)
    throw new Error('Failed to create playlist')
  }
}

/**
 * Add tracks to a playlist
 */
export async function addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
  try {
    const batchSize = 100
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize)
      await api.post(`/playlists/${playlistId}/tracks`, {
        uris: batch,
      })
    }
  } catch (error) {
    console.error('Error adding tracks to playlist:', error)
    throw new Error('Failed to add tracks to playlist')
  }
}

/**
 * Get user's playlists
 */
export async function getUserPlaylists(): Promise<any[]> {
  try {
    let allPlaylists: any[] = []
    let url = '/me/playlists?limit=50'

    while (url) {
      const response = await api.get(url)
      allPlaylists = allPlaylists.concat(response.data.items)
      url = response.data.next ? response.data.next.replace('https://api.spotify.com/v1', '') : null
    }

    return allPlaylists
  } catch (error) {
    console.error('Error fetching playlists:', error)
    throw new Error('Failed to fetch playlists')
  }
}

/**
 * Get user's saved tracks (liked songs)
 */
export async function getUserSavedTracks(limit: number = 50, offset: number = 0): Promise<any> {
  try {
    const response = await api.get(`/me/tracks?limit=${limit}&offset=${offset}`)
    return response.data
  } catch (error) {
    console.error('Error fetching saved tracks:', error)
    throw new Error('Failed to fetch saved tracks')
  }
}

/**
 * Get tracks from a playlist
 */
export async function getPlaylistTracks(
  playlistId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<any> {
  try {
    const response = await api.get(
      `/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching playlist tracks:', error)
    throw new Error('Failed to fetch playlist tracks')
  }
}

/**
 * Get album details
 */
export async function getAlbum(albumId: string): Promise<any> {
  try {
    const response = await api.get(`/albums/${albumId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching album:', error)
    throw new Error('Failed to fetch album')
  }
}

/**
 * Get artist's albums
 */
export async function getArtistAlbums(
  artistId: string,
  includeGroups: string = 'album',
  limit: number = 50,
): Promise<any> {
  try {
    const response = await api.get(
      `/artists/${artistId}/albums?include_groups=${includeGroups}&limit=${limit}`,
    )
    return response.data
  } catch (error) {
    console.error('Error fetching artist albums:', error)
    throw new Error('Failed to fetch artist albums')
  }
}

/**
 * Get currently playing track
 */
export async function getCurrentlyPlaying(): Promise<any> {
  try {
    const response = await api.get('/me/player/currently-playing')
    return response.data
  } catch (error) {
    console.error('Error fetching currently playing:', error)
    throw new Error('Failed to fetch currently playing track')
  }
}

/**
 * Search for tracks, albums, artists, etc.
 */
export async function search(
  query: string,
  type: string = 'track',
  limit: number = 20,
): Promise<any> {
  try {
    const response = await api.get(
      `/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
    )
    return response.data
  } catch (error) {
    console.error('Error searching:', error)
    throw new Error('Failed to search')
  }
}

/**
 * Get albums from user's liked songs
 */
export async function getLikedSongsAlbums(fetchLimit: number = 500): Promise<any[]> {
  try {
    const albumsMap = new Map<string, any>()
    const singlesMap = new Map<string, any>()
    let offset = 0
    let fetchedItems = 0
    const limit = 50

    while (fetchLimit === null || fetchedItems < fetchLimit) {
      const response = await api.get(`/me/tracks?limit=${limit}&offset=${offset}`)
      const items = response.data.items

      if (items.length === 0) break

      fetchedItems += items.length

      items.forEach((item: any) => {
        if (item.track && item.track.album) {
          const album = item.track.album
          if (album.album_type === 'single') {
            singlesMap.set(album.id, {
              id: album.id,
              name: album.name,
              artists: album.artists,
              artistIds: album.artists.map((a: any) => a.id),
              track: item.track.name,
              images: album.images,
              release_date: album.release_date,
              album_type: album.album_type,
            })
          }
          if (!albumsMap.has(album.id)) {
            albumsMap.set(album.id, {
              id: album.id,
              name: album.name,
              artists: album.artists.map((a: any) => a.name).join(', '),
              release_date: album.release_date,
              total_tracks: album.total_tracks,
              images: album.images,
              album_type: album.album_type,
            })
          }
        }
      })

      offset += limit
    }

    return Array.from(albumsMap.values())
  } catch (error) {
    console.error('Error fetching liked songs albums:', error)
    throw new Error('Failed to fetch liked songs albums')
  }
}
