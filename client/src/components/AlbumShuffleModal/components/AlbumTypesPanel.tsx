/**
 * @file AlbumTypesPanel.tsx
 * @description Panel for selecting album types and triggering album retrieval
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframePanel, WireframeButton, WireframeMultiSelect } from '@components/wireframe'
import { TooltipIcon } from '@components/wireframe/TooltipIcon'
import { useLoadingDots } from '@hooks/ui/useLoadingDots'
import { LoadingAnimation } from '@components/LoadingAnimation'
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
  const loadingDots = useLoadingDots({ isLoading: isLoadingAlbums })
  return (
    <WireframePanel
      title={fromHistory ? 'album types (loaded from history)' : 'album types & retrieval'}
    >
      <div className="album-types-content">
        <div className="album-types-controls">
          <div className="album-type-multiselect">
            <WireframeMultiSelect
              label="Album Types"
              options={[
                { value: 'albums', label: 'Albums' },
                { value: 'eps', label: 'EPs' },
                { value: 'singles', label: 'Singles' },
                { value: 'compilations', label: 'Compilations' }
              ]}
              values={shuffleConfig.albumTypes || []}
              onChange={(selectedTypes) => {
                console.log('Album types changed:', selectedTypes)
                const typedValues = selectedTypes as ('albums' | 'eps' | 'singles' | 'compilations')[]
                onShuffleConfigChange({ 
                  albumTypes: typedValues,
                  // Update individual boolean flags for backward compatibility
                  allowAlbums: typedValues.includes('albums'),
                  allowEps: typedValues.includes('eps'),
                  allowSingles: typedValues.includes('singles'),
                  allowCompilations: typedValues.includes('compilations')
                })
              }}
              size="medium"
              disabled={isLoadingAlbums || isFetching || isShuffling}
            />
            <TooltipIcon
              contents="Albums/EPs: Include full albums and EPs. Singles: Include standalone singles. Compilations: Include compilation albums. If 'Albums' is selected and 'Singles' is not, the tool will search for full albums containing songs from singles and substitute them."
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
                  ? `loading albums${loadingDots}`
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

        {/* Loading animation with equation-based pips */}
        {(isFetching || isShuffling) && (
          <div className={`loading-section ${isShuffling ? 'shuffling' : 'fetching'}`}>
            <LoadingAnimation
              isLoading={isFetching || isShuffling}
              text={isShuffling ? 'shuffling' : 'fetching'}
              subtitle={isShuffling ? '🎲 randomizing' : '🎵 loading tracks'}
              progress={isFetching ? fetchProgress : undefined}
              pips={isFetching ? {
                totalPips: 10,
                currentPips: Math.floor((fetchProgress.current / Math.max(fetchProgress.total, 1)) * 10)
              } : undefined}
              size="small"
            />
          </div>
        )}
      </div>
    </WireframePanel>
  )
}