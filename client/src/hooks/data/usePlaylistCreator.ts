/**
 * @file usePlaylistCreator.ts
 * @description Hook for playlist creation operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import type { SpotifyTrack } from 'spotify-api-lib'
import { createPlaylistFromTracks as createPlaylistUtil } from '@utils/playlist/playlistOperations'

export const usePlaylistCreator = (
  spotifyApi: SpotifyApi | null,
  onPlaylistCreated?: () => void,
  onModalClose?: () => void,
) => {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [playlistName, setPlaylistName] = useState('shuffled playlist')
  const [playlistPublic, setPlaylistPublic] = useState(false)

  const createPlaylistFromTracks = useCallback(async (
    tracks: SpotifyTrack[],
    name?: string,
    isPublic?: boolean,
  ) => {
    if (!spotifyApi || tracks.length === 0) return null

    const finalName = name || playlistName
    const finalIsPublic = isPublic ?? playlistPublic

    setProcessing(true)
    setError(null)

    try {
      const result = await createPlaylistUtil(tracks, finalName, finalIsPublic, spotifyApi)
      if (onPlaylistCreated) {
        onPlaylistCreated()
      }
      if (onModalClose) {
        onModalClose()
      }
      // alert(`Playlist "${finalName}" created successfully with ${tracks.length} tracks!`) // Disabled - using in-modal button instead
      return result
    } catch (err) {
      console.error('Error creating playlist:', err)
      setError('Failed to create playlist')
      return null
    } finally {
      setProcessing(false)
    }
  }, [spotifyApi, playlistName, playlistPublic, onPlaylistCreated, onModalClose])

  return {
    processing,
    error,
    playlistName,
    setPlaylistName,
    playlistPublic,
    setPlaylistPublic,
    createPlaylistFromTracks,
  }
}