/**
 * @file AlbumTypesPanel.tsx
 * @description Panel for selecting album types and triggering album retrieval
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel, WireframeButton, WireframeCheckbox } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import LoadingSpinner from '@components/LoadingSpinner'
import { ShuffleConfig, FetchProgress } from 'types/albumShuffle'
import { AlbumWithTrackCount } from '@utils/playlistAlbumFetcher'
import './AlbumTypesPanel.css'

interface AlbumTypesPanelProps {
  shuffleConfig: ShuffleConfig
  onShuffleConfigChange: (config: Partial<ShuffleConfig>) => void
  fromHistory: boolean
  allRetrievedAlbums: AlbumWithTrackCount[]
  isLoadingAlbums: boolean
  selectedPlaylists: string[]
  fetchProgress: FetchProgress
  onGetAlbums: () => void
  isFetching: boolean
  isShuffling: boolean
}

export const AlbumTypesPanel: React.FC<AlbumTypesPanelProps> = ({
  shuffleConfig,
  onShuffleConfigChange,
  fromHistory,
  allRetrievedAlbums,
  isLoadingAlbums,
  selectedPlaylists,
  fetchProgress,
  onGetAlbums,
  isFetching,
  isShuffling,
}) => {
  return (
    <WireframePanel
      title={fromHistory ? 'album types (loaded from history)' : 'album types & retrieval'}
    >
      <div className="album-types-content">
        <div className="album-types-controls">
          <div className="album-type-checkboxes">
            <WireframeCheckbox
              checked={shuffleConfig.allowSingles}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                console.log('Singles checkbox changed:', e.target.checked)
                onShuffleConfigChange({ allowSingles: e.target.checked })
              }}
              label="include singles"
            />
            <WireframeCheckbox
              checked={shuffleConfig.allowCompilations}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                console.log('Compilations checkbox changed:', e.target.checked)
                onShuffleConfigChange({ allowCompilations: e.target.checked })
              }}
              label="include compilations"
            />
            <TooltipIcon
              contents="If a type is unchecked, the tool will search for full albums containing songs from that type and substitute the single/compilation with the full album"
              size={16}
              direction="left"
              ariaLabel="Album type filtering help"
            />
          </div>

          {!fromHistory && (
            <div className="get-albums-section">
              <WireframeButton
                onClick={onGetAlbums}
                disabled={isLoadingAlbums || selectedPlaylists.length === 0}
              >
                {isLoadingAlbums
                  ? `loading albums... (${fetchProgress.current}/${fetchProgress.total})`
                  : 'get albums from selected playlists'}
              </WireframeButton>
            </div>
          )}

          {fromHistory && (
            <div className="history-loaded-message">
              ✅ Albums loaded from history ({allRetrievedAlbums.length} unique albums)
            </div>
          )}
        </div>

        {/* Loading animation on the right side */}
        {(isFetching || isShuffling) && (
          <div className={`loading-section ${isShuffling ? 'shuffling' : 'fetching'}`}>
            <LoadingSpinner size="small" />
            <div className="loading-text">
              {isShuffling ? (
                <>
                  shuffling...
                  <br />
                  <span className="loading-subtitle">
                    🎲 randomizing
                  </span>
                </>
              ) : (
                <>
                  fetching...
                  <br />
                  {fetchProgress.current}/{fetchProgress.total}
                  <br />
                  <span className="loading-subtitle">
                    🎵 loading tracks
                  </span>
                  <div className="loading-progress-bar">
                    <div 
                      className="loading-progress-fill"
                      style={{
                        '--progress-width': `${fetchProgress.total > 0 ? (fetchProgress.current / fetchProgress.total) * 100 : 0}%`
                      } as React.CSSProperties}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </WireframePanel>
  )
}