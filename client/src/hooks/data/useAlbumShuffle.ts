/**
 * @file useAlbumShuffle.ts
 * @description Hook for album shuffling operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import type { AlbumShuffleSettings, ShuffledTrack } from 'types/playlist'
import { retrieveAlbumsFromPlaylists } from '@utils/albumRetrieval'

export const useAlbumShuffle = (spotifyApi: SpotifyApi | null) => {
  const [shuffledTracks, setShuffledTracks] = useState<ShuffledTrack[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState<AlbumShuffleSettings>({
    allowSingles: true,
    allowCompilations: true,
    numberOfAlbums: 50,
  })

  const shuffleAlbums = useCallback(async (selectedPlaylists: string[]) => {
    if (!spotifyApi || selectedPlaylists.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      // Use the new caching system to retrieve albums
      const albumResult = await retrieveAlbumsFromPlaylists(selectedPlaylists, spotifyApi, {
        allowSingles: settings.allowSingles,
        allowCompilations: settings.allowCompilations,
        maxAlbums: settings.numberOfAlbums,
        includeAllTracks: true,
      })

      // Show cache status to user
      if (albumResult.fromCache) {
        console.log('Using cached album data - instant results!')
      } else {
        console.log(`Retrieved ${albumResult.albums.length} albums from Spotify API in ${albumResult.stats.processingTimeMs}ms`)
      }

      // Convert tracks to ShuffledTrack format and shuffle by album
      const tracksWithAlbumInfo: ShuffledTrack[] = albumResult.tracks.map(track => ({
        ...track,
        albumName: track.album?.name || 'Unknown Album',
        albumId: track.album?.id || 'unknown',
      }))

      // Group tracks by album and shuffle
      const albumGroups = new Map<string, ShuffledTrack[]>()
      tracksWithAlbumInfo.forEach((track) => {
        const albumKey = track.albumId
        if (!albumGroups.has(albumKey)) {
          albumGroups.set(albumKey, [])
        }
        albumGroups.get(albumKey)!.push(track)
      })

      // Shuffle albums, then concatenate tracks in album order
      const albumKeys = Array.from(albumGroups.keys()).sort(() => Math.random() - 0.5)
      const shuffledResult: ShuffledTrack[] = []
      albumKeys.forEach((albumKey) => {
        const albumTracks = albumGroups.get(albumKey) || []
        shuffledResult.push(...albumTracks)
      })

      setShuffledTracks(shuffledResult)
    } catch (err) {
      console.error('Error shuffling albums:', err)
      setError('Failed to shuffle albums')
    } finally {
      setProcessing(false)
    }
  }, [spotifyApi, settings])

  return {
    shuffledTracks,
    processing,
    error,
    settings,
    setSettings,
    shuffleAlbums,
    setShuffledTracks,
  }
}