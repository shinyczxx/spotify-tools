/**
 * @file useTrackSearch.ts
 * @description Custom hook for Spotify track search functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import { SearchResult } from '../../../types/track'

export interface UseTrackSearchProps {
  accessToken: string | null
}

export interface UseTrackSearchReturn {
  searchQuery: string
  searchResults: SearchResult[]
  searchType: string
  isSearching: boolean
  setSearchQuery: (query: string) => void
  setSearchType: (type: string) => void
  handleSearch: () => Promise<void>
  handleKeyPress: (e: React.KeyboardEvent) => void
}

/**
 * Custom hook for managing track search functionality
 */
export const useTrackSearch = ({ accessToken }: UseTrackSearchProps): UseTrackSearchReturn => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchType, setSearchType] = useState('track')
  const [isSearching, setIsSearching] = useState(false)

  const spotifyApi = accessToken ? new SpotifyApi(accessToken) : null

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !spotifyApi) return

    setIsSearching(true)
    setSearchResults([])

    try {
      const results = await spotifyApi.search.search(searchQuery, {
        type: searchType as any,
        limit: 10,
      })

      if (results.tracks) {
        const formattedResults: SearchResult[] = results.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          duration_ms: track.duration_ms,
          popularity: track.popularity,
          explicit: track.explicit,
          preview_url: track.preview_url || undefined,
          external_urls: track.external_urls,
        }))
        setSearchResults(formattedResults)
      }
    } catch (error) {
      console.error('Error searching tracks:', error)
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, spotifyApi, searchType])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch()
      }
    },
    [handleSearch],
  )

  return {
    searchQuery,
    searchResults,
    searchType,
    isSearching,
    setSearchQuery,
    setSearchType,
    handleSearch,
    handleKeyPress,
  }
}