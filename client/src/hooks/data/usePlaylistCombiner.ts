/**
 * @file usePlaylistCombiner.ts
 * @description Hook for playlist combining operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import type { SpotifyTrack } from 'spotify-api-lib'
import type { ShuffleSettings } from 'types/playlist'
import { combinePlaylists as combinePlaylistsUtil } from '@utils/playlist/playlistOperations'

export const usePlaylistCombiner = (spotifyApi: SpotifyApi | null) => {
  const [combinedTracks, setCombinedTracks] = useState<SpotifyTrack[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useState<ShuffleSettings>({
    algorithm: 'random',
  })

  const combinePlaylists = useCallback(async (selectedPlaylists: string[]) => {
    if (!spotifyApi || selectedPlaylists.length === 0) return

    setProcessing(true)
    setError(null)

    try {
      const result = await combinePlaylistsUtil(selectedPlaylists, settings, spotifyApi)
      setCombinedTracks(result)
    } catch (err) {
      console.error('Error combining playlists:', err)
      setError('Failed to combine playlists')
    } finally {
      setProcessing(false)
    }
  }, [spotifyApi, settings])

  return {
    combinedTracks,
    processing,
    error,
    settings,
    setSettings,
    combinePlaylists,
    setCombinedTracks,
  }
}