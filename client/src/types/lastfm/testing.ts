/**
 * @file testing.ts
 * @description TypeScript types for Last.fm testing functionality
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

/**
 * Configuration options for Last.fm testing mode
 */
export interface LastFmTestingConfig {
  /** Whether testing mode is enabled */
  enabled: boolean
  /** Simulated API delay in milliseconds */
  apiDelay?: number
  /** Maximum number of mock results to return */
  maxResults?: number
}

/**
 * Mock album data structure for testing
 */
export interface MockAlbumData {
  name: string
  artist: string
  tags: string[]
}

/**
 * Extended useLastFm hook return type with testing capabilities
 */
export interface UseLastFmTestingResult {
  /** Whether testing mode is active */
  testingMode: boolean
  /** Whether Last.fm API key is available */
  hasApiKey: boolean
  /** Mock data generation status */
  mockDataStatus: 'idle' | 'generating' | 'ready' | 'error'
}