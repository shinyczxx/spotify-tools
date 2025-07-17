/**
 * @file sortingUtils.ts
 * @description Utility functions for sorting data structures
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.0.0: Extracted from PlaylistSelector component utils
 */

// Re-export types for backward compatibility
export type { PlaylistItem, AlbumItem } from '../types/spotify'

/**
 * Standardizes a PlaylistItem or AlbumItem into a sortable object.
 * @param item - The playlist or album item
 * @param type - 'playlist' or 'album'
 * @returns An object with standardized sortable fields
 */
export function toSortableItem(item: any, type: 'playlist' | 'album') {
  if (type === 'playlist') {
    const playlist = item
    return {
      id: playlist.id,
      name: playlist.name.toLowerCase(),
      tracks: playlist.tracks.total,
      date: playlist.id, // fallback for playlists
      owner: playlist.owner.display_name.toLowerCase(),
    }
  } else {
    const album = item
    return {
      id: album.id,
      name: album.name.toLowerCase(),
      tracks: album.total_tracks,
      date: album.release_date,
      owner: album.artists[0]?.name.toLowerCase() || '',
    }
  }
}

/**
 * Sorts playlist or album items based on the specified criteria using standardized data.
 * @param items - The array of items to sort
 * @param sortBy - The criteria to sort by: 'default', 'name', 'tracks', 'date', or 'owner'
 * @param sortOrder - The order to sort in: 'asc' for ascending or 'desc' for descending
 * @param type - The type of items: 'playlist' or 'album'
 * @returns A new array with the sorted items
 */
export function sortPlaylistSelectorItems(
  items: any[],
  sortBy: 'default' | 'name' | 'tracks' | 'date' | 'owner',
  sortOrder: 'asc' | 'desc',
  type: 'playlist' | 'album',
): any[] {
  if (sortBy === 'default') {
    return [...items]
  }
  // Standardize all items first
  const sortable = items.map((item) => ({
    original: item,
    ...toSortableItem(item, type),
  }))
  const sorted = sortable.sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    } else {
      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    }
  })
  return sorted.map((s) => s.original)
}