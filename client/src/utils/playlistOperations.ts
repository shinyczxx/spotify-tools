/**
 * @file playlistOperations.ts
 * @description Utility functions for playlist operations and track processing
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import { SpotifyApi } from 'spotify-api-lib'
import type { SpotifyTrack, SpotifyAlbum } from 'spotify-api-lib'
import type { AlbumShuffleSettings, ShuffleSettings, ShuffledTrack } from 'types/playlist'

/**
 * Find the real album for a track by searching artist's albums
 */
export const findRealAlbum = async (
  track: SpotifyTrack,
  spotifyApi: SpotifyApi,
): Promise<SpotifyTrack> => {
  if (!track.artists?.[0]?.id) return track

  try {
    // Get all albums by the primary artist
    const artistAlbums = await spotifyApi.artists.getAlbums(track.artists[0].id, {
      include_groups: ['album'],
      limit: 50,
    })

    // Search through each album for this track
    for (const album of artistAlbums.items) {
      const albumTracks = await spotifyApi.albums.getTracks(album.id, { limit: 50 })
      const foundTrack = albumTracks.items.find(
        (t: any) => t.name.toLowerCase() === track.name.toLowerCase(),
      )

      if (foundTrack) {
        // Update track with real album info
        return {
          ...track,
          album: album,
        }
      }
    }
  } catch (err) {
    console.warn('Failed to find real album for track:', track.name)
  }

  return track
}

/**
 * Get tracks from a playlist or liked songs
 */
export const getPlaylistTracks = async (
  playlistId: string,
  spotifyApi: SpotifyApi,
): Promise<any[]> => {
  if (playlistId === 'liked-songs') {
    const savedTracks = await spotifyApi.tracks.getSavedTracks({ limit: 50 })
    return savedTracks.items.map((item: any) => ({ track: item.track }))
  } else {
    const tracksResponse = await spotifyApi.playlists.getTracks(playlistId, { limit: 50 })
    return tracksResponse.items
  }
}

/**
 * Shuffle albums based on settings and return tracks in album order
 */
export const shuffleAlbums = async (
  selectedPlaylists: string[],
  albumShuffleSettings: AlbumShuffleSettings,
  spotifyApi: SpotifyApi,
): Promise<ShuffledTrack[]> => {
  const allTracks: ShuffledTrack[] = []

  // Get tracks from each selected playlist
  for (const playlistId of selectedPlaylists) {
    const tracksResponse = await getPlaylistTracks(playlistId, spotifyApi)

    // Convert to ShuffledTrack format with album info
    let tracksWithAlbumInfo: ShuffledTrack[] = tracksResponse.map((item: any) => ({
      ...item.track,
      albumName: item.track.album?.name || 'Unknown Album',
      albumId: item.track.album?.id || 'unknown',
    }))

    // If settings allow, find real albums for singles/compilations
    if (albumShuffleSettings.allowSingles || albumShuffleSettings.allowCompilations) {
      const processedTracks = []
      for (const track of tracksWithAlbumInfo) {
        if (track.album?.album_type === 'single' || track.album?.album_type === 'compilation') {
          const realTrack = await findRealAlbum(track, spotifyApi)
          processedTracks.push({
            ...realTrack,
            albumName: realTrack.album?.name || track.albumName,
            albumId: realTrack.album?.id || track.albumId,
          })
        } else {
          processedTracks.push(track)
        }
      }
      tracksWithAlbumInfo = processedTracks
    }

    allTracks.push(...tracksWithAlbumInfo)
  }

  // Group tracks by album
  const albumGroups = new Map<string, ShuffledTrack[]>()
  allTracks.forEach((track) => {
    const albumKey = track.albumId
    if (!albumGroups.has(albumKey)) {
      albumGroups.set(albumKey, [])
    }
    albumGroups.get(albumKey)!.push(track)
  })

  // Filter albums based on settings
  let albumKeys = Array.from(albumGroups.keys())

  if (!albumShuffleSettings.allowSingles) {
    albumKeys = albumKeys.filter((key) => {
      const tracks = albumGroups.get(key) || []
      return tracks.length > 3 // Assume albums with >3 tracks are not singles
    })
  }

  if (!albumShuffleSettings.allowCompilations) {
    albumKeys = albumKeys.filter((key) => {
      const tracks = albumGroups.get(key) || []
      const firstTrack = tracks[0]
      return firstTrack?.album?.album_type !== 'compilation'
    })
  }

  // Limit to specified number of albums
  if (
    albumShuffleSettings.numberOfAlbums > 0 &&
    albumKeys.length > albumShuffleSettings.numberOfAlbums
  ) {
    albumKeys = albumKeys.slice(0, albumShuffleSettings.numberOfAlbums)
  }

  // Shuffle albums, then concatenate tracks in album order
  const shuffledAlbumKeys = albumKeys.sort(() => Math.random() - 0.5)

  const shuffledResult: ShuffledTrack[] = []
  shuffledAlbumKeys.forEach((albumKey) => {
    const albumTracks = albumGroups.get(albumKey) || []
    shuffledResult.push(...albumTracks)
  })

  return shuffledResult
}

/**
 * Combine playlists with shuffle settings
 */
export const combinePlaylists = async (
  selectedPlaylists: string[],
  shuffleSettings: ShuffleSettings,
  spotifyApi: SpotifyApi,
): Promise<SpotifyTrack[]> => {
  const allTracks: SpotifyTrack[] = []

  // Get tracks from each selected playlist
  for (const playlistId of selectedPlaylists) {
    const tracksResponse = await getPlaylistTracks(playlistId, spotifyApi)
    allTracks.push(...tracksResponse.map((item: any) => item.track))
  }

  // Remove duplicates by track ID
  const uniqueTracks = allTracks.filter(
    (track, index, self) => index === self.findIndex((t) => t.id === track.id),
  )

  // Apply shuffle settings
  let finalTracks = uniqueTracks
  if (shuffleSettings.algorithm === 'random') {
    finalTracks = [...uniqueTracks].sort(() => Math.random() - 0.5)
  }
  // 'none' keeps original order

  return finalTracks
}

/**
 * Create a new playlist from tracks
 */
export const createPlaylistFromTracks = async (
  tracks: SpotifyTrack[],
  name: string,
  isPublic: boolean,
  spotifyApi: SpotifyApi,
): Promise<{ external_urls: { spotify: string } } | null> => {
  if (tracks.length === 0) return null

  // Create new playlist
  const newPlaylist = await spotifyApi.playlists.create(name, {
    description: `Created with Album Shuffle on ${new Date().toLocaleDateString()}`,
    public: isPublic,
  })

  // Add tracks to playlist in batches (Spotify limit is 100 per request)
  const batchSize = 100
  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize)
    const trackUris = batch.map((track) => track.uri)
    await spotifyApi.playlists.addTracks(newPlaylist.id, trackUris)
  }

  return newPlaylist
}