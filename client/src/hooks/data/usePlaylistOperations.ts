/**
 * @file usePlaylistOperations.ts
 * @description Custom hook for loading playlists, including non-standard playlists, for use in selectors and shufflers.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-08
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation
 */

import { useCallback } from 'react'
import { getNonStandardPlaylists } from '@utils'
import axios from 'axios'
import type { PlaylistItem } from '@components/PlaylistSelector/PlaylistSelector'
import { extractPlaylistMetadata } from '@utils'

export function usePlaylistOperations() {
  // Loads all playlists, including non-standard ones
  const loadPlaylists = useCallback(async (accessToken: string) => {
    //
    // Fetch playlists from API
    const apiPlaylistsResponse = await axios.get('/api/playlists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const apiPlaylists = apiPlaylistsResponse.data?.items || apiPlaylistsResponse.data || []
    //
    // Filter out any broken liked-songs playlist
    const filteredApiPlaylists = apiPlaylists.filter((p: any) => p.id !== 'liked-songs')
    //
    // Get non-standard playlists (virtuals)
    //
    const nonStandardPlaylists = await getNonStandardPlaylists(accessToken)
    //
    // Merge
    const mergedPlaylists = [...nonStandardPlaylists, ...filteredApiPlaylists]
    //
    // Extract metadata
    return { playlists: mergedPlaylists, metadata: extractPlaylistMetadata(mergedPlaylists) }
  }, [])

  // Placeholder for albums (if needed)
  const loadAlbums = useCallback(async () => {
    return []
  }, [])

  return { loadPlaylists, loadAlbums }
}
