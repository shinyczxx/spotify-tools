/**
 * @file usePlaylistTools.ts
 * @description Main hook for managing playlist tools state and operations
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 */

import { useState, useEffect } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import type { PlaylistItem } from 'types/playlist'
import { usePlaylistLoader } from './usePlaylistLoader'
import { useAlbumShuffle } from './useAlbumShuffle'
import { usePlaylistCombiner } from './usePlaylistCombiner'
import { usePlaylistCreator } from './usePlaylistCreator'

type ModalType = 'album-shuffle' | 'playlist-combiner' | null

export const usePlaylistTools = (spotifyApi: SpotifyApi | null, user: any) => {
  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  
  // Selected playlists
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  
  // Search state
  const [playlistSearch, setPlaylistSearch] = useState('')
  
  // Last.fm integration state
  const [enableLastFm, setEnableLastFm] = useState(false)
  
  // Initialize sub-hooks
  const playlistLoader = usePlaylistLoader(spotifyApi, user)
  const albumShuffle = useAlbumShuffle(spotifyApi)
  const playlistCombiner = usePlaylistCombiner(spotifyApi)
  const playlistCreator = usePlaylistCreator(
    spotifyApi,
    playlistLoader.loadDataWithCache,
    () => setActiveModal(null)
  )
  
  // Filtered playlists
  const filteredPlaylists = playlistSearch
    ? playlistLoader.playlists.filter((p) => p.name.toLowerCase().includes(playlistSearch.toLowerCase()))
    : playlistLoader.playlists

  // Clear results when switching modals
  useEffect(() => {
    albumShuffle.setShuffledTracks([])
    playlistCombiner.setCombinedTracks([])
  }, [activeModal, albumShuffle, playlistCombiner])

  // Wrapper functions for sub-hook operations
  const shuffleAlbums = () => albumShuffle.shuffleAlbums(selectedPlaylists)
  const combinePlaylists = () => playlistCombiner.combinePlaylists(selectedPlaylists)


  return {
    // Modal state
    activeModal,
    setActiveModal,
    
    // Playlist state from loader
    playlists: playlistLoader.playlists,
    loading: playlistLoader.loading,
    loadError: playlistLoader.error,
    
    // Selected playlists
    selectedPlaylists,
    setSelectedPlaylists,
    
    // Album shuffle
    shuffledTracks: albumShuffle.shuffledTracks,
    albumShuffleSettings: albumShuffle.settings,
    setAlbumShuffleSettings: albumShuffle.setSettings,
    albumShuffleProcessing: albumShuffle.processing,
    albumShuffleError: albumShuffle.error,
    
    // Playlist combiner
    combinedTracks: playlistCombiner.combinedTracks,
    shuffleSettings: playlistCombiner.settings,
    setShuffleSettings: playlistCombiner.setSettings,
    combinerProcessing: playlistCombiner.processing,
    combinerError: playlistCombiner.error,
    
    // Playlist creator
    playlistName: playlistCreator.playlistName,
    setPlaylistName: playlistCreator.setPlaylistName,
    playlistPublic: playlistCreator.playlistPublic,
    setPlaylistPublic: playlistCreator.setPlaylistPublic,
    creatorProcessing: playlistCreator.processing,
    creatorError: playlistCreator.error,
    
    // Search
    playlistSearch,
    setPlaylistSearch,
    filteredPlaylists,
    
    // Last.fm
    enableLastFm,
    setEnableLastFm,
    
    // Operations
    loadDataWithCache: playlistLoader.loadDataWithCache,
    handleRefresh: playlistLoader.handleRefresh,
    shuffleAlbums,
    combinePlaylists,
    createPlaylistFromTracks: playlistCreator.createPlaylistFromTracks,
  }
}