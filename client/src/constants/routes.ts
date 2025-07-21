/**
 * @file routes.ts
 * @description Application route constants and mappings
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

// Route paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  GET_TRACK_INFO: '/gettrackinfo',
  PLAYLIST_TOOLS: '/playlisttools',
  ALBUM_SHUFFLE: '/albumshuffle',
  PLAYLIST_COMBINER: '/playlistcombiner',
  CALLBACK: '/callback',
} as const

// Page IDs for navbar highlighting
export const PAGE_IDS = {
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  GET_TRACK_INFO: 'getTrackInfo',
  PLAYLIST_TOOLS: 'playlist-tools',
  ALBUM_SHUFFLE: 'albumshuffle',
  PLAYLIST_COMBINER: 'playlistcombiner',
  GITHUB: 'github',
  LOGOUT: 'logout',
} as const

// Route to page ID mapping
export const ROUTE_TO_PAGE_MAP: Record<string, string> = {
  [ROUTES.SETTINGS]: PAGE_IDS.SETTINGS,
  [ROUTES.GET_TRACK_INFO]: PAGE_IDS.GET_TRACK_INFO,
  [ROUTES.PLAYLIST_TOOLS]: PAGE_IDS.PLAYLIST_TOOLS,
  [ROUTES.ALBUM_SHUFFLE]: PAGE_IDS.ALBUM_SHUFFLE,
  [ROUTES.PLAYLIST_COMBINER]: PAGE_IDS.PLAYLIST_COMBINER,
  [ROUTES.HOME]: PAGE_IDS.DASHBOARD,
  [ROUTES.DASHBOARD]: PAGE_IDS.DASHBOARD,
}

// Page ID to route mapping
export const PAGE_TO_ROUTE_MAP: Record<string, string> = {
  [PAGE_IDS.SETTINGS]: ROUTES.SETTINGS,
  [PAGE_IDS.GET_TRACK_INFO]: ROUTES.GET_TRACK_INFO,
  [PAGE_IDS.PLAYLIST_TOOLS]: ROUTES.PLAYLIST_TOOLS,
  [PAGE_IDS.ALBUM_SHUFFLE]: ROUTES.ALBUM_SHUFFLE,
  [PAGE_IDS.PLAYLIST_COMBINER]: ROUTES.PLAYLIST_COMBINER,
}

// Route to title mapping
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.SETTINGS]: 'Settings',
  [ROUTES.GET_TRACK_INFO]: 'Track Info',
  [ROUTES.PLAYLIST_TOOLS]: 'Playlist Tools',
  [ROUTES.ALBUM_SHUFFLE]: 'Album Shuffle',
  [ROUTES.PLAYLIST_COMBINER]: 'Playlist Combiner',
}

// External links
export const EXTERNAL_LINKS = {
  GITHUB_REPO: 'https://github.com/shinyczxx/spotify-tools',
} as const

// Default values
export const DEFAULT_PAGE_ID = PAGE_IDS.DASHBOARD
export const DEFAULT_TITLE = 'Dashboard'