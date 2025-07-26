/**
 * @file epChecker.ts
 * @description Utility for differentiating EPs from singles based on track analysis
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-25
 */

import type { Track, Album } from 'types/spotify'

/**
 * Interface for the EP checker result
 */
export interface EpCheckResult {
  albumType: 'single' | 'ep'
  originalTrackCount: number
  cleanedTrackCount: number
  cleanedTracks: Track[]
  removedTracks: Track[]
}

/**
 * Checks if a single should be reclassified as an EP based on track analysis
 * 
 * Logic:
 * 1. Takes a track with album_type 'single'
 * 2. Gets the full album information 
 * 3. Cleans track names by removing remix/slow/acoustic versions
 * 4. If >4 tracks remain after cleaning, reclassifies as 'ep'
 * 
 * @param track - Track object with album_type 'single'
 * @returns Promise<EpCheckResult> - Result of EP analysis
 */
export async function checkIfEp(track: Track): Promise<EpCheckResult> {
  // Early return if not a single
  if (track.album.album_type !== 'single') {
    throw new Error('EP checker can only be used on tracks with album_type "single"')
  }

  // Get album data (should include tracks from the API response)
  const album = track.album
  const tracks = album.tracks?.items || []

  // If no tracks data, return as single
  if (tracks.length === 0) {
    return {
      albumType: 'single',
      originalTrackCount: 0,
      cleanedTrackCount: 0,
      cleanedTracks: [],
      removedTracks: []
    }
  }

  // Clean track names to identify main tracks vs variants
  const { cleanedTracks, removedTracks } = cleanTrackVariants(tracks, album.name)

  // Determine if it's an EP based on cleaned track count
  const albumType = cleanedTracks.length > 4 ? 'ep' : 'single'

  return {
    albumType,
    originalTrackCount: tracks.length,
    cleanedTrackCount: cleanedTracks.length,
    cleanedTracks,
    removedTracks
  }
}

/**
 * Cleans track variants (remixes, acoustic, slow versions, etc.) from a track list
 * 
 * @param tracks - Array of tracks to clean
 * @param albumName - Name of the album to help identify main tracks
 * @returns Object with cleaned and removed tracks
 */
function cleanTrackVariants(tracks: Track[], albumName: string): { 
  cleanedTracks: Track[], 
  removedTracks: Track[] 
} {
  const cleanedTracks: Track[] = []
  const removedTracks: Track[] = []

  // Create a map to track main track names and their variants
  const trackGroups = new Map<string, { main: Track | null, variants: Track[] }>()

  for (const track of tracks) {
    const trackName = track.name.toLowerCase().trim()
    const mainTrackName = extractMainTrackName(trackName)

    // Skip very short track names (common words) that could cause false matches
    if (mainTrackName.length <= 2) {
      cleanedTracks.push(track)
      continue
    }

    // Initialize group if it doesn't exist
    if (!trackGroups.has(mainTrackName)) {
      trackGroups.set(mainTrackName, { main: null, variants: [] })
    }

    const group = trackGroups.get(mainTrackName)!

    // Determine if this is a main track or variant
    if (isMainTrack(trackName, mainTrackName, albumName)) {
      group.main = track
    } else {
      group.variants.push(track)
    }
  }

  // Process groups to determine final cleaned tracks
  for (const [mainName, group] of trackGroups) {
    if (group.main) {
      // Use the main track
      cleanedTracks.push(group.main)
      removedTracks.push(...group.variants)
    } else if (group.variants.length > 0) {
      // No clear main track, keep the first variant and remove others
      cleanedTracks.push(group.variants[0])
      removedTracks.push(...group.variants.slice(1))
    }
  }

  return { cleanedTracks, removedTracks }
}

/**
 * Extracts the main track name by removing variant indicators
 * 
 * @param trackName - Full track name in lowercase
 * @returns Main track name without variant indicators
 */
function extractMainTrackName(trackName: string): string {
  // Remove common variant patterns
  const variantPatterns = [
    /\s*\(.*remix.*\)/gi,
    /\s*\(.*slow.*\)/gi,
    /\s*\(.*fast.*\)/gi,
    /\s*\(.*acoustic.*\)/gi,
    /\s*\(.*instrumental.*\)/gi,
    /\s*\(.*radio.*edit.*\)/gi,
    /\s*\(.*extended.*\)/gi,
    /\s*\(.*clean.*\)/gi,
    /\s*\(.*explicit.*\)/gi,
    /\s*\(.*live.*\)/gi,
    /\s*\(.*demo.*\)/gi,
    /\s*\(.*alt.*version.*\)/gi,
    /\s*\(.*alternative.*\)/gi,
    /\s*\(.*feat\..*\)/gi,
    /\s*\(.*featuring.*\)/gi,
    /\s*-\s*remix/gi,
    /\s*-\s*slow/gi,
    /\s*-\s*acoustic/gi,
    /\s*-\s*instrumental/gi,
    /\s*-\s*radio\s*edit/gi,
    /\s*-\s*extended/gi,
    /\s*-\s*live/gi,
    /\s*-\s*demo/gi
  ]

  let mainName = trackName
  for (const pattern of variantPatterns) {
    mainName = mainName.replace(pattern, '').trim()
  }

  return mainName
}

/**
 * Determines if a track is likely the main version vs a variant
 * 
 * @param fullTrackName - Complete track name in lowercase
 * @param mainTrackName - Extracted main track name
 * @param albumName - Album name for additional context
 * @returns True if this appears to be the main track
 */
function isMainTrack(fullTrackName: string, mainTrackName: string, albumName: string): boolean {
  // If the track name equals the main name, it's likely the main track
  if (fullTrackName === mainTrackName) {
    return true
  }

  // If the track name matches the album name, it's likely the main track
  if (fullTrackName === albumName.toLowerCase().trim()) {
    return true
  }

  // Check for variant indicators - if present, it's not the main track
  const variantIndicators = [
    'remix', 'slow', 'fast', 'acoustic', 'instrumental', 
    'radio edit', 'extended', 'clean', 'explicit', 'live', 
    'demo', 'alt version', 'alternative', 'feat.', 'featuring'
  ]

  for (const indicator of variantIndicators) {
    if (fullTrackName.includes(indicator)) {
      return false
    }
  }

  // Check for parentheses or dashes that might indicate variants
  if (fullTrackName.includes('(') || fullTrackName.includes(' - ')) {
    // If the part before the parentheses/dash matches the main name, this might be a variant
    const beforeParens = fullTrackName.split(/[\(\-]/)[0].trim()
    if (beforeParens === mainTrackName) {
      return false
    }
  }

  // Default to main track if no variant indicators found
  return true
}

/**
 * Utility function to get EP/single classification for multiple tracks
 * 
 * @param tracks - Array of tracks to classify
 * @returns Promise<Map<string, EpCheckResult>> - Map of track IDs to their EP check results
 */
export async function batchCheckEps(tracks: Track[]): Promise<Map<string, EpCheckResult>> {
  const results = new Map<string, EpCheckResult>()
  
  for (const track of tracks) {
    if (track.album.album_type === 'single') {
      try {
        const result = await checkIfEp(track)
        results.set(track.id, result)
      } catch (error) {
        console.warn(`Failed to check EP status for track ${track.id}:`, error)
      }
    }
  }
  
  return results
}