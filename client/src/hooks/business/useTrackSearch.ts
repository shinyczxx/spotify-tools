/**
 * @file useTrackSearch.ts
 * @description Custom hook for Spotify track search functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import { SearchResult } from '@types/track'

export interface UseTrackSearchProps {
  accessToken: string | null
}

export interface UseTrackSearchReturn {
  searchQuery: string
  searchResults: SearchResult[]
  searchType: string
  isSearching: boolean
  isDirectLookup: boolean
  hasSearched: boolean
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
  const [isDirectLookup, setIsDirectLookup] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const spotifyApi = accessToken ? new SpotifyApi(accessToken) : null

  // Helper function to extract Spotify ID from URL or return as-is if already an ID
  const extractSpotifyId = (input: string): { id: string; type: string } | null => {
    const trimmed = input.trim()
    
    // Check if it's a Spotify URL
    const urlMatch = trimmed.match(/open\.spotify\.com\/(track|album|artist)\/([a-zA-Z0-9]+)/)
    if (urlMatch) {
      return { id: urlMatch[2], type: urlMatch[1] }
    }
    
    // Check if it's a Spotify URI
    const uriMatch = trimmed.match(/spotify:(track|album|artist):([a-zA-Z0-9]+)/)
    if (uriMatch) {
      return { id: uriMatch[2], type: uriMatch[1] }
    }
    
    // Check if it looks like a Spotify ID (22 characters, alphanumeric)
    if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
      // Try to detect type by making API calls
      return { id: trimmed, type: 'auto' }
    }
    
    return null
  }

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !spotifyApi) return

    setIsSearching(true)
    setSearchResults([])
    setHasSearched(true)

    try {
      const spotifyData = extractSpotifyId(searchQuery)
      
      if (spotifyData) {
        // This is a direct ID/URL lookup
        setIsDirectLookup(true)
        // Direct ID/URL lookup
        let targetType = spotifyData.type
        
        if (targetType === 'auto') {
          // Try to auto-detect type by making API calls
          try {
            await spotifyApi.tracks.getById(spotifyData.id)
            targetType = 'track'
          } catch {
            try {
              await spotifyApi.albums.getById(spotifyData.id)
              targetType = 'album'
            } catch {
              try {
                await spotifyApi.artists.getById(spotifyData.id)
                targetType = 'artist'
              } catch {
                throw new Error('Could not determine Spotify ID type')
              }
            }
          }
        }
        
        // Get the specific item based on detected type
        if (targetType === 'track') {
          const track = await spotifyApi.tracks.getById(spotifyData.id)
          console.log(track)
          const formattedResult: SearchResult = {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            duration_ms: track.duration_ms,
            popularity: track.popularity,
            explicit: track.explicit,
            preview_url: track.preview_url || undefined,
            external_urls: track.external_urls,
          }
          setSearchResults([formattedResult])
        } else if (targetType === 'album') {
          const album = await spotifyApi.albums.getById(spotifyData.id)
          console.log(album)
          // For direct album lookup, create a single result representing the album
          const albumResult: SearchResult = {
            id: album.id,
            name: album.name,
            artists: album.artists,
            album: album,
            duration_ms: 0, // Albums don't have duration
            popularity: 0,
            explicit: false,
            preview_url: undefined,
            external_urls: album.external_urls,
          }
          setSearchResults([albumResult])
        } else if (targetType === 'artist') {
          const topTracks = await spotifyApi.artists.getTopTracks(spotifyData.id, "US")
          const formattedResults: SearchResult[] = topTracks.tracks.map((track) => ({
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
      } else {
        // This is a regular text search
        setIsDirectLookup(false)
        // Regular text search
        const results = await spotifyApi.search.search(searchQuery, {
          type: [searchType] as any,
          limit: 10,
        })

        if (results.tracks && searchType === 'track') {
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
        } else if (results.albums && searchType === 'album') {
          // For albums, get the first track of each album as a representative
          const albumResults: SearchResult[] = []
          for (const album of results.albums.items.slice(0, 5)) {
            try {
              const tracks = await spotifyApi.albums.getAlbumTracks(album.id)
              if (tracks.items.length > 0) {
                const firstTrack = tracks.items[0]
                albumResults.push({
                  id: firstTrack.id,
                  name: `${album.name} - ${firstTrack.name}`,
                  artists: firstTrack.artists,
                  album: album,
                  duration_ms: firstTrack.duration_ms,
                  popularity: 0,
                  explicit: firstTrack.explicit,
                  preview_url: firstTrack.preview_url || undefined,
                  external_urls: firstTrack.external_urls,
                })
              }
            } catch (error) {
              console.error('Error fetching album tracks:', error)
            }
          }
          setSearchResults(albumResults)
        } else if (results.artists && searchType === 'artist') {
          // For artists, get their top tracks
          const artistResults: SearchResult[] = []
          for (const artist of results.artists.items.slice(0, 3)) {
            try {
              const topTracks = await spotifyApi.artists.getArtistTopTracks(artist.id, 'US')
              const topTrack = topTracks.tracks[0]
              if (topTrack) {
                artistResults.push({
                  id: topTrack.id,
                  name: `${artist.name} - ${topTrack.name}`,
                  artists: topTrack.artists,
                  album: topTrack.album,
                  duration_ms: topTrack.duration_ms,
                  popularity: topTrack.popularity,
                  explicit: topTrack.explicit,
                  preview_url: topTrack.preview_url || undefined,
                  external_urls: topTrack.external_urls,
                })
              }
            } catch (error) {
              console.error('Error fetching artist top tracks:', error)
            }
          }
          setSearchResults(artistResults)
        }
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
    isDirectLookup,
    hasSearched,
    setSearchQuery,
    setSearchType,
    handleSearch,
    handleKeyPress,
  }
}