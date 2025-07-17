/**
 * @file index.ts
 * @description Barrel export for all application hooks
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-15
 */

// Auth hooks
export { default as useSpotifyAuth } from './auth/useSpotifyAuth'

// Data hooks
export { default as usePlaylistOperations } from './data/usePlaylistOperations'

// UI hooks
export { default as useBreakpoint } from './ui/useBreakpoint'
export { default as useGridBackground } from './ui/useGridBackground'
export { default as usePanelRects } from './ui/usePanelRects'
export { useFormHandler } from './ui/useFormHandler'
export { useLoadingState } from './ui/useLoadingState'
export { useAsyncAction } from './ui/useAsyncAction'
export { usePagination } from './ui/usePagination'