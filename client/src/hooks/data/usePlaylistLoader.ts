/**
 * @file usePlaylistLoader.ts
 * @description Hook for loading and caching playlists
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import type { PlaylistItem } from 'types/playlist'
import { getCachedPlaylistsWithTTL, setCachedPlaylistsWithTTL } from '@utils/playlistCache'

export const usePlaylistLoader = (spotifyApi: SpotifyApi | null, user: any) => {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load playlists with cache
  const loadDataWithCache = useCallback(
    async (forceRefresh = false) => {
      setLoading(true)
      setError(null)

      // Try cache first
      if (!forceRefresh) {
        const cached = getCachedPlaylistsWithTTL()
        if (cached && cached.playlists && cached.playlists.length > 0) {
          setPlaylists(cached.playlists)
          setLoading(false)
          return
        }
      }

      try {
        if (!spotifyApi) {
          throw new Error('Spotify API not initialized')
        }
        
        const userPlaylists = await spotifyApi.playlists.getUserPlaylists({ limit: 50 })
        let playlistItems: PlaylistItem[] = userPlaylists.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          images: (playlist.images || []).map((img: any) => ({
            url: img.url,
            height: img.height || undefined,
            width: img.width || undefined,
          })),
          owner: {
            display_name: playlist.owner.display_name || 'Unknown',
            id: playlist.owner.id,
          },
          tracks: {
            total: playlist.tracks.total,
          },
        }))

        // Fetch Liked Songs as a pseudo-playlist
        let likedSongs: any = null
        try {
          const likedTracksResp = await spotifyApi.tracks.getSavedTracks({ limit: 1 })
          likedSongs = {
            id: 'liked-songs',
            name: 'Liked Songs',
            description: 'Your liked songs',
            images: [{ url: '/liked-songs.png', height: 64, width: 64 }],
            owner: { display_name: 'You', id: 'me' },
            tracks: { total: likedTracksResp.total },
          }
        } catch (err: any) {
          likedSongs = null
        }
        
        if (likedSongs) {
          playlistItems = [likedSongs, ...playlistItems]
        }
        
        setPlaylists(playlistItems)
        setCachedPlaylistsWithTTL(playlistItems)
      } catch (err) {
        setError('Failed to load playlists')
      } finally {
        setLoading(false)
      }
    },
    [spotifyApi],
  )

  const handleRefresh = useCallback(() => {
    loadDataWithCache(true)
  }, [loadDataWithCache])

  useEffect(() => {
    if (spotifyApi && user) {
      loadDataWithCache()
    }
  }, [spotifyApi, user, loadDataWithCache])

  return {
    playlists,
    loading,
    error,
    loadDataWithCache,
    handleRefresh,
  }
}