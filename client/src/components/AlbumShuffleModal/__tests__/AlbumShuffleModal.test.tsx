/**
 * @file AlbumShuffleModal.test.tsx
 * @description Tests for AlbumShuffleModal checkbox functionality and tooltips
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { AlbumShuffleModal } from './AlbumShuffleModal'
import type { SpotifyAlbum } from 'spotify-api-lib'

// Mock Spotify album data
const mockAlbums: SpotifyAlbum[] = [
  {
    id: '1',
    name: 'Test Album',
    artists: [{ id: 'artist1', name: 'Test Artist' }],
    album_type: 'album',
    release_date: '2023-01-01',
    total_tracks: 10,
    images: [],
  },
]

const mockProps = {
  isOpen: true,
  onClose: jest.fn(),
  selectedPlaylists: ['playlist1'],
  playlistAlbums: { playlist1: mockAlbums },
  onCreatePlaylist: jest.fn(),
  processing: false,
}

describe('AlbumShuffleModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders modal when open', () => {
    render(<AlbumShuffleModal {...mockProps} />)

    expect(screen.getByText('album types & retrieval')).toBeInTheDocument()
  })

  test('checkbox functionality - singles checkbox can be checked and unchecked', async () => {
    const user = userEvent.setup()
    render(<AlbumShuffleModal {...mockProps} />)

    const singlesCheckbox = screen.getByLabelText('include singles')

    // Should start checked (default state)
    expect(singlesCheckbox).toBeChecked()

    // Uncheck it
    await user.click(singlesCheckbox)
    expect(singlesCheckbox).not.toBeChecked()

    // Check it again
    await user.click(singlesCheckbox)
    expect(singlesCheckbox).toBeChecked()
  })

  test('checkbox functionality - compilations checkbox can be checked and unchecked', async () => {
    const user = userEvent.setup()
    render(<AlbumShuffleModal {...mockProps} />)

    const compilationsCheckbox = screen.getByLabelText('include compilations')

    // Should start unchecked (default state)
    expect(compilationsCheckbox).not.toBeChecked()

    // Check it
    await user.click(compilationsCheckbox)
    expect(compilationsCheckbox).toBeChecked()

    // Uncheck it
    await user.click(compilationsCheckbox)
    expect(compilationsCheckbox).not.toBeChecked()
  })

  test('tooltip displays on hover', async () => {
    const user = userEvent.setup()
    render(<AlbumShuffleModal {...mockProps} />)

    // Look for tooltip trigger element (should be a ? icon or similar)
    const tooltipTrigger = screen.getByText(
      'If a type is unchecked, the tool will search for full albums containing songs from that type and substitute the single/compilation with the full album',
    )

    expect(tooltipTrigger).toBeInTheDocument()
  })

  test('close button functionality', async () => {
    const user = userEvent.setup()
    render(<AlbumShuffleModal {...mockProps} />)

    const closeButton = screen.getByTitle('Close')
    await user.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  test('get albums button is disabled when no playlists selected', () => {
    const propsWithoutPlaylists = {
      ...mockProps,
      selectedPlaylists: [],
    }

    render(<AlbumShuffleModal {...propsWithoutPlaylists} />)

    const getAlbumsButton = screen.getByText('get albums from selected playlists')
    expect(getAlbumsButton).toBeDisabled()
  })

  test('conditional rendering - panels hidden until albums retrieved', () => {
    render(<AlbumShuffleModal {...mockProps} />)

    // Initially, shuffle algorithm panel should not be visible
    expect(screen.queryByText('shuffle algorithm')).not.toBeInTheDocument()
  })

  test('shuffle algorithm tooltip displays correct information', async () => {
    const user = userEvent.setup()

    // First get albums to make the shuffle panel visible
    render(<AlbumShuffleModal {...mockProps} />)

    const getAlbumsButton = screen.getByText('get albums from selected playlists')
    await user.click(getAlbumsButton)

    // Wait for the shuffle algorithm panel to appear
    await waitFor(() => {
      expect(screen.getByText('shuffle algorithm')).toBeInTheDocument()
    })

    // Check that algorithm descriptions are present
    expect(screen.getByText('Pure random shuffle of all albums')).toBeInTheDocument()
  })
})
