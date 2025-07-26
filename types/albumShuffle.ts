/**
 * @file albumShuffle.ts
 * @description Types specific to album shuffle functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { AlbumShuffleSettings, ShuffledTrack, ShuffleAlgorithm } from './playlist'
import { AlbumWithTrackCount, TrackLimitMode } from '../client/src/utils/playlistAlbumFetcher'
import { SpotifyAlbum, SpotifyTrack } from './spotify'

export interface AlbumShuffleModalProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void // New minimize function
  selectedPlaylists: string[]
  onCreatePlaylist: (
    tracks: ShuffledTrack[],
    name: string,
    isPublic: boolean,
  ) => Promise<{ external_urls: { spotify: string } } | null>
  processing: boolean
  preloadedAlbums?: AlbumWithTrackCount[]
  fromHistory?: boolean
  spotifyApi?: any // SpotifyApi instance for fetching real tracks
}

export interface ShuffleConfig extends AlbumShuffleSettings {
  algorithm: ShuffleAlgorithm
  trackLimitMode: TrackLimitMode
  maxTracks: number
}

export interface TrackLimitInfo {
  totalTracks: number
  limitReached: boolean
  excludedAlbums: AlbumWithTrackCount[]
}

export interface FetchProgress {
  current: number
  total: number
}

export interface ShuffleState {
  shuffleConfig: ShuffleConfig
  playlistName: string
  isPublic: boolean
  allRetrievedAlbums: AlbumWithTrackCount[]
  selectedAlbums: AlbumWithTrackCount[]
  shuffledTracks: ShuffledTrack[]
  trackLimitInfo: TrackLimitInfo
  isLoadingAlbums: boolean
  isShuffling: boolean
  createdPlaylistUrl: string | null
  shuffleButtonGlitch: boolean
  fetchProgress: FetchProgress
  isFetching: boolean
  trackFetchingStatus: string
}

// Advanced shuffle types
export interface AdvancedShuffleConfig {
  // Last.fm settings
  useLastFmData: boolean
  lastFmTagsWeight: number // 0-100
  lastFmSimilarAlbumsWeight: number // 0-100

  // Tag filtering
  blacklistTags: string[]
  requireTags: string[]

  // Album filtering
  albumTypeWeights: {
    album: number
    single: number
    compilation: number
  }

  // Release date preferences
  releaseDateWeight: number // 0-100, higher = prefer newer releases
  vintage: {
    enabled: boolean
    startYear?: number
    endYear?: number
  }

  // Popularity settings
  popularityWeight: number // 0-100
  preferObscure: boolean // Prefer less popular albums

  // Diversity settings
  artistDiversification: number // 0-100, higher = more diverse artists
  maxAlbumsPerArtist: number

  // Smart selection
  adaptiveSelection: boolean // Use listening history to improve recommendations
  seasonalAdjustment: boolean // Adjust for seasonal preferences
}

export interface ShuffleContext {
  userProfile?: any
  recentTracks?: SpotifyTrack[]
  topArtists?: any[]
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter'
}

export interface AlbumScore {
  album: SpotifyAlbum
  score: number
  factors: {
    lastFmTags: number
    lastFmSimilarity: number
    releaseDate: number
    popularity: number
    diversity: number
    seasonal: number
    adaptive: number
  }
}