/**
 * @file playlistSelectorUtils.ts
 * @description DEPRECATED: Utility functions moved to utils directory
 * @author GitHub Copilot
 * @version 1.1.0
 * @date 2025-07-17
 *
 * @ChangeLog
 * - 1.1.0: Functions moved to utils/stringUtils.ts and utils/sortingUtils.ts for better organization
 * - 1.0.0: Initial extraction from PlaylistSelector.tsx
 */

// Re-export from new locations for backward compatibility
export {
  decodeHtmlEntities,
  stripHtmlTags,
  cleanDescription,
} from '../../utils/stringUtils'

export {
  toSortableItem,
  sortPlaylistSelectorItems,
} from '../../utils/sortingUtils'
