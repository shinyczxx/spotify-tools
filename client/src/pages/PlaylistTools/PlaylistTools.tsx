/**
 * @file PlaylistTools.tsx
 * @description Comprehensive playlist tools page with modal-based creation workflow
 * @author Caleb Price
 * @version 5.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 5.0.0: Refactored to playlist-first workflow with modal-based creation
 * - 4.0.0: Complete wireframe theme implementation with all shuffle tools and filters
 * - 3.0.0: Wireframe design implementation with combined tools
 * - 2.0.0: Basic layout conversion
 * - 1.0.0: Circuit board layout
 */

import React, { useState, useMemo } from 'react'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { usePlaylistTools } from '@hooks/data/usePlaylistTools'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import { AlbumShuffleModal } from '@components/AlbumShuffleModal'
import { PlaylistCombinerModal } from '@components/PlaylistCombinerModal'
import { AlbumHistoryModal } from '@components/AlbumHistoryModal'
import { PlaylistSelector } from '@components/PlaylistSelector'
import { SpotifyApi } from 'spotify-api-lib'
import { TableHeaderConfig } from '@components/PlaylistSelector/tableHeaderUtils'
import '@styles/wireframe.css'
import './PlaylistTools.css'

const PlaylistTools: React.FC = () => {
  const { accessToken, user } = useSpotifyAuth()
  
  // Initialize Spotify API (memoized to prevent infinite re-renders)
  const spotifyApi = useMemo(() => {
    return accessToken ? new SpotifyApi(accessToken) : null
  }, [accessToken])

  // Use custom hook for playlist tools state and operations
  const {
    activeModal,
    setActiveModal,
    playlistName,
    setPlaylistName,
    playlistPublic,
    setPlaylistPublic,
    playlists,
    selectedPlaylists,
    setSelectedPlaylists,
    combinedTracks,
    loading,
    loadError,
    albumShuffleProcessing,
    combinerProcessing,
    creatorProcessing,
    shuffleSettings,
    setShuffleSettings,
    playlistSearch,
    setPlaylistSearch,
    filteredPlaylists,
    enableLastFm,
    setEnableLastFm,
    handleRefresh,
    combinePlaylists,
    createPlaylistFromTracks,
  } = usePlaylistTools(spotifyApi, user)


  // Add state for album history modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)




  // Table header configurations
  const playlistHeaders: TableHeaderConfig[] = [
    { key: 'checkbox', label: '', widthWeight: 0.5, minWidth: 40 },
    {
      key: 'thumbnail',
      label: '',
      widthWeight: 0.5,
      minWidth: 60,
      tooltip: 'hover for description',
    },
    { key: 'name', label: 'Name', widthWeight: 3, sortable: true },
    { key: 'owner', label: 'Owner', widthWeight: 2, sortable: true },
    { key: 'tracks', label: 'Tracks', widthWeight: 1, sortable: true },
  ]

  if (!accessToken) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Authentication Required" variant="error">
          <p>please log in with spotify to use playlist tools.</p>
          {loadError && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                background: 'var(--terminal-red-dim)',
                border: '1px solid var(--terminal-red)',
              }}
            >
              <p style={{ color: 'var(--terminal-red-bright)', fontWeight: 600 }}>{loadError}</p>
            </div>
          )}
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="wireframe-container playlist-tools-container">
      {/* Tool Buttons Row - 4 sections: Album Shuffle | Playlist Combiner | Blank Space | Retrieved Album History */}
      <div className="playlist-tools-button-row">
        {/* Album Shuffle Button */}
        <WireframeButton
          onClick={() => setActiveModal('album-shuffle')}
          disabled={selectedPlaylists.length === 0}
          title={selectedPlaylists.length === 0 ? 'select at least 1 playlist' : ''}
          className="playlist-tools-button"
        >
          album shuffle
        </WireframeButton>

        {/* Playlist Combiner Button */}
        <div className="playlist-tools-button-group">
          <WireframeButton
            onClick={() => setActiveModal('playlist-combiner')}
            disabled={selectedPlaylists.length === 0}
            title={selectedPlaylists.length === 0 ? 'select at least 1 playlist' : ''}
            className="playlist-tools-button"
          >
            playlist combiner
          </WireframeButton>
          <TooltipIcon
            contents={
              <div>
                <div><strong>Combines multiple playlists with shuffle options:</strong></div>
                <div>• <strong>Dumb Shuffle:</strong> Full random shuffle, no Spotify algorithm</div>
                <div>• <strong>No Shuffle:</strong> Keeps original order from playlists</div>
                <div style={{ marginTop: '0.5em', fontStyle: 'italic' }}>
                  💡 Tip: Use with a single playlist for full random shuffle!
                </div>
              </div>
            }
            size={16}
            direction="left"
            ariaLabel="Playlist combiner help"
          />
        </div>

        {/* Blank Space */}
        <div className="playlist-tools-spacer"></div>

        {/* Retrieved Album History Button */}
        <WireframeButton
          onClick={() => setIsHistoryModalOpen(true)}
          disabled={false}
          title="View cached album search history"
          className="playlist-tools-button"
        >
          retrieved album history
        </WireframeButton>
      </div>

      {loadError && (
        <WireframePanel title="error" variant="error">
          <p>{loadError}</p>
          <WireframeButton onClick={handleRefresh} disabled={loading}>
            retry
          </WireframeButton>
        </WireframePanel>
      )}

      {/* Playlist Selector - CRITICAL: This component IS the panel, not wrapped in one */}
      {playlists.length > 0 ? (
        // The PlaylistSelector component handles its own panel styling internally.
        // Any wrapper styling here creates an ugly double-panel effect.
        <div className="playlist-tools-selector-container">
          <PlaylistSelector
            type="playlist"
            items={filteredPlaylists}
            selectedItems={selectedPlaylists}
            onSelectionChange={(playlistId, selected) => {
              setSelectedPlaylists((prev) =>
                selected ? [...prev, playlistId] : prev.filter((id) => id !== playlistId),
              )
            }}
            onDeselectAll={() => setSelectedPlaylists([])}
            headerConfigs={playlistHeaders}
            itemsPerPage={15}
            searchValue={playlistSearch}
            onSearchChange={setPlaylistSearch}
            onRefresh={handleRefresh}
            showRefresh={true}
            showDeselectAll={true}
          />
        </div>
      ) : loading ? (
        <WireframePanel className="playlist-tools-status-message">
          <p>loading playlists...</p>
        </WireframePanel>
      ) : (
        <WireframePanel className="playlist-tools-status-message">
          <p>no playlists found.</p>
        </WireframePanel>
      )}

      {/* Album Shuffle Modal */}
      <AlbumShuffleModal
        isOpen={activeModal === 'album-shuffle'}
        onClose={() => setActiveModal(null)}
        selectedPlaylists={selectedPlaylists}
        onCreatePlaylist={async (tracks, name, isPublic) => {
          try {
            const result = await createPlaylistFromTracks(tracks as any, name, isPublic)
            return result
          } catch (error) {
            console.error('Error creating playlist:', error)
            return null
          }
        }}
        processing={albumShuffleProcessing}
        spotifyApi={spotifyApi}
      />

      {/* Playlist Combiner Modal */}
      <PlaylistCombinerModal
        isOpen={activeModal === 'playlist-combiner'}
        onClose={() => setActiveModal(null)}
        shuffleSettings={shuffleSettings}
        onShuffleSettingsChange={setShuffleSettings}
        playlistName={playlistName}
        onPlaylistNameChange={setPlaylistName}
        playlistPublic={playlistPublic}
        onPlaylistPublicChange={setPlaylistPublic}
        combinedTracks={combinedTracks}
        onCombinePlaylists={combinePlaylists}
        onCreatePlaylist={() =>
          createPlaylistFromTracks(
            combinedTracks,
            playlistName || 'combined playlist',
            playlistPublic,
          )
        }
        processing={combinerProcessing}
        enableLastFm={enableLastFm}
        onEnableLastFmChange={setEnableLastFm}
      />

      {/* Album History Modal */}
      <AlbumHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoadFromHistory={(playlistIds) => {
          // Future enhancement: load specific cached data
          console.log('Load from history:', playlistIds)
          setIsHistoryModalOpen(false)
        }}
      />
    </div>
  )
}

export default PlaylistTools
