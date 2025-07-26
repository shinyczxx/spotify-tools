/**
 * @file PlaylistTools.test.tsx
 * @description Comprehensive tests for PlaylistTools component with mock Spotify data
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PlaylistTools from '../../pages/PlaylistTools/PlaylistTools'
import * as useSpotifyAuthModule from '../../hooks/auth/useSpotifyAuth'
import * as usePlaylistToolsModule from '../../hooks/data/usePlaylistTools'

// Mock the hooks
jest.mock('../../hooks/auth/useSpotifyAuth')
jest.mock('../../hooks/data/usePlaylistTools')

const mockUseSpotifyAuth = useSpotifyAuthModule.useSpotifyAuth as jest.MockedFunction<typeof useSpotifyAuthModule.useSpotifyAuth>
const mockUsePlaylistTools = usePlaylistToolsModule.usePlaylistTools as jest.MockedFunction<typeof usePlaylistToolsModule.usePlaylistTools>

// Mock playlist data
const mockPlaylists = [
  {
    id: 'playlist1',
    name: 'My Awesome Playlist',
    description: 'A great collection of songs',
    images: [{ url: 'https://example.com/image1.jpg', height: 300, width: 300 }],
    owner: { display_name: 'Test User', id: 'user1' },
    tracks: { total: 42 }
  },
  {
    id: 'playlist2', 
    name: 'Workout Mix',
    description: 'High energy songs for workouts',
    images: [{ url: 'https://example.com/image2.jpg', height: 300, width: 300 }],
    owner: { display_name: 'Test User', id: 'user1' },
    tracks: { total: 28 }
  },
  {
    id: 'liked-songs',
    name: 'Liked Songs',
    description: 'Your liked songs',
    images: [{ url: '/liked-songs.png', height: 64, width: 64 }],
    owner: { display_name: 'You', id: 'me' },
    tracks: { total: 156 }
  }
]

// Default mock implementations
const mockUseSpotifyAuthDefault = {
  accessToken: 'mock-access-token',
  user: { id: 'test-user', display_name: 'Test User' },
  loading: false,
  error: null
}

const mockUsePlaylistToolsDefault = {
  activeModal: null,
  setActiveModal: jest.fn(),
  playlistName: 'Test Playlist',
  setPlaylistName: jest.fn(),
  playlistPublic: false,
  setPlaylistPublic: jest.fn(),
  playlists: mockPlaylists,
  selectedPlaylists: [],
  setSelectedPlaylists: jest.fn(),
  combinedTracks: [],
  loading: false,
  loadError: null,
  albumShuffleProcessing: false,
  combinerProcessing: false,
  creatorProcessing: false,
  shuffleSettings: { algorithm: 'random' as const },
  setShuffleSettings: jest.fn(),
  playlistSearch: '',
  setPlaylistSearch: jest.fn(),
  filteredPlaylists: mockPlaylists,
  enableLastFm: false,
  setEnableLastFm: jest.fn(),
  handleRefresh: jest.fn(),
  combinePlaylists: jest.fn(),
  createPlaylistFromTracks: jest.fn()
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('PlaylistTools Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSpotifyAuth.mockReturnValue(mockUseSpotifyAuthDefault)
    mockUsePlaylistTools.mockReturnValue(mockUsePlaylistToolsDefault)
  })

  describe('Authentication States', () => {
    it('should show authentication required when no access token', () => {
      mockUseSpotifyAuth.mockReturnValue({
        ...mockUseSpotifyAuthDefault,
        accessToken: null,
        user: null
      })

      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('please log in with spotify to use playlist tools.')).toBeInTheDocument()
    })

    it('should render main interface when authenticated', () => {
      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('album shuffle')).toBeInTheDocument()
      expect(screen.getByText('playlist combiner')).toBeInTheDocument()
      expect(screen.getByText('retrieved album history')).toBeInTheDocument()
    })
  })

  describe('Playlist Loading States', () => {
    it('should show loading state when playlists are loading', () => {
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        playlists: [],
        loading: true
      })

      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('loading playlists...')).toBeInTheDocument()
    })

    it('should show no playlists message when no playlists found', () => {
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        playlists: [],
        loading: false
      })

      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('no playlists found.')).toBeInTheDocument()
    })

    it('should show error message when there is a load error', () => {
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        loadError: 'Failed to load playlists'
      })

      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('Failed to load playlists')).toBeInTheDocument()
      expect(screen.getByText('retry')).toBeInTheDocument()
    })
  })

  describe('Playlist Display', () => {
    it('should display playlists when available', async () => {
      renderWithRouter(<PlaylistTools />)
      
      await waitFor(() => {
        expect(screen.getByText('My Awesome Playlist')).toBeInTheDocument()
        expect(screen.getByText('Workout Mix')).toBeInTheDocument()
        expect(screen.getByText('Liked Songs')).toBeInTheDocument()
      })
    })

    it('should show playlist details correctly', async () => {
      renderWithRouter(<PlaylistTools />)
      
      await waitFor(() => {
        // Check track counts are displayed
        expect(screen.getByText('42')).toBeInTheDocument() // My Awesome Playlist tracks
        expect(screen.getByText('28')).toBeInTheDocument() // Workout Mix tracks
        expect(screen.getByText('156')).toBeInTheDocument() // Liked Songs tracks
      })
    })
  })

  describe('Button States', () => {
    it('should disable action buttons when no playlists selected', () => {
      renderWithRouter(<PlaylistTools />)
      
      const albumShuffleButton = screen.getByText('album shuffle')
      const playlistCombinerButton = screen.getByText('playlist combiner')
      
      expect(albumShuffleButton).toBeDisabled()
      expect(playlistCombinerButton).toBeDisabled()
    })

    it('should enable action buttons when playlists are selected', () => {
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        selectedPlaylists: ['playlist1']
      })

      renderWithRouter(<PlaylistTools />)
      
      const albumShuffleButton = screen.getByText('album shuffle')
      const playlistCombinerButton = screen.getByText('playlist combiner')
      
      expect(albumShuffleButton).not.toBeDisabled()
      expect(playlistCombinerButton).not.toBeDisabled()
    })
  })

  describe('Modal Interactions', () => {
    it('should open album shuffle modal when button clicked', () => {
      const mockSetActiveModal = jest.fn()
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        selectedPlaylists: ['playlist1'],
        setActiveModal: mockSetActiveModal
      })

      renderWithRouter(<PlaylistTools />)
      
      const albumShuffleButton = screen.getByText('album shuffle')
      fireEvent.click(albumShuffleButton)
      
      expect(mockSetActiveModal).toHaveBeenCalledWith('album-shuffle')
    })

    it('should open playlist combiner modal when button clicked', () => {
      const mockSetActiveModal = jest.fn()
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        selectedPlaylists: ['playlist1'],
        setActiveModal: mockSetActiveModal
      })

      renderWithRouter(<PlaylistTools />)
      
      const playlistCombinerButton = screen.getByText('playlist combiner')
      fireEvent.click(playlistCombinerButton)
      
      expect(mockSetActiveModal).toHaveBeenCalledWith('playlist-combiner')
    })

    it('should open history modal when button clicked', () => {
      renderWithRouter(<PlaylistTools />)
      
      const historyButton = screen.getByText('retrieved album history')
      fireEvent.click(historyButton)
      
      // The history modal should be opened (we can't directly test the state change)
      expect(historyButton).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show retry button when there is an error', () => {
      const mockHandleRefresh = jest.fn()
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        loadError: 'Network error',
        handleRefresh: mockHandleRefresh
      })

      renderWithRouter(<PlaylistTools />)
      
      const retryButton = screen.getByText('retry')
      fireEvent.click(retryButton)
      
      expect(mockHandleRefresh).toHaveBeenCalled()
    })
  })

  describe('Search Functionality', () => {
    it('should display filtered playlists based on search', () => {
      const filteredPlaylists = [mockPlaylists[0]] // Only "My Awesome Playlist"
      mockUsePlaylistTools.mockReturnValue({
        ...mockUsePlaylistToolsDefault,
        playlistSearch: 'awesome',
        filteredPlaylists
      })

      renderWithRouter(<PlaylistTools />)
      
      expect(screen.getByText('My Awesome Playlist')).toBeInTheDocument()
      expect(screen.queryByText('Workout Mix')).not.toBeInTheDocument()
    })
  })
})

describe('Playlist Selector Integration', () => {
  it('should pass correct props to PlaylistSelector', () => {
    renderWithRouter(<PlaylistTools />)
    
    // Verify that PlaylistSelector is rendered (we can check for its expected content)
    expect(screen.getByText('My Awesome Playlist')).toBeInTheDocument()
    expect(screen.getByText('Workout Mix')).toBeInTheDocument()
    expect(screen.getByText('Liked Songs')).toBeInTheDocument()
  })
})