/**
 * @file useLastFm.ts
 * @description Hook for Last.fm API operations
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import { useState, useEffect, useMemo } from 'react'
import { LastFmService, LastFmSearchResult } from '@services/lastfm'
import { generateMockAlbumData, simulateApiDelay } from '@utils/lastfm/mockDataUtils'
import { getEnvVar } from '@utils/config/env'

export const useLastFm = (testingMode: boolean = false) => {
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMoreTags, setHasMoreTags] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Initialize Last.fm service
  const lastFmService = useMemo(() => {
    if (testingMode) {
      console.log('🧪 useLastFm: Testing mode enabled, using mock service')
      return null
    }
    try {
      const apiKey = getEnvVar('VITE_LASTFM_API_KEY')
      console.log('🔧 useLastFm: Creating LastFmService with API key')
      return new LastFmService(apiKey)
    } catch (error) {
      console.warn('🚫 useLastFm: VITE_LASTFM_API_KEY not found, Last.fm features will be limited', error)
      return null
    }
  }, [testingMode])

  // Load popular tags on mount
  useEffect(() => {
    const loadPopularTags = async () => {
      if (testingMode) {
        // Use default tags in testing mode only
        setPopularTags([
          'rock', 'pop', 'alternative', 'indie', 'electronic', 'jazz', 'hip hop',
          'metal', 'punk', 'blues', 'folk', 'ambient', 'experimental'
        ])
        return
      }

      if (!lastFmService) {
        // No API key available - set error and empty tags
        setError('Last.fm API key required to load tags')
        setPopularTags([])
        return
      }

      try {
        setLoading(true)
        setError(null) // Clear any previous errors
        console.log('🔄 useLastFm: Starting to load popular tags...')
        const result = await lastFmService.getTopTags(50, 1)
        console.log(`✅ useLastFm: Successfully loaded ${result.tags.length} popular tags`)
        setPopularTags(result.tags)
        setCurrentPage(result.currentPage)
        setTotalPages(result.totalPages)
        setHasMoreTags(result.hasMore)
      } catch (err) {
        console.error('❌ useLastFm: Failed to load popular tags:', err)
        setError('Failed to load popular tags from Last.fm API')
        setPopularTags([])
      } finally {
        setLoading(false)
      }
    }

    loadPopularTags()
  }, [lastFmService, testingMode])

  /**
   * Search for albums by tags
   */
  const searchAlbumsByTags = async (tags: string[]): Promise<LastFmSearchResult[]> => {
    if (tags.length === 0) {
      throw new Error('At least one tag is required')
    }

    setLoading(true)
    setError(null)

    try {
      if (testingMode) {
        // Return mock data in testing mode
        await simulateApiDelay(1000) // Simulate API delay
        return generateMockAlbumData(tags)
      }

      if (!lastFmService) {
        throw new Error('Last.fm API key is required')
      }

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
    if (!lastFmService || testingMode) {
      // Basic validation when no API key or in testing mode
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
   * Load more tags for pagination
   */
  const loadMoreTags = async (): Promise<void> => {
    if (!hasMoreTags || loadingMore || !lastFmService || testingMode) {
      return
    }

    const nextPage = currentPage + 1
    try {
      setLoadingMore(true)
      setError(null)
      console.log(`🔄 useLastFm: Loading more tags (requesting page ${nextPage})...`)
      
      const result = await lastFmService.getTopTags(50, nextPage)
      console.log(`✅ useLastFm: Successfully loaded ${result.tags.length} more tags (received page ${result.currentPage})`)
      
      // Only update if we got a different page than what we already have
      if (result.currentPage > currentPage) {
        setPopularTags(prev => [...prev, ...result.tags])
        setCurrentPage(result.currentPage)
        setTotalPages(result.totalPages)
        setHasMoreTags(result.hasMore)
      } else {
        console.warn(`🚫 useLastFm: Received duplicate page ${result.currentPage}, expected ${nextPage}`)
      }
    } catch (err) {
      console.error('❌ useLastFm: Failed to load more tags:', err)
      setError('Failed to load more tags from Last.fm API')
    } finally {
      setLoadingMore(false)
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
    loadMoreTags,
    hasMoreTags,
    loadingMore,
    currentPage,
    totalPages,
    isAvailable: testingMode || !!lastFmService,
    testingMode,
  }
}