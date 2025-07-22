/**
 * @file albumOperations.ts
 * @description Direct imports from modular album operation utilities
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 */

// Re-export types
export type {
  AlbumFilters,
  ShuffleType,
  ShuffleResult
} from 'types/album'

// Re-export utilities
export { TrackRetrieval } from './album/trackRetrieval.utils'
export { AlbumDiscovery } from './album/albumDiscovery.utils'
export { AlbumShuffle } from './album/albumShuffle.utils'
export { PlaylistCreation } from './album/playlistCreation.utils'
export { CacheManagement } from './album/cacheManagement.utils'

// Direct utility functions (not classes)
import { TrackRetrieval } from './album/trackRetrieval.utils'
import { AlbumDiscovery } from './album/albumDiscovery.utils'
import { AlbumShuffle } from './album/albumShuffle.utils'
import { PlaylistCreation } from './album/playlistCreation.utils'
import { CacheManagement } from './album/cacheManagement.utils'

const trackRetrieval = new TrackRetrieval()
const albumDiscovery = new AlbumDiscovery()
const albumShuffle = new AlbumShuffle()
const playlistCreation = new PlaylistCreation()

export const getTracksFromPlaylists = trackRetrieval.getTracksFromPlaylists.bind(trackRetrieval)
export const discoverAlbums = albumDiscovery.discoverAlbums.bind(albumDiscovery)
export const findTrackOnAlbum = albumDiscovery.findTrackOnAlbum.bind(albumDiscovery)
export const shuffleAlbums = albumShuffle.shuffleAlbums.bind(albumShuffle)
export const generatePlaylistName = playlistCreation.generatePlaylistName.bind(playlistCreation)
export const createSpotifyPlaylist = playlistCreation.createSpotifyPlaylist.bind(playlistCreation)
export const clearAlbumCache = CacheManagement.clearAlbumCache