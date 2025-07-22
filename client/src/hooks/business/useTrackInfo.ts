/**
 * @file useTrackInfo.ts
 * @description Custom hook for track information and audio features
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'
import { SpotifyApi } from 'spotify-api-lib'
import { SearchResult, TrackInfo } from '../../../types/track'

export interface UseTrackInfoProps {
  accessToken: string | null
}

export interface UseTrackInfoReturn {
  selectedTrack: TrackInfo | null
  audioFeatures: any
  isLoadingFeatures: boolean
  handleTrackSelect: (track: SearchResult) => Promise<void>
  formatDuration: (ms: number) => string
  formatAudioFeature: (value: number, isPercentage?: boolean) => string
}

/**
 * Custom hook for managing track information and audio features
 */
export const useTrackInfo = ({ accessToken }: UseTrackInfoProps): UseTrackInfoReturn => {
  const [selectedTrack, setSelectedTrack] = useState<TrackInfo | null>(null)
  const [audioFeatures, setAudioFeatures] = useState<any>(null)
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(false)

  const spotifyApi = accessToken ? new SpotifyApi(accessToken) : null

  const formatDuration = useCallback((ms: number): string => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const formatAudioFeature = useCallback((value: number, isPercentage = true): string => {
    if (isPercentage) {
      return `${Math.round(value * 100)}%`
    }
    return value.toFixed(2)
  }, [])

  const handleTrackSelect = useCallback(
    async (track: SearchResult) => {
      setIsLoadingFeatures(true)

      const trackInfo: TrackInfo = {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album.name,
        duration: formatDuration(track.duration_ms),
        popularity: track.popularity,
        explicit: track.explicit,
        preview_url: track.preview_url,
        external_urls: track.external_urls,
      }

      setSelectedTrack(trackInfo)

      // Get audio features
      if (spotifyApi) {
        try {
          const features = await spotifyApi.tracks.getAudioFeatures(track.id)
          setAudioFeatures(features)

          // Update track info with audio features
          setSelectedTrack((prev) =>
            prev
              ? {
                  ...prev,
                  energy: features.energy,
                  danceability: features.danceability,
                  valence: features.valence,
                  tempo: features.tempo,
                  acousticness: features.acousticness,
                  instrumentalness: features.instrumentalness,
                  speechiness: features.speechiness,
                  liveness: features.liveness,
                }
              : null,
          )
        } catch (error) {
          console.error('Error getting audio features:', error)
        }
      }

      setIsLoadingFeatures(false)
    },
    [spotifyApi, formatDuration],
  )

  return {
    selectedTrack,
    audioFeatures,
    isLoadingFeatures,
    handleTrackSelect,
    formatDuration,
    formatAudioFeature,
  }
}