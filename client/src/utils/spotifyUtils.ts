/**
 * @file spotifyUtils.ts
 * @description Utility functions for working with Spotify URLs and track IDs
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-06
 *
 * @UsedBy
 * - GetTrackInfo.tsx
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with track ID extraction from URLs
 */

/**
 * Extracts a Spotify track ID from either a direct ID or a Spotify URL
 * @param input - Either a Spotify track ID or a Spotify URL
 * @returns The extracted track ID or the original input if it's already an ID
 * @throws Error if the input is invalid
 */
export function extractSpotifyTrackId(input: string): string {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmedInput = input.trim();

  // Check if it's already a track ID (alphanumeric, typically 22 characters)
  if (/^[a-zA-Z0-9]{22}$/.test(trimmedInput)) {
    return trimmedInput;
  }

  // Check if it's a Spotify URL
  const spotifyUrlRegex = /^https?:\/\/open\.spotify\.com\/track\/([a-zA-Z0-9]{22})(\?.*)?$/;
  const match = trimmedInput.match(spotifyUrlRegex);

  if (match && match[1]) {
    return match[1];
  }

  // If it's not a valid ID or URL, throw an error
  throw new Error('Invalid Spotify track ID or URL. Please provide either a valid track ID or a Spotify track URL.');
}

/**
 * Validates if a string is a valid Spotify track ID
 * @param trackId - The track ID to validate
 * @returns True if valid, false otherwise
 */
export function isValidSpotifyTrackId(trackId: string): boolean {
  return /^[a-zA-Z0-9]{22}$/.test(trackId);
}

/**
 * Validates if a string is a valid Spotify track URL
 * @param url - The URL to validate
 * @returns True if valid, false otherwise
 */
export function isValidSpotifyTrackUrl(url: string): boolean {
  const spotifyUrlRegex = /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]{22}(\?.*)?$/;
  return spotifyUrlRegex.test(url);
}
