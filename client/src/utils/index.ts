// Export utility functions
export * from './albumOperations'
export * from './filters'
export * from './spotify/spotifyUtils'
export * from './auth/spotifyAuth'
export * from './searchHistory'
export * from './playlist/playlistCache'
export * from './playlist/getNonStandardPlaylists'
export * from './playlist/playlistAlbumFetcher'
export * from './stringUtils'
export * from './sortingUtils'

// Direct library exports
export { default as SpotifyApi } from 'spotify-api-lib'
export { default as LastFm } from 'lastfm-api-lib'

// Type exports from spotify-api-lib
export type {
  SpotifyImage,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyTrack,
  SpotifyPlaylist,
  SpotifyUser,
  SpotifySearchResponse,
  SpotifyPagingObject,
} from 'spotify-api-lib'

// Type exports from local modules
// Type exports from lastfm-api-lib
export type {
  LastFmTag,
  LastFmArtist,
  LastFmAlbum,
  LastFmTrack,
  LastFmRequestOptions
} from 'lastfm-api-lib'
