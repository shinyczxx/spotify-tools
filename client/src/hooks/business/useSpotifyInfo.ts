/**
 * @file useSpotifyInfo.ts
 * @description Custom hook for comprehensive Spotify item information
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-25
 */

import { useState, useCallback } from 'react'
import createSpotifyApiWrapper from '@utils/spotifyApiWrapper'
import { SearchResult } from 'types/track'

export interface UseSpotifyInfoProps {
  accessToken: string | null
}

export interface UseSpotifyInfoReturn {
  selectedItem: any | null
  selectedItemType: 'track' | 'album' | 'artist' | null
  handleItemSelect: (item: SearchResult, rawData?: any) => Promise<void>
  formatDuration: (ms: number) => string
}

/**
 * Custom hook for managing comprehensive Spotify item information
 */
export const useSpotifyInfo = ({ accessToken }: UseSpotifyInfoProps): UseSpotifyInfoReturn => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [selectedItemType, setSelectedItemType] = useState<'track' | 'album' | 'artist' | null>(null)

  const spotifyApi = accessToken ? createSpotifyApiWrapper() : null

  const formatDuration = useCallback((ms: number): string => {
    if (!ms) return 'N/A'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const handleItemSelect = useCallback(
    async (item: SearchResult, rawData?: any) => {
      if (!spotifyApi) return

      try {
        // Use the data exactly as returned from the initial search/lookup call
        // No additional API calls - show exactly what the single API call returned
        const itemData = rawData || item
        let itemType: 'track' | 'album' | 'artist' = 'track'

        // Determine item type based on the data structure
        if (item.duration_ms > 0 && item.album && item.artists) {
          // This is a track (has duration)
          itemType = 'track'
        } else if (item.duration_ms === 0 && item.album && item.artists) {
          // This is an album (no duration, but has album and artists)
          itemType = 'album'
        } else if (item.artists && !item.album) {
          // This might be an artist
          itemType = 'artist'
        }

        setSelectedItem(itemData)
        setSelectedItemType(itemType)
      } catch (error) {
        console.error('Error processing item selection:', error)
        // Always ensure we have some data to display
        setSelectedItem(item)
        setSelectedItemType('track')
      }
    },
    [spotifyApi],
  )

  return {
    selectedItem,
    selectedItemType,
    handleItemSelect,
    formatDuration,
  }
}