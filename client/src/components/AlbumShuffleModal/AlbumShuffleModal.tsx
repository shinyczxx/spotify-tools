/**
 * @file AlbumShuffleModal.tsx
 * @description Refactored comprehensive album shuffle modal with organized panel structure
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 2.0.0: Complete refactor - extracted hooks, sub-components, and inline styles
 * - 1.0.0: Initial implementation with 6-panel structure
 */

import React from 'react'
import { WireframePanel } from '@components/wireframe'
import { AlbumPreview } from '@components/AlbumPreview'
import { AlbumShuffleModalProps } from 'types/albumShuffle'
import { useAlbumShuffle } from '@hooks/business/useAlbumShuffle'
import { AlbumTypesPanel } from './components/AlbumTypesPanel'
import { ShuffleAlgorithmPanel } from './components/ShuffleAlgorithmPanel'
import { TrackLimitsPanel } from './components/TrackLimitsPanel'
import { PlaylistSettingsPanel } from './components/PlaylistSettingsPanel'
import { ActionsPanel } from './components/ActionsPanel'
import './AlbumShuffleModal.css'

export const AlbumShuffleModal: React.FC<AlbumShuffleModalProps> = ({
  isOpen,
  onClose,
  selectedPlaylists,
  onCreatePlaylist,
  processing,
  preloadedAlbums,
  fromHistory = false,
}) => {
  const {
    // State
    shuffleConfig,
    setShuffleConfig,
    playlistName,
    setPlaylistName,
    isPublic,
    setIsPublic,
    allRetrievedAlbums,
    selectedAlbums,
    shuffledTracks,
    trackLimitInfo,
    isLoadingAlbums,
    isShuffling,
    createdPlaylistUrl,
    shuffleButtonGlitch,
    fetchProgress,
    isFetching,
    
    // Actions
    handleGetAlbums,
    handleReshuffle,
    handleCreatePlaylist,
  } = useAlbumShuffle({
    isOpen,
    selectedPlaylists,
    preloadedAlbums,
    fromHistory,
    onCreatePlaylist,
  })

  const handleShuffleConfigChange = (config: Partial<typeof shuffleConfig>) => {
    setShuffleConfig(prev => ({ ...prev, ...config }))
  }

  const panelsDisabled = allRetrievedAlbums.length === 0

  if (!isOpen) return null

  return (
    <div className="album-shuffle-modal-overlay" onClick={onClose}>
      <div className="album-shuffle-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Row 1: Album Types + Get Albums */}
        <AlbumTypesPanel
          shuffleConfig={shuffleConfig}
          onShuffleConfigChange={handleShuffleConfigChange}
          fromHistory={fromHistory}
          allRetrievedAlbums={allRetrievedAlbums}
          isLoadingAlbums={isLoadingAlbums}
          selectedPlaylists={selectedPlaylists}
          fetchProgress={fetchProgress}
          onGetAlbums={handleGetAlbums}
          isFetching={isFetching}
          isShuffling={isShuffling}
        />

        {/* Remaining panels - dimmed if no albums retrieved */}
        <div className={`dependent-panels ${panelsDisabled ? 'disabled' : ''}`}>
          {/* Row 2: Shuffle Algorithm Settings */}
          <ShuffleAlgorithmPanel
            shuffleConfig={shuffleConfig}
            onShuffleConfigChange={handleShuffleConfigChange}
            disabled={panelsDisabled}
          />

          {/* Row 3: Album & Track Limits */}
          <TrackLimitsPanel
            shuffleConfig={shuffleConfig}
            onShuffleConfigChange={handleShuffleConfigChange}
            trackLimitInfo={trackLimitInfo}
            allRetrievedAlbums={allRetrievedAlbums}
            disabled={panelsDisabled}
          />

          {/* Row 4: Playlist Settings */}
          <PlaylistSettingsPanel
            playlistName={playlistName}
            onPlaylistNameChange={setPlaylistName}
            isPublic={isPublic}
            onIsPublicChange={setIsPublic}
            disabled={panelsDisabled}
          />

          {/* Albums Preview - shows actual shuffled order */}
          {selectedAlbums.length > 0 && (
            <WireframePanel
              title="playlist preview (shuffled album order):"
              className="preview-panel"
            >
              <AlbumPreview
                albums={selectedAlbums}
                title={`${
                  selectedAlbums.length
                } albums in current shuffle order (${trackLimitInfo.totalTracks.toLocaleString()} estimated tracks)`}
                maxHeight="250px"
              />
            </WireframePanel>
          )}

          {/* Row 5: Actions */}
          <ActionsPanel
            onReshuffle={handleReshuffle}
            onCreatePlaylist={handleCreatePlaylist}
            selectedAlbums={selectedAlbums}
            shuffledTracks={shuffledTracks}
            isShuffling={isShuffling}
            processing={processing}
            shuffleButtonGlitch={shuffleButtonGlitch}
            createdPlaylistUrl={createdPlaylistUrl}
            disabled={panelsDisabled}
          />
        </div>
      </div>
    </div>
  )
}

export default AlbumShuffleModal