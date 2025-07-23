/**
 * @file GetTrackInfo.tsx
 * @description Track information page with modular components and hooks
 * @author Caleb Price
 * @version 4.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 4.0.0: Modularized with custom hooks and components, moved types to types/
 * - 3.0.0: Converted to wireframe theme
 * - 2.0.0: Basic track information page for MVP
 * - 1.0.0: Initial implementation
 */

import React from 'react'
import { WireframePanel, WireframeBox } from '@components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useTrackSearch } from '@hooks/business/useTrackSearch'
import { useTrackInfo } from '@hooks/business/useTrackInfo'
import { SearchForm } from '@components/TrackInfo/SearchForm'
import { SearchResults } from '@components/TrackInfo/SearchResults'
import { TrackDetails } from '@components/TrackInfo/TrackDetails'
import { AudioFeatures } from '@components/TrackInfo/AudioFeatures'
import { PreviewPlayer } from '@components/TrackInfo/PreviewPlayer'
import './GetTrackInfo.css'

const GetTrackInfo: React.FC = () => {
  const { accessToken } = useSpotifyAuth()

  // Extract search functionality
  const {
    searchQuery,
    searchResults,
    searchType,
    isSearching,
    setSearchQuery,
    setSearchType,
    handleSearch,
    handleKeyPress,
  } = useTrackSearch({ accessToken })

  // Extract track info and audio features
  const {
    selectedTrack,
    isLoadingFeatures,
    handleTrackSelect,
    formatDuration,
    formatAudioFeature,
  } = useTrackInfo({ accessToken })

  if (!accessToken) {
    return (
      <div className="wireframe-container">
        <WireframePanel title="Authentication Required" variant="error">
          <p>please log in with spotify to search for track information.</p>
        </WireframePanel>
      </div>
    )
  }

  return (
    <div className="wireframe-container">
      <WireframePanel title="track information" variant="header">
        <p className="track-info-description">
          search for tracks to get detailed information and audio features
        </p>
      </WireframePanel>

      {/* Search Section */}
      <WireframePanel title="search tracks">
        <SearchForm
          searchQuery={searchQuery}
          searchType={searchType}
          isSearching={isSearching}
          onSearchQueryChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
          onSearch={handleSearch}
          onKeyPress={handleKeyPress}
        />

        <SearchResults
          searchResults={searchResults}
          onTrackSelect={handleTrackSelect}
          formatDuration={formatDuration}
        />
      </WireframePanel>

      {/* Track Details */}
      {selectedTrack && (
        <div className="track-details-grid">
          {/* Basic Information */}
          <WireframePanel title="track details">
            <TrackDetails track={selectedTrack} />
          </WireframePanel>

          {/* Audio Features */}
          <WireframePanel title="audio features">
            <AudioFeatures
              track={selectedTrack}
              isLoading={isLoadingFeatures}
              formatAudioFeature={formatAudioFeature}
            />
          </WireframePanel>

          {/* Preview Player */}
          {selectedTrack.preview_url && (
            <WireframePanel title="preview">
              <PreviewPlayer previewUrl={selectedTrack.preview_url} />
            </WireframePanel>
          )}
        </div>
      )}

      {!selectedTrack && !isSearching && searchResults.length === 0 && searchQuery && (
        <WireframeBox boxType="panel">
          <p className="no-results">no results found. try a different search term.</p>
        </WireframeBox>
      )}
    </div>
  )
}

export default GetTrackInfo
