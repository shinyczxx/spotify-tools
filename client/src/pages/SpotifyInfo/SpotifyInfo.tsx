/**
 * @file SpotifyInfo.tsx
 * @description Spotify information page supporting tracks, albums, and artists
 * @author Caleb Price
 * @version 5.0.0
 * @date 2025-07-25
 *
 * @ChangeLog
 * - 5.0.0: Renamed to SpotifyInfo, supports tracks/albums/artists display
 * - 4.0.0: Modularized with custom hooks and components, moved types to types/
 * - 3.0.0: Converted to wireframe theme
 * - 2.0.0: Basic track information page for MVP
 * - 1.0.0: Initial implementation
 */

import React, { useEffect } from 'react'
import { WireframePanel, WireframeBox } from '@components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useTrackSearch } from '@hooks/business/useTrackSearch'
import { useSpotifyInfo } from '@hooks/business/useSpotifyInfo'
import { SearchForm } from '@components/SpotifyInfo/SearchForm'
import { SearchResults } from '@components/SpotifyInfo/SearchResults'
import { SpotifyItemDetails } from '@components/SpotifyInfo/SpotifyItemDetails'
import { PreviewPlayer } from '@components/SpotifyInfo/PreviewPlayer'
import './SpotifyInfo.css'

const SpotifyInfo: React.FC = () => {
  const { accessToken } = useSpotifyAuth()

  // Extract search functionality
  const {
    searchQuery,
    searchResults,
    searchType,
    isSearching,
    isDirectLookup,
    hasSearched,
    setSearchQuery,
    setSearchType,
    handleSearch,
    handleKeyPress,
  } = useTrackSearch({ accessToken })

  // Extract spotify item info
  const {
    selectedItem,
    selectedItemType,
    handleItemSelect,
    formatDuration,
  } = useSpotifyInfo({ accessToken })

  // Auto-select item for direct ID/URL lookups
  useEffect(() => {
    if (isDirectLookup && searchResults.length > 0 && !selectedItem) {
      handleItemSelect(searchResults[0])
    }
  }, [isDirectLookup, searchResults, selectedItem, handleItemSelect])

  // Function to handle searches from clicked IDs
  const handleIdSearch = (id: string) => {
    setSearchQuery(id)
    // Trigger search after state update
    setTimeout(() => handleSearch(), 0)
  }

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
      {/* Search Section */}
      <WireframePanel title="spotify search">
        <SearchForm
          searchQuery={searchQuery}
          searchType={searchType}
          isSearching={isSearching}
          onSearchQueryChange={setSearchQuery}
          onSearchTypeChange={setSearchType}
          onSearch={handleSearch}
          onKeyPress={handleKeyPress}
        />

        {/* Only show search results for text searches, not direct ID/URL lookups */}
        {!isDirectLookup && (
          <SearchResults
            searchResults={searchResults}
            onTrackSelect={handleItemSelect}
            formatDuration={formatDuration}
          />
        )}
      </WireframePanel>

      {/* Spotify Item Details */}
      {selectedItem && selectedItemType && (
        <div className="spotify-details-grid">
          <SpotifyItemDetails 
            item={selectedItem} 
            itemType={selectedItemType}
            onSearch={handleIdSearch}
          />
          
          {/* Preview Player */}
          {selectedItem.preview_url && (
            <WireframePanel title="preview">
              <PreviewPlayer previewUrl={selectedItem.preview_url} />
            </WireframePanel>
          )}
        </div>
      )}

      {/* Only show "no results" after a text search that returned no results */}
      {!selectedItem && !isSearching && searchResults.length === 0 && hasSearched && !isDirectLookup && searchQuery && (
        <WireframeBox boxType="panel">
          <p className="no-results">no results found. try a different search term.</p>
        </WireframeBox>
      )}
    </div>
  )
}

export default SpotifyInfo
