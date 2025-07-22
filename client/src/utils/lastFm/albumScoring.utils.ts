/**
 * @file albumScoring.utils.ts
 * @description Utilities for scoring and combining album results
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import type { RelatedAlbumResult } from '../lastFmRelated'

/**
 * Utilities for scoring and combining album results
 */
export class AlbumScoring {
  /**
   * Combine and score albums from different sources
   */
  combineAndScoreAlbums(
    albums: RelatedAlbumResult[],
    tagWeight: number,
    artistWeight: number,
    diversityFactor: number,
  ): RelatedAlbumResult[] {
    // Group albums by unique identifier
    const albumMap = new Map<string, RelatedAlbumResult[]>()

    albums.forEach((album) => {
      const key = `${album.album.name}-${
        typeof album.album.artist === 'string' ? album.album.artist : album.album.artist.name
      }`
      if (!albumMap.has(key)) {
        albumMap.set(key, [])
      }
      albumMap.get(key)!.push(album)
    })

    // Combine scores for albums found through multiple sources
    const combinedAlbums: RelatedAlbumResult[] = []

    albumMap.forEach((albumGroup) => {
      if (albumGroup.length === 1) {
        // Single source album
        const album = albumGroup[0]
        let finalScore = album.score

        if (album.source === 'tag') {
          finalScore *= tagWeight
        } else if (album.source === 'similar_artist') {
          finalScore *= artistWeight
        }

        combinedAlbums.push({
          ...album,
          score: finalScore,
        })
      } else {
        // Multi-source album - combine scores
        const tagAlbums = albumGroup.filter(a => a.source === 'tag')
        const artistAlbums = albumGroup.filter(a => a.source === 'similar_artist')
        
        let combinedScore = 0
        let combinedSource: 'tag' | 'similar_artist' | 'combined' = 'combined'
        const sourceDetails: any = {}

        if (tagAlbums.length > 0) {
          const tagScore = Math.max(...tagAlbums.map(a => a.score)) * tagWeight
          combinedScore += tagScore
          sourceDetails.tagScore = tagScore
          sourceDetails.matchingTags = Array.from(new Set(
            tagAlbums.flatMap(a => a.sourceDetails.matchingTags || [])
          ))
        }

        if (artistAlbums.length > 0) {
          const artistScore = Math.max(...artistAlbums.map(a => a.score)) * artistWeight
          combinedScore += artistScore
          sourceDetails.artistScore = artistScore
          sourceDetails.similarArtist = artistAlbums[0].sourceDetails.similarArtist
        }

        // Boost score for multi-source albums (indicates higher relevance)
        combinedScore *= 1.2

        combinedAlbums.push({
          album: albumGroup[0].album,
          score: combinedScore,
          source: combinedSource,
          sourceDetails,
        })
      }
    })

    return combinedAlbums.sort((a, b) => b.score - a.score)
  }

  /**
   * Select albums with algorithmic randomness while preserving quality
   */
  selectAlbumsWithRandomness(
    albums: RelatedAlbumResult[],
    maxResults: number,
    diversityFactor: number,
  ): RelatedAlbumResult[] {
    if (albums.length <= maxResults) {
      return albums
    }

    // Split albums into tiers based on score
    const sortedAlbums = albums.sort((a, b) => b.score - a.score)
    const topTier = sortedAlbums.slice(0, Math.ceil(albums.length * 0.3))
    const midTier = sortedAlbums.slice(Math.ceil(albums.length * 0.3), Math.ceil(albums.length * 0.7))
    const lowTier = sortedAlbums.slice(Math.ceil(albums.length * 0.7))

    const selected: RelatedAlbumResult[] = []
    const seenArtists = new Set<string>()

    // Weights for random selection from each tier
    const topWeight = 0.6
    const midWeight = 0.3
    const lowWeight = 0.1

    while (selected.length < maxResults) {
      const rand = Math.random()
      let selectedAlbum: RelatedAlbumResult | null = null

      if (rand < topWeight && topTier.length > 0) {
        selectedAlbum = this.selectRandomAlbum(topTier, seenArtists, diversityFactor)
      } else if (rand < topWeight + midWeight && midTier.length > 0) {
        selectedAlbum = this.selectRandomAlbum(midTier, seenArtists, diversityFactor)
      } else if (lowTier.length > 0) {
        selectedAlbum = this.selectRandomAlbum(lowTier, seenArtists, diversityFactor)
      }

      if (selectedAlbum) {
        selected.push(selectedAlbum)
        const artistName = typeof selectedAlbum.album.artist === 'string' 
          ? selectedAlbum.album.artist 
          : selectedAlbum.album.artist.name
        seenArtists.add(artistName.toLowerCase())

        // Remove selected album from all tiers
        this.removeAlbumFromTier(topTier, selectedAlbum)
        this.removeAlbumFromTier(midTier, selectedAlbum)
        this.removeAlbumFromTier(lowTier, selectedAlbum)
      }

      // Safety break if no more albums available
      if (topTier.length === 0 && midTier.length === 0 && lowTier.length === 0) {
        break
      }
    }

    return selected
  }

  /**
   * Select a random album from a tier, considering diversity
   */
  private selectRandomAlbum(
    tier: RelatedAlbumResult[],
    seenArtists: Set<string>,
    diversityFactor: number,
  ): RelatedAlbumResult | null {
    if (tier.length === 0) return null

    // Filter for new artists if diversity is important and we have options
    let candidateAlbums = tier
    if (diversityFactor > 0.5 && seenArtists.size > 0) {
      const newArtistAlbums = tier.filter(album => {
        const artistName = typeof album.album.artist === 'string' 
          ? album.album.artist 
          : album.album.artist.name
        return !seenArtists.has(artistName.toLowerCase())
      })
      
      if (newArtistAlbums.length > 0) {
        candidateAlbums = newArtistAlbums
      }
    }

    const randomIndex = Math.floor(Math.random() * candidateAlbums.length)
    return candidateAlbums[randomIndex]
  }

  /**
   * Remove an album from a tier
   */
  private removeAlbumFromTier(tier: RelatedAlbumResult[], albumToRemove: RelatedAlbumResult): void {
    const index = tier.findIndex(album => 
      album.album.name === albumToRemove.album.name &&
      (typeof album.album.artist === 'string' ? album.album.artist : album.album.artist.name) ===
      (typeof albumToRemove.album.artist === 'string' ? albumToRemove.album.artist : albumToRemove.album.artist.name)
    )
    if (index > -1) {
      tier.splice(index, 1)
    }
  }
}