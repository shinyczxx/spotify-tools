/**
 * @file genreClassification.utils.ts
 * @description Utilities for classifying Last.fm tags into genre categories
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFmTag } from '../lastFmApi'

/**
 * Genre classification map for common Last.fm tags
 */
export const GENRE_CLASSIFICATION = {
  // Primary genres (high priority)
  primary: [
    'rock',
    'pop',
    'jazz',
    'blues',
    'country',
    'folk',
    'classical',
    'electronic',
    'dance',
    'house',
    'techno',
    'trance',
    'dubstep',
    'ambient',
    'experimental',
    'hip hop',
    'rap',
    'rnb',
    'soul',
    'funk',
    'reggae',
    'punk',
    'metal',
    'alternative',
    'indie',
    'grunge',
    'garage',
    'post-rock',
    'shoegaze',
  ],
  // Secondary genres (medium priority)
  secondary: [
    'alternative rock',
    'indie rock',
    'hard rock',
    'progressive rock',
    'art rock',
    'psychedelic',
    'synthpop',
    'electropop',
    'dream pop',
    'britpop',
    'new wave',
    'post-punk',
    'gothic',
    'darkwave',
    'industrial',
    'minimal',
    'downtempo',
    'chillout',
    'lounge',
    'trip hop',
    'drum and bass',
    'jungle',
    'breakbeat',
    'garage rock',
    'noise rock',
    'math rock',
    'emo',
    'hardcore',
    'metalcore',
    'black metal',
    'death metal',
    'thrash metal',
    'doom metal',
    'progressive metal',
  ],
  // Style/mood descriptors (lower priority)
  descriptive: [
    'melancholic',
    'atmospheric',
    'melodic',
    'rhythmic',
    'energetic',
    'mellow',
    'upbeat',
    'dark',
    'beautiful',
    'catchy',
    'emotional',
    'intense',
    'relaxing',
    'danceable',
    'groovy',
    'haunting',
    'dreamy',
    'aggressive',
    'peaceful',
    'epic',
  ],
  // Time period/geographical tags
  contextual: [
    '90s',
    '80s',
    '70s',
    '60s',
    '2000s',
    '2010s',
    'british',
    'american',
    'german',
    'french',
    'swedish',
    'icelandic',
    'canadian',
    'australian',
    'japanese',
  ],
}

/**
 * Utilities for genre classification from Last.fm tags
 */
export class GenreClassification {
  /**
   * Extract genre information from Last.fm tags
   */
  extractGenreFromTags(tags: LastFmTag[]): {
    primary: string | null
    secondary: string[]
  } {
    if (!tags || tags.length === 0) {
      return { primary: null, secondary: [] }
    }

    // Sort tags by count (popularity)
    const sortedTags = tags.sort((a, b) => b.count - a.count)

    let primaryGenre: string | null = null
    const secondaryGenres: string[] = []

    // Find primary genre
    for (const tag of sortedTags) {
      const tagName = tag.name.toLowerCase()

      // Check if it's a primary genre
      if (GENRE_CLASSIFICATION.primary.includes(tagName)) {
        if (!primaryGenre) {
          primaryGenre = tag.name
        } else if (!secondaryGenres.includes(tag.name)) {
          secondaryGenres.push(tag.name)
        }
      }
    }

    // If no primary genre found, check secondary genres
    if (!primaryGenre) {
      for (const tag of sortedTags) {
        const tagName = tag.name.toLowerCase()
        if (GENRE_CLASSIFICATION.secondary.includes(tagName)) {
          primaryGenre = tag.name
          break
        }
      }
    }

    // Add remaining secondary genres
    for (const tag of sortedTags.slice(0, 10)) { // Limit to top 10 tags
      const tagName = tag.name.toLowerCase()
      
      if (
        (GENRE_CLASSIFICATION.secondary.includes(tagName) || 
         GENRE_CLASSIFICATION.primary.includes(tagName)) &&
        tag.name !== primaryGenre &&
        !secondaryGenres.includes(tag.name) &&
        secondaryGenres.length < 5
      ) {
        secondaryGenres.push(tag.name)
      }
    }

    return { primary: primaryGenre, secondary: secondaryGenres }
  }

  /**
   * Calculate confidence score based on tag quality and count
   */
  calculateConfidence(tags: LastFmTag[]): number {
    if (!tags || tags.length === 0) return 0

    let confidence = 0

    // Base confidence on tag count and quality
    const totalTags = Math.min(tags.length, 20) // Cap at 20 for calculation
    const maxCount = Math.max(...tags.map(t => t.count))
    
    for (const tag of tags.slice(0, 10)) { // Consider top 10 tags
      const tagName = tag.name.toLowerCase()
      const normalizedCount = maxCount > 0 ? tag.count / maxCount : 0
      
      let tagWeight = 0
      
      if (GENRE_CLASSIFICATION.primary.includes(tagName)) {
        tagWeight = 1.0
      } else if (GENRE_CLASSIFICATION.secondary.includes(tagName)) {
        tagWeight = 0.7
      } else if (GENRE_CLASSIFICATION.descriptive.includes(tagName)) {
        tagWeight = 0.3
      } else if (GENRE_CLASSIFICATION.contextual.includes(tagName)) {
        tagWeight = 0.2
      } else {
        tagWeight = 0.1 // Unknown tags get minimal weight
      }
      
      confidence += tagWeight * normalizedCount * 0.1
    }

    // Bonus for having multiple tags
    confidence += Math.min(totalTags / 20, 1) * 0.2

    return Math.min(confidence, 1) // Cap at 1.0
  }

  /**
   * Check if a tag represents a musical genre
   */
  isGenreTag(tagName: string): boolean {
    const name = tagName.toLowerCase()
    return (
      GENRE_CLASSIFICATION.primary.includes(name) ||
      GENRE_CLASSIFICATION.secondary.includes(name)
    )
  }

  /**
   * Get tag category
   */
  getTagCategory(tagName: string): 'primary' | 'secondary' | 'descriptive' | 'contextual' | 'other' {
    const name = tagName.toLowerCase()
    
    if (GENRE_CLASSIFICATION.primary.includes(name)) return 'primary'
    if (GENRE_CLASSIFICATION.secondary.includes(name)) return 'secondary'
    if (GENRE_CLASSIFICATION.descriptive.includes(name)) return 'descriptive'
    if (GENRE_CLASSIFICATION.contextual.includes(name)) return 'contextual'
    
    return 'other'
  }
}