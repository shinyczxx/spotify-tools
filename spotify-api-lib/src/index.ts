/**
 * @file index.ts
 * @description Main entry point for spotify-api-lib
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

// Main API class
export { SpotifyApi } from './main'

// HTTP client for advanced usage
export { SpotifyHttpClient } from './httpClient'

// All endpoint classes
export { PlaylistEndpoints } from './endpoints/playlists'
export { TrackEndpoints } from './endpoints/tracks'
export { AlbumEndpoints } from './endpoints/albums'
export { ArtistEndpoints } from './endpoints/artists'
export { SearchEndpoints } from './endpoints/search'
export { PlayerEndpoints } from './endpoints/player'
export { UserEndpoints } from './endpoints/user'

// All types
export * from './types'

// Default export
export { SpotifyApi as default } from './main'
