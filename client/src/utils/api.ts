/**
 * @file api.ts
 * @description API client wrapper for Spotify Web API calls
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

// Type for token update callback
type TokenUpdateCallback = (accessToken: string, refreshToken: string) => void

// Global state for API client
let authToken: string | null = null
let tokenUpdateCallback: TokenUpdateCallback | null = null
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/**
 * Set the auth token for API requests
 */
export const setAuthToken = (token: string | null): void => {
  authToken = token
}

/**
 * Set the callback for automatic token updates
 */
export const setTokenUpdateCallback = (callback: TokenUpdateCallback): void => {
  tokenUpdateCallback = callback
}

/**
 * API response interface
 */
interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
}

/**
 * Simple API client for Spotify Web API
 */
class ApiClient {
  private baseURL = 'https://api.spotify.com/v1'

  /**
   * Make a GET request to Spotify API with automatic retry on 401
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint)
  }

  /**
   * Make a POST request to Spotify API with automatic retry on 401
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, body)
  }

  /**
   * Generic request method with automatic token refresh on 401
   */
  private async makeRequest<T = any>(method: 'GET' | 'POST', endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    if (!authToken) {
      throw new Error('No auth token available')
    }

    // Make the request
    let response = await this.performRequest(url, method, authToken, body)

    // If we get a 401 and have a token update callback, try to refresh
    if (response.status === 401 && tokenUpdateCallback) {
      console.log('[API] Got 401, attempting token refresh...')
      
      // Prevent multiple simultaneous refresh attempts
      if (isRefreshing) {
        if (refreshPromise) {
          await refreshPromise
          // Try the request again with the refreshed token
          if (authToken) {
            response = await this.performRequest(url, method, authToken, body)
          }
        }
      } else {
        isRefreshing = true
        refreshPromise = this.attemptTokenRefresh()
        
        try {
          await refreshPromise
          // Retry the request with the new token
          if (authToken) {
            response = await this.performRequest(url, method, authToken, body)
          }
        } finally {
          isRefreshing = false
          refreshPromise = null
        }
      }
    }

    if (!response.ok) {
      const error = new Error(`API request failed: ${response.status} ${response.statusText}`)
      
      // Add response object to error for compatibility
      const responseObj = {
        status: response.status,
        statusText: response.statusText,
      }
      ;(error as any).response = responseObj
      
      throw error
    }

    const data = await response.json()
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    }
  }

  /**
   * Perform the actual HTTP request
   */
  private async performRequest(url: string, method: 'GET' | 'POST', token: string, body?: any): Promise<Response> {
    return fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  /**
   * Attempt to refresh the token using the stored refresh token
   */
  private async attemptTokenRefresh(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('spotify_refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Import and use the refresh function
      const { refreshSpotifyToken } = await import('@utils/auth/spotifyAuth')
      const newAccessToken = await refreshSpotifyToken(refreshToken)
      
      if (newAccessToken && tokenUpdateCallback) {
        console.log('[API] Token refreshed successfully')
        tokenUpdateCallback(newAccessToken, refreshToken)
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('[API] Token refresh failed:', error)
      // Don't throw here - let the calling code handle the 401
    }
  }
}

// Export singleton instance
const spotifyApi = new ApiClient()
export default spotifyApi