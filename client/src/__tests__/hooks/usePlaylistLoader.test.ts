/**
 * @file usePlaylistLoader.test.ts
 * @description Tests for usePlaylistLoader hook with mock Spotify API
 */

import { renderHook, waitFor } from '@testing-library/react'
import { usePlaylistLoader } from '../../hooks/data/usePlaylistLoader'
import * as playlistCacheModule from '../../utils/playlist/playlistCache'

// Mock the cache utilities
jest.mock('../../utils/playlist/playlistCache')

const mockGetCachedPlaylistsWithTTL = playlistCacheModule.getCachedPlaylistsWithTTL as jest.MockedFunction<typeof playlistCacheModule.getCachedPlaylistsWithTTL>
const mockSetCachedPlaylistsWithTTL = playlistCacheModule.setCachedPlaylistsWithTTL as jest.MockedFunction<typeof playlistCacheModule.setCachedPlaylistsWithTTL>

// Mock Spotify API
const mockSpotifyApi = {
  playlists: {
    getUserPlaylists: jest.fn()
  },
  tracks: {
    getSavedTracks: jest.fn()
  }
}

const mockUser = {
  id: 'test-user',
  display_name: 'Test User'
}

const mockPlaylistsFromApi = [
  {
    id: 'playlist1',
    name: 'Test Playlist 1',
    description: 'First test playlist',
    images: [{ url: 'https://example.com/image1.jpg', height: 300, width: 300 }],
    owner: { display_name: 'Test User', id: 'user1' },
    tracks: { total: 25 }
  },
  {
    id: 'playlist2',
    name: 'Test Playlist 2', 
    description: 'Second test playlist',
    images: [{ url: 'https://example.com/image2.jpg', height: 300, width: 300 }],
    owner: { display_name: 'Another User', id: 'user2' },
    tracks: { total: 15 }
  }
]

const mockLikedTracksResponse = {
  total: 50
}

describe('usePlaylistLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCachedPlaylistsWithTTL.mockReturnValue(null)
    mockSpotifyApi.playlists.getUserPlaylists.mockResolvedValue(mockPlaylistsFromApi)
    mockSpotifyApi.tracks.getSavedTracks.mockResolvedValue(mockLikedTracksResponse)
  })

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => usePlaylistLoader(null, null))
    
    expect(result.current.playlists).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should not load playlists when spotifyApi or user is null', () => {
    const { result } = renderHook(() => usePlaylistLoader(null, mockUser))
    
    expect(result.current.playlists).toEqual([])
    expect(mockSpotifyApi.playlists.getUserPlaylists).not.toHaveBeenCalled()
  })

  it('should load playlists when spotifyApi and user are provided', async () => {
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    // Should start loading
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should have called the API
    expect(mockSpotifyApi.playlists.getUserPlaylists).toHaveBeenCalledWith({ limit: 50 })
    expect(mockSpotifyApi.tracks.getSavedTracks).toHaveBeenCalledWith({ limit: 1 })
    
    // Should have playlists including liked songs
    expect(result.current.playlists).toHaveLength(3) // 2 regular + 1 liked songs
    expect(result.current.playlists[0].name).toBe('Liked Songs')
    expect(result.current.playlists[1].name).toBe('Test Playlist 1')
    expect(result.current.playlists[2].name).toBe('Test Playlist 2')
  })

  it('should use cached playlists when available', async () => {
    const cachedData = {
      playlists: [
        {
          id: 'cached1',
          name: 'Cached Playlist',
          description: 'From cache',
          images: [],
          owner: { display_name: 'Cached User', id: 'cached' },
          tracks: { total: 10 }
        }
      ],
      timestamp: Date.now()
    }
    
    mockGetCachedPlaylistsWithTTL.mockReturnValue(cachedData)
    
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should use cached data and not call API
    expect(mockSpotifyApi.playlists.getUserPlaylists).not.toHaveBeenCalled()
    expect(result.current.playlists).toEqual(cachedData.playlists)
  })

  it('should handle API errors gracefully', async () => {
    mockSpotifyApi.playlists.getUserPlaylists.mockRejectedValue(new Error('API Error'))
    
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load playlists')
    expect(result.current.playlists).toEqual([])
  })

  it('should handle liked songs API error gracefully', async () => {
    mockSpotifyApi.tracks.getSavedTracks.mockRejectedValue(new Error('Liked songs error'))
    
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should still have regular playlists, just no liked songs
    expect(result.current.playlists).toHaveLength(2)
    expect(result.current.error).toBe(null)
  })

  it('should refresh playlists when handleRefresh is called', async () => {
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Clear the mock and call refresh
    jest.clearAllMocks()
    mockSpotifyApi.playlists.getUserPlaylists.mockResolvedValue([])
    mockSpotifyApi.tracks.getSavedTracks.mockResolvedValue({ total: 0 })
    
    result.current.handleRefresh() 
    
    // Should start loading again
    expect(result.current.loading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should have called API again (forcing refresh)
    expect(mockSpotifyApi.playlists.getUserPlaylists).toHaveBeenCalled()
  })

  it('should cache playlists after successful load', async () => {
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Should have cached the results
    expect(mockSetCachedPlaylistsWithTTL).toHaveBeenCalled()
    const cachedPlaylists = mockSetCachedPlaylistsWithTTL.mock.calls[0][0]
    expect(cachedPlaylists).toHaveLength(3) // 2 regular + liked songs
  })

  it('should handle missing playlist properties gracefully', async () => {
    const playlistWithMissingData = [{
      id: 'incomplete',
      name: 'Incomplete Playlist',
      // Missing description, images, etc.
      owner: { id: 'owner1' }, // Missing display_name
      tracks: { total: 5 }
    }]
    
    mockSpotifyApi.playlists.getUserPlaylists.mockResolvedValue(playlistWithMissingData)
    
    const { result } = renderHook(() => usePlaylistLoader(mockSpotifyApi as any, mockUser))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const playlist = result.current.playlists.find(p => p.id === 'incomplete')
    expect(playlist).toBeDefined()
    expect(playlist?.description).toBe('')
    expect(playlist?.owner.display_name).toBe('Unknown')
    expect(playlist?.images).toEqual([])
  })
})