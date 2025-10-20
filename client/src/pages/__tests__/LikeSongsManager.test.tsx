/**
 * @file LikeSongsManager.test.tsx
 * @description Unit tests for LikeSongsManager component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-10-20
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LikeSongsManager from '../LikeSongsManager'
import { SpotifyApi } from 'spotify-api-lib'

// Mock the hooks
jest.mock('@hooks/auth/useSpotifyAuth', () => ({
  useSpotifyAuth: jest.fn(() => ({
    accessToken: 'mock-access-token',
    user: {
      id: 'test-user-id',
      display_name: 'Test User',
    },
  })),
}))

// Mock SpotifyApi
jest.mock('spotify-api-lib', () => ({
  SpotifyApi: jest.fn().mockImplementation(() => ({
    tracks: {
      getSavedTracks: jest.fn(),
      removeTracks: jest.fn(),
    },
    playlists: {
      createPlaylist: jest.fn(),
      addTracks: jest.fn(),
    },
  })),
}))

describe('LikeSongsManager', () => {
  const mockTracks = [
    {
      added_at: '2023-01-01T00:00:00Z',
      track: {
        id: 'track1',
        name: 'Test Song 1',
        artists: [{ id: 'artist1', name: 'Test Artist' }],
        album: {
          id: 'album1',
          name: 'Test Album',
          images: [{ url: 'http://example.com/image1.jpg', height: 64, width: 64 }],
        },
        duration_ms: 200000,
        uri: 'spotify:track:track1',
      },
    },
    {
      added_at: '2023-01-02T00:00:00Z',
      track: {
        id: 'track2',
        name: 'Test Song 1', // Duplicate name
        artists: [{ id: 'artist1', name: 'Test Artist' }],
        album: {
          id: 'album1',
          name: 'Test Album',
          images: [{ url: 'http://example.com/image1.jpg', height: 64, width: 64 }],
        },
        duration_ms: 200000,
        uri: 'spotify:track:track2',
      },
    },
    {
      added_at: '2023-01-03T00:00:00Z',
      track: {
        id: 'track3',
        name: 'Test Song 2',
        artists: [{ id: 'artist2', name: 'Different Artist' }],
        album: {
          id: 'album2',
          name: 'Different Album',
          images: [{ url: 'http://example.com/image2.jpg', height: 64, width: 64 }],
        },
        duration_ms: 180000,
        uri: 'spotify:track:track3',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
  })

  it('should render loading state initially', () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn(() => new Promise(() => {})) // Never resolves

    render(<LikeSongsManager />)

    expect(screen.getByText('Loading liked songs...')).toBeInTheDocument()
  })

  it('should fetch and display liked songs', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/Found 3 liked songs/)).toBeInTheDocument()
    })
  })

  it('should detect definite duplicates correctly', async () => {
    const duplicateTracks = [
      {
        added_at: '2023-01-01T00:00:00Z',
        track: {
          id: 'track1',
          name: 'Same Song',
          artists: [
            { id: 'artist1', name: 'Artist A' },
            { id: 'artist2', name: 'Artist B' },
          ],
          album: { id: 'album1', name: 'Same Album', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
          duration_ms: 200000,
          uri: 'spotify:track:track1',
        },
      },
      {
        added_at: '2023-01-02T00:00:00Z',
        track: {
          id: 'track2',
          name: 'Same Song',
          artists: [
            { id: 'artist2', name: 'Artist B' }, // Different order
            { id: 'artist1', name: 'Artist A' },
          ],
          album: { id: 'album1', name: 'Same Album', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
          duration_ms: 200500, // Within 1 second tolerance
          uri: 'spotify:track:track2',
        },
      },
    ]

    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: duplicateTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/1 groups containing duplicates/)).toBeInTheDocument()
    })
  })

  it('should detect probable duplicates correctly', async () => {
    const probableDuplicates = [
      {
        added_at: '2023-01-01T00:00:00Z',
        track: {
          id: 'track1',
          name: 'Song Name',
          artists: [{ id: 'artist1', name: 'Artist A' }],
          album: { id: 'album1', name: 'Album 1', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
          duration_ms: 200000,
          uri: 'spotify:track:track1',
        },
      },
      {
        added_at: '2023-01-02T00:00:00Z',
        track: {
          id: 'track2',
          name: 'Song Name', // Same name
          artists: [{ id: 'artist1', name: 'Artist A' }], // Same artist
          album: { id: 'album2', name: 'Album 2', images: [{ url: 'img.jpg', height: 64, width: 64 }] }, // Different album
          duration_ms: 180000, // Different duration
          uri: 'spotify:track:track2',
        },
      },
    ]

    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: probableDuplicates,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/1 groups containing duplicates/)).toBeInTheDocument()
    })
  })

  it('should expand and collapse duplicate groups', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks.slice(0, 2), // Only duplicates
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/1 groups containing duplicates/)).toBeInTheDocument()
    })

    // Find and click the group header
    const groupHeader = screen.getByText('Test Song 1').closest('.group-header')
    fireEvent.click(groupHeader!)

    // Should expand and show sections
    await waitFor(() => {
      expect(screen.getByText(/Definite Duplicates/)).toBeInTheDocument()
    })
  })

  it('should toggle duplicate selection', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks.slice(0, 2),
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/1 groups containing duplicates/)).toBeInTheDocument()
    })

    // Expand the group
    const groupHeader = screen.getByText('Test Song 1').closest('.group-header')
    fireEvent.click(groupHeader!)

    // Expand definite duplicates section
    await waitFor(() => {
      const sectionHeader = screen.getByText(/Definite Duplicates/)
      fireEvent.click(sectionHeader)
    })

    // Find checkbox and click it
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
      fireEvent.click(checkboxes[0])
    })

    // Should show "Unlike Selected (1)"
    await waitFor(() => {
      expect(screen.getByText(/Unlike Selected \(1\)/)).toBeInTheDocument()
    })
  })

  it('should enable backup playlist option', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      const backupCheckbox = screen.getByLabelText('Backup removals to new playlist')
      fireEvent.click(backupCheckbox)
    })

    // Backup input should be visible
    const backupInput = screen.getByPlaceholderText('Playlist name')
    expect(backupInput).toBeInTheDocument()
    expect(backupInput).toHaveValue('Removed Duplicate Songs')
  })

  it('should update backup playlist name', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      const backupCheckbox = screen.getByLabelText('Backup removals to new playlist')
      fireEvent.click(backupCheckbox)
    })

    const backupInput = screen.getByPlaceholderText('Playlist name')
    fireEvent.change(backupInput, { target: { value: 'My Custom Backup' } })

    expect(backupInput).toHaveValue('My Custom Backup')
  })

  it('should show error when no duplicates selected for removal', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      const unlikeButton = screen.getByText(/Unlike Selected \(0\)/)
      expect(unlikeButton).toBeDisabled()
    })
  })

  it('should remove duplicates when confirmed', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks.slice(0, 2),
    })
    mockApi.tracks.removeTracks = jest.fn().mockResolvedValue(undefined)

    window.confirm = jest.fn(() => true)

    render(<LikeSongsManager />)

    // Wait for load and expand group
    await waitFor(() => {
      const groupHeader = screen.getByText('Test Song 1').closest('.group-header')
      fireEvent.click(groupHeader!)
    })

    // Expand section and select duplicate
    await waitFor(() => {
      const sectionHeader = screen.getByText(/Definite Duplicates/)
      fireEvent.click(sectionHeader)
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
    })

    // Click unlike button
    await waitFor(() => {
      const unlikeButton = screen.getByText(/Unlike Selected \(1\)/)
      fireEvent.click(unlikeButton)
    })

    // Should call confirm
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled()
    })

    // Should call removeTracks
    await waitFor(() => {
      expect(mockApi.tracks.removeTracks).toHaveBeenCalled()
    })
  })

  it('should create backup playlist when enabled', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks.slice(0, 2),
    })
    mockApi.tracks.removeTracks = jest.fn().mockResolvedValue(undefined)
    mockApi.playlists.createPlaylist = jest.fn().mockResolvedValue({
      id: 'new-playlist-id',
    })
    mockApi.playlists.addTracks = jest.fn().mockResolvedValue(undefined)

    window.confirm = jest.fn(() => true)

    render(<LikeSongsManager />)

    // Enable backup
    await waitFor(() => {
      const backupCheckbox = screen.getByLabelText('Backup removals to new playlist')
      fireEvent.click(backupCheckbox)
    })

    // Expand and select duplicate
    await waitFor(() => {
      const groupHeader = screen.getByText('Test Song 1').closest('.group-header')
      fireEvent.click(groupHeader!)
    })

    await waitFor(() => {
      const sectionHeader = screen.getByText(/Definite Duplicates/)
      fireEvent.click(sectionHeader)
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[1]) // Select actual track checkbox
    })

    // Click unlike
    await waitFor(() => {
      const unlikeButton = screen.getByText(/Unlike Selected \(1\)/)
      fireEvent.click(unlikeButton)
    })

    // Should create backup playlist
    await waitFor(() => {
      expect(mockApi.playlists.createPlaylist).toHaveBeenCalled()
      expect(mockApi.playlists.addTracks).toHaveBeenCalled()
    })
  })

  it('should not remove duplicates when cancelled', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks.slice(0, 2),
    })
    mockApi.tracks.removeTracks = jest.fn()

    window.confirm = jest.fn(() => false)

    render(<LikeSongsManager />)

    await waitFor(() => {
      const groupHeader = screen.getByText('Test Song 1').closest('.group-header')
      fireEvent.click(groupHeader!)
    })

    await waitFor(() => {
      const sectionHeader = screen.getByText(/Definite Duplicates/)
      fireEvent.click(sectionHeader)
    })

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])
    })

    await waitFor(() => {
      const unlikeButton = screen.getByText(/Unlike Selected \(1\)/)
      fireEvent.click(unlikeButton)
    })

    // Should not call removeTracks
    expect(mockApi.tracks.removeTracks).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockRejectedValue(new Error('API Error'))

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load liked songs')).toBeInTheDocument()
    })
  })

  it('should refresh liked songs', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: mockTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/Found 3 liked songs/)).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockApi.tracks.getSavedTracks).toHaveBeenCalledTimes(2)
    })
  })

  it('should display no duplicates message when none found', async () => {
    const uniqueTracks = [
      {
        added_at: '2023-01-01T00:00:00Z',
        track: {
          id: 'track1',
          name: 'Unique Song 1',
          artists: [{ id: 'artist1', name: 'Artist 1' }],
          album: { id: 'album1', name: 'Album 1', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
          duration_ms: 200000,
          uri: 'spotify:track:track1',
        },
      },
      {
        added_at: '2023-01-02T00:00:00Z',
        track: {
          id: 'track2',
          name: 'Unique Song 2',
          artists: [{ id: 'artist2', name: 'Artist 2' }],
          album: { id: 'album2', name: 'Album 2', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
          duration_ms: 180000,
          uri: 'spotify:track:track2',
        },
      },
    ]

    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: uniqueTracks,
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText('No duplicates found! Your liked songs are clean.')).toBeInTheDocument()
    })
  })

  it('should format duration correctly', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: [
        {
          added_at: '2023-01-01T00:00:00Z',
          track: {
            id: 'track1',
            name: 'Test Song',
            artists: [{ id: 'artist1', name: 'Artist' }],
            album: { id: 'album1', name: 'Album', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
            duration_ms: 125000, // 2:05
            uri: 'spotify:track:track1',
          },
        },
      ],
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      expect(screen.getByText(/2:05/)).toBeInTheDocument()
    })
  })

  it('should format date correctly', async () => {
    const mockApi = new SpotifyApi('token')
    mockApi.tracks.getSavedTracks = jest.fn().mockResolvedValue({
      items: [
        {
          added_at: '2023-06-15T14:30:00Z',
          track: {
            id: 'track1',
            name: 'Test Song',
            artists: [{ id: 'artist1', name: 'Artist' }],
            album: { id: 'album1', name: 'Album', images: [{ url: 'img.jpg', height: 64, width: 64 }] },
            duration_ms: 200000,
            uri: 'spotify:track:track1',
          },
        },
      ],
    })

    render(<LikeSongsManager />)

    await waitFor(() => {
      const dateRegex = /Liked.*6\/15\/2023|15\/6\/2023|2023-06-15/
      expect(screen.getByText(dateRegex)).toBeInTheDocument()
    })
  })
})
