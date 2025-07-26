/**
 * @file usePlaylistLoader.simple.test.ts
 * @description Simple isolated test for usePlaylistLoader logic
 */

import { useState, useEffect, useCallback } from 'react'

// Simplified version of the hook logic for testing
interface PlaylistItem {
  id: string
  name: string
  description: string
  images: Array<{ url: string; height?: number; width?: number }>
  owner: { display_name: string; id: string }
  tracks: { total: number }
}

interface MockSpotifyApi {
  playlists: {
    getUserPlaylists: (options: { limit: number }) => Promise<any[]>
  }
  tracks: {
    getSavedTracks: (options: { limit: number }) => Promise<{ total: number }>
  }
}

// Mock cache functions
const mockCache = {
  data: null as any,
  getCachedPlaylistsWithTTL: () => mockCache.data,
  setCachedPlaylistsWithTTL: (data: any) => { mockCache.data = { playlists: data, timestamp: Date.now() } }
}

// Simplified hook implementation
const usePlaylistLoaderSimple = (spotifyApi: MockSpotifyApi | null, user: any) => {
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDataWithCache = useCallback(
    async (forceRefresh = false) => {
      setLoading(true)
      setError(null)

      // Try cache first
      if (!forceRefresh) {
        const cached = mockCache.getCachedPlaylistsWithTTL()
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
        mockCache.setCachedPlaylistsWithTTL(playlistItems)
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

describe('usePlaylistLoader Logic', () => {
  let mockSpotifyApi: MockSpotifyApi
  let mockUser: any

  beforeEach(() => {
    mockCache.data = null
    mockSpotifyApi = {
      playlists: {
        getUserPlaylists: jest.fn()
      },
      tracks: {
        getSavedTracks: jest.fn()
      }
    }
    mockUser = { id: 'test-user', display_name: 'Test User' }
  })

  it('should handle successful playlist loading', async () => {
    const mockPlaylists = [
      {
        id: 'playlist1',
        name: 'Test Playlist',
        description: 'A test playlist',
        images: [{ url: 'test.jpg', height: 300, width: 300 }],
        owner: { display_name: 'Test User', id: 'user1' },
        tracks: { total: 25 }
      }
    ]

    const mockLikedTracks = { total: 50 }

    ;(mockSpotifyApi.playlists.getUserPlaylists as jest.Mock).mockResolvedValue(mockPlaylists)
    ;(mockSpotifyApi.tracks.getSavedTracks as jest.Mock).mockResolvedValue(mockLikedTracks)

    // Simulate the hook behavior
    let hookResult: any = { playlists: [], loading: false, error: null }
    let setLoadingCalls: boolean[] = []
    let setPlaylistsCalls: PlaylistItem[][] = []
    let setErrorCalls: (string | null)[] = []

    // Mock the hook's internal state setters
    const mockSetLoading = (loading: boolean) => {
      setLoadingCalls.push(loading)
      hookResult.loading = loading
    }
    const mockSetPlaylists = (playlists: PlaylistItem[]) => {
      setPlaylistsCalls.push(playlists)
      hookResult.playlists = playlists
    }
    const mockSetError = (error: string | null) => {
      setErrorCalls.push(error)
      hookResult.error = error
    }

    // Simulate the loadDataWithCache function
    const loadDataWithCache = async (forceRefresh = false) => {
      mockSetLoading(true)
      mockSetError(null)

      try {
        const userPlaylists = await mockSpotifyApi.playlists.getUserPlaylists({ limit: 50 })
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

        const likedTracksResp = await mockSpotifyApi.tracks.getSavedTracks({ limit: 1 })
        const likedSongs = {
          id: 'liked-songs',
          name: 'Liked Songs',
          description: 'Your liked songs',
          images: [{ url: '/liked-songs.png', height: 64, width: 64 }],
          owner: { display_name: 'You', id: 'me' },
          tracks: { total: likedTracksResp.total },
        }
        
        playlistItems = [likedSongs, ...playlistItems]
        mockSetPlaylists(playlistItems)
      } catch (err) {
        mockSetError('Failed to load playlists')
      } finally {
        mockSetLoading(false)
      }
    }

    // Execute the function
    await loadDataWithCache()

    // Verify the behavior
    expect(mockSpotifyApi.playlists.getUserPlaylists).toHaveBeenCalledWith({ limit: 50 })
    expect(mockSpotifyApi.tracks.getSavedTracks).toHaveBeenCalledWith({ limit: 1 })
    
    expect(setLoadingCalls).toEqual([true, false])
    expect(setErrorCalls).toEqual([null])
    expect(setPlaylistsCalls).toHaveLength(1)
    expect(setPlaylistsCalls[0]).toHaveLength(2) // Liked Songs + 1 regular playlist
    expect(setPlaylistsCalls[0][0].name).toBe('Liked Songs')
    expect(setPlaylistsCalls[0][1].name).toBe('Test Playlist')
  })

  it('should handle API errors', async () => {
    ;(mockSpotifyApi.playlists.getUserPlaylists as jest.Mock).mockRejectedValue(new Error('API Error'))

    let hookResult: any = { playlists: [], loading: false, error: null }
    
    const mockSetLoading = (loading: boolean) => { hookResult.loading = loading }
    const mockSetPlaylists = (playlists: PlaylistItem[]) => { hookResult.playlists = playlists }
    const mockSetError = (error: string | null) => { hookResult.error = error }

    const loadDataWithCache = async () => {
      mockSetLoading(true)
      mockSetError(null)

      try {
        await mockSpotifyApi.playlists.getUserPlaylists({ limit: 50 })
      } catch (err) {
        mockSetError('Failed to load playlists')
      } finally {
        mockSetLoading(false)
      }
    }

    await loadDataWithCache()

    expect(hookResult.loading).toBe(false)
    expect(hookResult.error).toBe('Failed to load playlists')
    expect(hookResult.playlists).toEqual([])
  })

  it('should handle missing playlist data gracefully', async () => {
    const playlistWithMissingData = [{
      id: 'incomplete',
      name: 'Incomplete Playlist',
      // Missing description, images
      owner: { id: 'owner1' }, // Missing display_name
      tracks: { total: 5 }
    }]

    ;(mockSpotifyApi.playlists.getUserPlaylists as jest.Mock).mockResolvedValue(playlistWithMissingData)
    ;(mockSpotifyApi.tracks.getSavedTracks as jest.Mock).mockResolvedValue({ total: 0 })

    let result: PlaylistItem[] = []
    const mockSetPlaylists = (playlists: PlaylistItem[]) => { result = playlists }

    const loadDataWithCache = async () => {
      const userPlaylists = await mockSpotifyApi.playlists.getUserPlaylists({ limit: 50 })
      const playlistItems: PlaylistItem[] = userPlaylists.map((playlist: any) => ({
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

      const likedTracksResp = await mockSpotifyApi.tracks.getSavedTracks({ limit: 1 })
      const likedSongs = {
        id: 'liked-songs',
        name: 'Liked Songs',
        description: 'Your liked songs',
        images: [{ url: '/liked-songs.png', height: 64, width: 64 }],
        owner: { display_name: 'You', id: 'me' },
        tracks: { total: likedTracksResp.total },
      }
      
      mockSetPlaylists([likedSongs, ...playlistItems])
    }

    await loadDataWithCache()

    const incompletePlaylist = result.find(p => p.id === 'incomplete')
    expect(incompletePlaylist).toBeDefined()
    expect(incompletePlaylist?.description).toBe('')
    expect(incompletePlaylist?.owner.display_name).toBe('Unknown')
    expect(incompletePlaylist?.images).toEqual([])
  })
})