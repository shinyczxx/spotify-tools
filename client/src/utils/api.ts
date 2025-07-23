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
   * Make a GET request to Spotify API
   */
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    if (!authToken) {
      throw new Error('No auth token available')
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

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
   * Make a POST request to Spotify API
   */
  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    if (!authToken) {
      throw new Error('No auth token available')
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

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
}

// Export singleton instance
const api = new ApiClient()
export default api