export { default as api } from './spotify/api'
export * from './albumShuffle'
export * from './albumUtils'
export * from './albumOperations'
export * from './filters'
export * from './auth/spotifyUtils'
export * from './searchHistory'
export * from './playlist/playlistCache'
export * from './playlist/getNonStandardPlaylists'
export * from './playlist/playlistAlbumFetcher'
export * from './stringUtils'
export * from './sortingUtils'
export * from './ui/classNames'

// New library imports
export { default as SpotifyApi } from 'spotify-api-lib'
export { default as LastFm } from 'lastfm-api-lib'
export { default as LastFmFinder } from './lastFmFinder'
export { default as LastFmRelated } from './lastFmRelated'

// Type exports from new libraries
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

export type {
  LastFmTag,
  LastFmArtist,
  LastFmAlbum,
  LastFmTrack,
  LastFmApiResponse,
} from 'lastfm-api-lib'

export type {
  LastFmMatchResult,
  LastFmAlbumResult,
  LastFmArtistResult,
  LastFmTrackResult,
} from './lastFmFinder'
export type {
  RelatedAlbumsOptions,
  RelatedAlbumResult,
  RelatedAlbumsResponse,
} from './lastFmRelated'
