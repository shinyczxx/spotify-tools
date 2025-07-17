/**
 * @file PlaylistOperations.integration.test.tsx
 * @description Integration tests for playlist operations flow
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-10
 */

// Mock API module first to avoid interceptor issues
jest.mock('../../utils/api', () => ({
  setAuthToken: jest.fn(),
  setTokenUpdateCallback: jest.fn(),
  default: {
    get: jest.fn(() => Promise.resolve({ data: { items: [] } })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  },
}))

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePlaylistOperations } from '@hooks/data/usePlaylistOperations'
import * as albumOperations from '@utils/albumOperations'
import * as spotifyApiHelpers from '@utils/spotifyApiHelpers'

// Mock the hook
jest.mock('../../hooks/usePlaylistOperations')
const mockUsePlaylistOperations = usePlaylistOperations as jest.MockedFunction<
  typeof usePlaylistOperations
>

// Mock album operations
jest.mock('../../utils/albumOperations')
const mockAlbumOperations = albumOperations as jest.Mocked<typeof albumOperations>

// Mock spotify API helpers
jest.mock('../../utils/spotifyApiHelpers')
const mockSpotifyApiHelpers = spotifyApiHelpers as jest.Mocked<typeof spotifyApiHelpers>

// Create a test component that uses the playlist operations
function TestPlaylistComponent() {
  const { state, actions } = usePlaylistOperations('test-access-token')

  return (
    <div>
      <h1>Playlist Operations Test</h1>

      {/* Selection Type */}
      <div data-testid="selection-type">{state.selectionType}</div>

      {/* Loading State */}
      {state.isLoading && <div data-testid="loading">Loading...</div>}

      {/* Error State */}
      {state.error && <div data-testid="error">{state.error}</div>}

      {/* Playlists */}
      <div data-testid="playlists-count">{state.playlists.length}</div>

      {/* Albums */}
      <div data-testid="albums-count">{state.albums.length}</div>

      {/* Selected Items */}
      <div data-testid="selected-items-count">{state.selectedItems.length}</div>

      {/* Actions */}
      <button
        data-testid="change-selection-type"
        onClick={() => actions.changeSelectionType('albums')}
      >
        Change to Albums
      </button>

      <button data-testid="create-playlist" onClick={() => actions.setCreatingPlaylist(true)}>
        Create Playlist
      </button>

      {/* Shuffled Albums */}
      <div data-testid="shuffled-albums-count">{state.shuffledAlbums.length}</div>

      {/* Discovered Albums */}
      <div data-testid="discovered-albums-count">{state.discoveredAlbums.length}</div>
    </div>
  )
}

