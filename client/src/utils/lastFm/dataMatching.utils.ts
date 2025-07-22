/**
 * @file dataMatching.utils.ts
 * @description Utilities for matching and cleaning Spotify/Last.fm data
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import type { SpotifyArtist } from '../spotifyApi'

/**
 * Utilities for data matching and cleaning
 */
export class DataMatching {
  /**
   * Extract primary artist name from Spotify artists array
   */
  extractPrimaryArtistName(artists: SpotifyArtist[]): string {
    if (!artists || artists.length === 0) {
      throw new Error('No artists provided')
    }
    return artists[0].name
  }

  /**
   * Clean title for better Last.fm matching
   */
  cleanTitle(title: string): string {
    // Remove common variations that might not match on Last.fm
    return title
      .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
      .replace(/\s*\[.*?\]\s*/g, '') // Remove brackets content
      .replace(/\s*-\s*(Remaster|Deluxe|Expanded|Edition).*$/i, '') // Remove remaster/edition info
      .replace(/\s*\((19|20)\d{2}.*?\)/g, '') // Remove year info
      .trim()
  }

  /**
   * Calculate similarity score between two strings
   */
  calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim()
    const s2 = str2.toLowerCase().trim()
    
    if (s1 === s2) return 1.0
    
    // Simple Levenshtein distance approximation
    const longer = s1.length > s2.length ? s1 : s2
    const shorter = s1.length > s2.length ? s2 : s1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + cost // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Normalize string for better matching
   */
  normalizeString(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Check if strings are likely the same entity (artist/album/track)
   */
  isLikelyMatch(name1: string, name2: string, threshold: number = 0.8): boolean {
    const normalized1 = this.normalizeString(name1)
    const normalized2 = this.normalizeString(name2)
    
    // Exact match
    if (normalized1 === normalized2) return true
    
    // Similarity score
    const similarity = this.calculateSimilarity(normalized1, normalized2)
    return similarity >= threshold
  }

  /**
   * Extract year from various string formats
   */
  extractYear(str: string): number | null {
    const yearMatch = str.match(/\b(19|20)\d{2}\b/)
    return yearMatch ? parseInt(yearMatch[0]) : null
  }
}