/**
 * @file SearchResults.tsx
 * @description Search results display component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeBox } from '../wireframe'
import { SearchResult } from 'types/track'

interface SearchResultsProps {
  searchResults: SearchResult[]
  onTrackSelect: (track: SearchResult) => Promise<void>
  formatDuration: (ms: number) => string
}

/**
 * Displays search results in a clickable list
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  onTrackSelect,
  formatDuration,
}) => {
  if (searchResults.length === 0) return null

  return (
    <WireframeBox boxType="panel">
      <h4 className="search-results-header">
        search results ({searchResults.length} found)
      </h4>

      <div className="search-results-container">
        {searchResults.map((track) => (
          <div
            key={track.id}
            onClick={() => onTrackSelect(track)}
            className="search-result-item"
          >
            {track.album.images[0] && (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="search-result-image"
              />
            )}
            <div className="search-result-info">
              <div className="search-result-title">{track.name}</div>
              <div className="search-result-details">
                {track.artists[0]?.name} • {track.album.name}
              </div>
            </div>
            <div className="search-result-duration">{formatDuration(track.duration_ms)}</div>
          </div>
        ))}
      </div>
    </WireframeBox>
  )
}