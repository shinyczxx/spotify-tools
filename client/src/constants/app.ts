/**
 * @file app.ts
 * @description Application-wide constants
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

// Font size constraints
export const FONT_SIZE = {
  MIN: 10,
  MAX: 32,
  DEFAULT: 14,
} as const

// LocalStorage keys
export const STORAGE_KEYS = {
  FONT_SIZE: 'terminal-font-size',
  BETA_BANNER_DISMISSED: 'beta-banner-dismissed',
  SPOTIFY_ACCESS_TOKEN: 'spotify_access_token',
  SPOTIFY_REFRESH_TOKEN: 'spotify_refresh_token',
} as const

// Timing constants
export const TIMING = {
  CALLBACK_CLEAR_DELAY: 2000,
  RATE_LIMIT_RETRY_BASE: 1000,
} as const

// External links
export const EXTERNAL_LINKS = {
  GITHUB_REPO: 'https://github.com/shinyczxx/spotify-tools',
} as const