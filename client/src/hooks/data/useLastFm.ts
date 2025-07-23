/**
 * @file useLastFm.ts
 * @description Hook for Last.fm API operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import { useState, useEffect, useMemo } from 'react'
import { LastFmService, LastFmSearchResult } from '@services/lastfm'

export const useLastFm = () => {
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize Last.fm service
  const lastFmService = useMemo(() => {
    const apiKey = import.meta.env.VITE_LASTFM_API_KEY
    if (!apiKey) {
      console.warn('VITE_LASTFM_API_KEY not found, Last.fm features will be limited')
      return null
    }
    return new LastFmService(apiKey)
  }, [])

  // Load popular tags on mount
  useEffect(() => {
    const loadPopularTags = async () => {
      if (!lastFmService) {
        // Use default tags if no API key
        setPopularTags([
          'rock', 'pop', 'alternative', 'indie', 'electronic', 'jazz', 'hip hop',
          'metal', 'punk', 'blues', 'folk', 'ambient', 'experimental'
        ])
        return
      }

      try {
        setLoading(true)
        const tags = await lastFmService.getTopTags(50)
        setPopularTags(tags)
      } catch (err) {
        console.error('Failed to load popular tags:', err)
        setError('Failed to load popular tags')
      } finally {
        setLoading(false)
      }
    }

    loadPopularTags()
  }, [lastFmService])

  /**
   * Search for albums by tags
   */
  const searchAlbumsByTags = async (tags: string[]): Promise<LastFmSearchResult[]> => {
    if (!lastFmService) {
      throw new Error('Last.fm API key is required')
    }

    if (tags.length === 0) {
      throw new Error('At least one tag is required')
    }

    setLoading(true)
    setError(null)

    try {
      const results = await lastFmService.searchAlbumsByTags(tags, 20)
      return results
    } catch (err) {
      const errorMessage = 'Failed to search albums'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Validate a tag
   */
  const validateTag = async (tag: string): Promise<boolean | string> => {
    if (!lastFmService) {
      // Basic validation when no API key
      const trimmed = tag.trim().toLowerCase()
      if (trimmed.length < 2) {
        return 'Tag must be at least 2 characters'
      }
      if (trimmed.length > 50) {
        return 'Tag must be less than 50 characters'
      }
      if (!/^[a-z0-9\s\-&]+$/i.test(trimmed)) {
        return 'Tag contains invalid characters'
      }
      return true
    }

    try {
      const isValid = await lastFmService.validateTag(tag)
      return isValid || 'Tag not found on Last.fm'
    } catch (err) {
      console.error('Error validating tag:', err)
      return 'Unable to validate tag'
    }
  }

  /**
   * Get suggested tags based on input
   */
  const getSuggestedTags = (input: string): string[] => {
    if (!input || input.length < 1) {
      // Return most popular tags when no input
      return popularTags.slice(0, 8)
    }

    const lowercaseInput = input.toLowerCase()
    return popularTags
      .filter(tag => tag.toLowerCase().includes(lowercaseInput))
      .slice(0, 8)
  }

  return {
    lastFmService,
    popularTags,
    loading,
    error,
    searchAlbumsByTags,
    validateTag,
    getSuggestedTags,
    isAvailable: !!lastFmService,
  }
}