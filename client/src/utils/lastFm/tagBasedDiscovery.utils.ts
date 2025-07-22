/**
 * @file tagBasedDiscovery.utils.ts
 * @description Utilities for discovering albums through Last.fm tags
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { LastFm, LastFmTag } from '../lastFmApi'
import type { RelatedAlbumResult } from '../lastFmRelated'

/**
 * Find albums by tags using Last.fm API
 */
export class TagBasedDiscovery {
  private lastFm: LastFm

  constructor(lastFm: LastFm) {
    this.lastFm = lastFm
  }

  /**
   * Find albums by tags
   */
  async findAlbumsByTags(
    tags: LastFmTag[],
    maxAlbums: number,
    minTagCount: number,
  ): Promise<RelatedAlbumResult[]> {
    const albums: RelatedAlbumResult[] = []
    const seenAlbumIds = new Set<string>()

    // Sort tags by count (popularity) and take the most relevant ones
    const sortedTags = tags
      .filter((tag) => tag.count >= minTagCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Use top 8 tags maximum

    for (const tag of sortedTags) {
      if (albums.length >= maxAlbums) break

      try {
        const tagAlbums = await this.lastFm.tag.getTopAlbums(tag.name, {
          limit: Math.min(20, Math.ceil(maxAlbums / sortedTags.length) + 5),
        })

        for (const album of tagAlbums) {
          if (albums.length >= maxAlbums) break

          const albumKey = `${album.name}-${
            typeof album.artist === 'string' ? album.artist : album.artist.name
          }`
          if (seenAlbumIds.has(albumKey)) continue

          seenAlbumIds.add(albumKey)

          // Calculate tag-based score
          const tagScore = this.calculateTagScore(tag, tags)

          albums.push({
            album,
            score: tagScore,
            source: 'tag',
            sourceDetails: {
              matchingTags: [tag.name],
              tagScore,
            },
          })
        }
      } catch (error) {
        console.warn(`Could not fetch albums for tag "${tag.name}":`, error)
      }
    }

    return albums
  }

  /**
   * Calculate score for a tag based on its relevance
   */
  private calculateTagScore(tag: LastFmTag, allTags: LastFmTag[]): number {
    // Normalize tag count based on the maximum count in the tag list
    const maxCount = Math.max(...allTags.map(t => t.count))
    const normalizedCount = maxCount > 0 ? tag.count / maxCount : 0
    
    // Score between 0.1 and 1.0 based on tag popularity
    return Math.max(0.1, normalizedCount)
  }
}