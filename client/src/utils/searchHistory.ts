/**
 * @file searchHistory.ts
 * @description Utility functions for managing persistent search
 * history in localStorage. Handles validation, error handling, and
 * linking to cached discovery results.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import { SpotifyAlbum, AlbumFilters } from "./albumOperations";

export interface SearchHistoryEntry {
  id: string;
  timestamp: number;
  playlistName: string;
  discoveredAlbums: SpotifyAlbum[]; // All albums found during discovery
  playlistAlbums: SpotifyAlbum[]; // Albums actually used in the created playlist
  filters: AlbumFilters;
  selectedPlaylistIds: string[];
  totalTracksCreated: number;
  cacheKey?: string; // Optional cache key for linking to cached discovery results
}

const SEARCH_HISTORY_KEY = "spotify-album-shuffle-history";
const MAX_HISTORY_ENTRIES = 50; // Limit to prevent localStorage from growing too large

/**
 * Get all search history entries from localStorage
 */
export function getSearchHistory(): SearchHistoryEntry[] {
  try {
    const historyJson = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!historyJson) return [];

    const rawHistory = JSON.parse(historyJson) as any[];

    // Filter out invalid entries and validate required fields
    const validHistory: SearchHistoryEntry[] = rawHistory.filter((entry) => {
      try {
        return (
          entry &&
          typeof entry.id === "string" &&
          typeof entry.timestamp === "number" &&
          typeof entry.playlistName === "string" &&
          Array.isArray(entry.discoveredAlbums) &&
          Array.isArray(entry.playlistAlbums) &&
          entry.filters &&
          Array.isArray(entry.selectedPlaylistIds) &&
          typeof entry.totalTracksCreated === "number"
        );
      } catch {
        return false;
      }
    });

    // Sort by timestamp (newest first)
    return validHistory.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error("Failed to load search history:", error);
    return [];
  }
}

/**
 * Add a new search history entry
 */
export function addSearchHistoryEntry(
  entry: Omit<SearchHistoryEntry, "id" | "timestamp">
): SearchHistoryEntry {
  try {
    const newEntry: SearchHistoryEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };

    const currentHistory = getSearchHistory();
    const updatedHistory = [newEntry, ...currentHistory];

    // Limit the number of entries
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ENTRIES);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));

    console.log("Added search history entry:", {
      id: newEntry.id,
      playlistName: newEntry.playlistName,
      discoveredAlbumCount: newEntry.discoveredAlbums.length,
      playlistAlbumCount: newEntry.playlistAlbums.length,
      filters: newEntry.filters,
    });

    return newEntry;
  } catch (error) {
    console.error("Failed to save search history entry:", error);
    throw error;
  }
}

/**
 * Remove a search history entry by ID
 */
export function removeSearchHistoryEntry(id: string): void {
  try {
    const currentHistory = getSearchHistory();
    const updatedHistory = currentHistory.filter((entry) => entry.id !== id);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));

    console.log("Removed search history entry:", id);
  } catch (error) {
    console.error("Failed to remove search history entry:", error);
    throw error;
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    console.log("Cleared all search history");
  } catch (error) {
    console.error("Failed to clear search history:", error);
    throw error;
  }
}

/**
 * Get a specific search history entry by ID
 */
export function getSearchHistoryEntry(id: string): SearchHistoryEntry | null {
  const history = getSearchHistory();
  return history.find((entry) => entry.id === id) || null;
}

/**
 * Generate a unique ID for search history entries
 */
function generateId(): string {
  return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Get summary text for filters
 */
export function getFiltersSummary(filters: AlbumFilters): string {
  const parts: string[] = [];

  if (!filters.includeSingles) parts.push("No Singles");
  if (!filters.includeCompilations) parts.push("No Compilations");

  parts.push(`${filters.shuffleType} shuffle`);

  return parts.length > 1 ? parts.join(", ") : parts[0] || "All types";
}
