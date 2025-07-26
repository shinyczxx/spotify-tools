/**
 * @file LastFmTagSelector.tsx
 * @description Enhanced tag selector with always-visible tag panel and separate selected tags area
 * @author Caleb Price  
 * @version 1.0.0
 * @date 2025-07-24
 */

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { WireframePanel } from '@components/wireframe'
import './LastFmTagSelector.css'

interface LastFmTagSelectorProps {
  availableTags: string[]
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  maxTags?: number
  disabled?: boolean
  className?: string
  error?: string | null
  onLoadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
}

export const LastFmTagSelector: React.FC<LastFmTagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagsChange,
  maxTags = 5,
  disabled = false,
  className = '',
  error = null,
  onLoadMore,
  hasMore = false,
  loadingMore = false
}) => {
  const [filterText, setFilterText] = useState('')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter available tags based on input and remove already selected tags
  const filteredAvailableTags = useMemo(() => {
    const unselectedTags = availableTags.filter(tag => !selectedTags.includes(tag))
    
    if (!filterText.trim()) {
      return unselectedTags
    }
    
    const searchTerm = filterText.toLowerCase()
    return unselectedTags.filter(tag => tag.toLowerCase().includes(searchTerm))
  }, [availableTags, selectedTags, filterText])

  // Handle scroll to bottom for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5 // 5px threshold
    
    if (isAtBottom && hasMore && onLoadMore && !loadingMore && !filterText) {
      onLoadMore()
    }
  }

  const handleTagSelect = (tag: string) => {
    if (disabled || selectedTags.length >= maxTags) return
    
    const newSelectedTags = [...selectedTags, tag]
    onTagsChange(newSelectedTags)
  }

  const handleTagDeselect = (tag: string) => {
    if (disabled) return
    
    const newSelectedTags = selectedTags.filter(t => t !== tag)
    onTagsChange(newSelectedTags)
  }

  const handleClearAll = () => {
    if (disabled) return
    onTagsChange([])
  }

  return (
    <div className={`lastfm-tag-selector ${className}`}>
      {/* Filter Input */}
      <div className="tag-filter-section">
        <input
          type="text"
          className="tag-filter-input"
          placeholder="Filter tags..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          disabled={disabled}
        />
        <div className="tag-counter">
          {selectedTags.length}/{maxTags} tags selected
        </div>
      </div>

      {/* Panels Container - Left/Right Layout */}
      <div className="panels-container">
        {/* Available Tags Panel - Left */}
        <WireframePanel title="Available Tags" className="available-tags-panel">
          <div 
            className="available-tags-container" 
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {filteredAvailableTags.length > 0 ? (
              <>
                <div className="available-tags-grid">
                  {filteredAvailableTags.map(tag => (
                    <button
                      key={tag}
                      className={`available-tag-item tag-with-brackets ${selectedTags.length >= maxTags ? 'disabled' : ''}`}
                      onClick={() => handleTagSelect(tag)}
                      disabled={disabled || selectedTags.length >= maxTags}
                      title={selectedTags.length >= maxTags ? 'Maximum tags reached' : 'Click to select'}
                    >
                      <span className="tag-text">{tag}</span>
                    </button>
                  ))}
                </div>
                
                {/* Load More Indicator */}
                {!filterText && (
                  <div className="load-more-section">
                    {loadingMore && (
                      <div className="loading-more-indicator">
                        Loading more tags...
                      </div>
                    )}
                    {hasMore && !loadingMore && onLoadMore && (
                      <button 
                        className="load-more-button"
                        onClick={onLoadMore}
                        disabled={disabled}
                      >
                        Load More Tags
                      </button>
                    )}
                    {!hasMore && availableTags.length > 50 && (
                      <div className="end-of-tags-indicator">
                        All tags loaded
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="no-tags-message">
                {error ? error : filterText ? 'No tags match your filter' : 'No available tags'}
              </div>
            )}
          </div>
        </WireframePanel>

        {/* Selected Tags Panel - Right */}
        <WireframePanel title="Selected Tags" className="selected-tags-panel">
          <div className="selected-tags-container">
            {selectedTags.length > 0 ? (
              <>
                <div className="selected-tags-list">
                  {selectedTags.map(tag => (
                    <button
                      key={tag}
                      className="selected-tag-item tag-with-brackets"
                      onClick={() => handleTagDeselect(tag)}
                      disabled={disabled}
                      title="Click to remove"
                    >
                      <span className="tag-text">{tag}</span>
                      <span className="tag-remove-icon">×</span>
                    </button>
                  ))}
                </div>
                <button
                  className="clear-all-button"
                  onClick={handleClearAll}
                  disabled={disabled || selectedTags.length === 0}
                >
                  Clear All
                </button>
              </>
            ) : (
              <div className="no-selected-message">
                No tags selected
              </div>
            )}
          </div>
        </WireframePanel>
      </div>
    </div>
  )
}