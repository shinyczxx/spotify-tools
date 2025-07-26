/**
 * @file SearchForm.tsx
 * @description Search form component for track search functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeButton, WireframeSelect } from '../wireframe'

interface SearchFormProps {
  searchQuery: string
  searchType: string
  isSearching: boolean
  onSearchQueryChange: (query: string) => void
  onSearchTypeChange: (type: string) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

/**
 * Form component for track search with query input and type selection
 */
export const SearchForm: React.FC<SearchFormProps> = ({
  searchQuery,
  searchType,
  isSearching,
  onSearchQueryChange,
  onSearchTypeChange,
  onSearch,
  onKeyPress,
}) => {
  return (
    <div className="search-form">
      <div className="search-controls">
        <div className="search-input-group">
          <label className="search-label">search query</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="enter track name, artist, or spotify id/link..."
            disabled={isSearching}
            className="wireframe-input search-input"
          />
        </div>

        <div className="search-type-container">
          <WireframeSelect
            value={searchType}
            onChange={(value) => onSearchTypeChange(value as string)}
            options={[
              { value: 'track', label: 'tracks' },
              { value: 'artist', label: 'artists' },
              { value: 'album', label: 'albums' },
            ]}
            label="search type"
          />
        </div>

        <WireframeButton onClick={onSearch} disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? 'searching...' : 'search'}
        </WireframeButton>
      </div>
    </div>
  )
}