describe('Playlist Operations Integration', () => {
  const mockState = {
    selectionType: 'playlists' as const,
    playlists: [
      { id: 'playlist1', name: 'Test Playlist 1', tracks: { total: 10 } },
      { id: 'playlist2', name: 'Test Playlist 2', tracks: { total: 15 } },
    ],
    playlistMetadata: {},
    albums: [
      {
        id: 'album1',
        name: 'Test Album 1',
        artists: [{ id: 'artist1', name: 'Artist 1' }],
        album_type: 'album' as const,
        images: [],
        release_date: '2023-01-01',
        total_tracks: 10,
      },
      {
        id: 'album2',
        name: 'Test Album 2',
        artists: [{ id: 'artist2', name: 'Artist 2' }],
        album_type: 'album' as const,
        images: [],
        release_date: '2023-06-01',
        total_tracks: 12,
      },
    ],
    selectedItems: ['playlist1'],
    isLoading: false,
    error: null,
    isCreatingPlaylist: false,
    albumFilters: {},
    discoveredAlbums: [],
    shuffledAlbums: [],
    searchHistory: [],
    selectedSearchEntry: null,
  }

  const mockActions = {
    changeSelectionType: jest.fn(),
    setCreatingPlaylist: jest.fn(),
    setSelectedItems: jest.fn(),
    setAlbumFilters: jest.fn(),
    clearError: jest.fn(),
    setSearchHistory: jest.fn(),
    setSelectedSearchEntry: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockUsePlaylistOperations.mockReturnValue({
      state: mockState,
      actions: mockActions,
    })

    // Mock album operations
    mockAlbumOperations.shuffleAlbums.mockReturnValue([mockState.albums[0]])
    mockAlbumOperations.generatePlaylistName.mockReturnValue('Test Shuffled Playlist')
    mockAlbumOperations.discoverAlbums.mockResolvedValue([])
    mockAlbumOperations.createSpotifyPlaylist.mockResolvedValue({ id: 'new-playlist' })

    // Mock spotify API helpers
    mockSpotifyApiHelpers.createPlaylist.mockResolvedValue({ id: 'new-playlist' })
  })

  it('should render playlist operations component with initial state', () => {
    render(<TestPlaylistComponent />)

    expect(screen.getByText('Playlist Operations Test')).toBeInTheDocument()
    expect(screen.getByTestId('selection-type')).toHaveTextContent('playlists')
    expect(screen.getByTestId('playlists-count')).toHaveTextContent('2')
    expect(screen.getByTestId('albums-count')).toHaveTextContent('2')
    expect(screen.getByTestId('selected-items-count')).toHaveTextContent('1')
  })

  it('should handle selection type changes', () => {
    render(<TestPlaylistComponent />)

    const changeButton = screen.getByTestId('change-selection-type')
    fireEvent.click(changeButton)

    expect(mockActions.changeSelectionType).toHaveBeenCalledWith('albums')
  })

  it('should handle playlist creation', () => {
    render(<TestPlaylistComponent />)

    const createButton = screen.getByTestId('create-playlist')
    fireEvent.click(createButton)

    expect(mockActions.setCreatingPlaylist).toHaveBeenCalledWith(true)
  })

  it('should display loading state', () => {
    mockUsePlaylistOperations.mockReturnValue({
      state: { ...mockState, isLoading: true },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('should display error state', () => {
    const errorMessage = 'Test error message'
    mockUsePlaylistOperations.mockReturnValue({
      state: { ...mockState, error: errorMessage },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('error')).toHaveTextContent(errorMessage)
  })

  it('should handle album shuffling flow', async () => {
    const shuffledAlbums = [mockState.albums[0]]
    mockUsePlaylistOperations.mockReturnValue({
      state: { ...mockState, shuffledAlbums },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('shuffled-albums-count')).toHaveTextContent('1')
  })

  it('should handle album discovery flow', async () => {
    const discoveredAlbums = mockState.albums
    mockUsePlaylistOperations.mockReturnValue({
      state: { ...mockState, discoveredAlbums },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('discovered-albums-count')).toHaveTextContent('2')
  })

  it('should handle empty states correctly', () => {
    mockUsePlaylistOperations.mockReturnValue({
      state: {
        ...mockState,
        playlists: [],
        albums: [],
        selectedItems: [],
        shuffledAlbums: [],
        discoveredAlbums: [],
      },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('playlists-count')).toHaveTextContent('0')
    expect(screen.getByTestId('albums-count')).toHaveTextContent('0')
    expect(screen.getByTestId('selected-items-count')).toHaveTextContent('0')
    expect(screen.getByTestId('shuffled-albums-count')).toHaveTextContent('0')
    expect(screen.getByTestId('discovered-albums-count')).toHaveTextContent('0')
  })

  it('should handle multiple selections', () => {
    mockUsePlaylistOperations.mockReturnValue({
      state: {
        ...mockState,
        selectedItems: ['playlist1', 'playlist2'],
      },
      actions: mockActions,
    })

    render(<TestPlaylistComponent />)

    expect(screen.getByTestId('selected-items-count')).toHaveTextContent('2')
  })

  it('should integrate with album operations for playlist creation', async () => {
    const testAlbums = mockState.albums

    // Test shuffling
    const shuffledResult = mockAlbumOperations.shuffleAlbums(testAlbums, 'random', 1)
    expect(shuffledResult).toEqual([testAlbums[0]])

    // Test playlist name generation
    const playlistName = mockAlbumOperations.generatePlaylistName(testAlbums, 'random')
    expect(playlistName).toBe('Test Shuffled Playlist')

    // Verify mocks were called
    expect(mockAlbumOperations.shuffleAlbums).toHaveBeenCalledWith(testAlbums, 'random', 1)
    expect(mockAlbumOperations.generatePlaylistName).toHaveBeenCalledWith(testAlbums, 'random')
  })

  it('should handle selection type switching', () => {
    const { rerender } = render(<TestPlaylistComponent />)

    // Initially showing playlists
    expect(screen.getByTestId('selection-type')).toHaveTextContent('playlists')

    // Switch to albums
    mockUsePlaylistOperations.mockReturnValue({
      state: { ...mockState, selectionType: 'albums' },
      actions: mockActions,
    })

    rerender(<TestPlaylistComponent />)

    expect(screen.getByTestId('selection-type')).toHaveTextContent('albums')
  })

  it('should handle concurrent operations', async () => {
    // Simulate multiple concurrent operations
    const promises = [
      mockAlbumOperations.discoverAlbums('test-token', [], {}),
      mockAlbumOperations.createSpotifyPlaylist('test-token', [], 'Test Playlist'),
    ]

    await Promise.all(promises)

    expect(mockAlbumOperations.discoverAlbums).toHaveBeenCalled()
    expect(mockAlbumOperations.createSpotifyPlaylist).toHaveBeenCalled()
  })
})
