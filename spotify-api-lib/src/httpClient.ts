/**
 * @file httpClient.ts
 * @description HTTP client for making requests to Spotify API
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  retries?: number
}

export interface SpotifyApiError extends Error {
  status?: number
  response?: any
}

// HTTP status codes that should be retried
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

export class SpotifyHttpClient {
  private client: AxiosInstance
  private accessToken: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken || ''
    
    this.client = axios.create({
      baseURL: 'https://api.spotify.com/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Set up request interceptor to add auth header
    this.client.interceptors.request.use((config: any) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    // Set up response interceptor for error handling
    this.client.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          console.error('Spotify API: Unauthorized - token may be expired')
        } else if (error.response?.status === 429) {
          console.error('Spotify API: Rate limited')
        } else if (error.response?.status >= 500) {
          console.error('Spotify API: Server error')
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Set the access token for authentication
   */
  setAccessToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Clear the access token
   */
  clearAccessToken(): void {
    this.accessToken = ''
  }

  /**
   * Make an HTTP request to the Spotify API with improved error handling
   */
  async request<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    const maxRetries = options?.retries ?? 3
    let attempt = 0
    let lastError: SpotifyApiError | null = null

    while (attempt <= maxRetries) {
      try {
        const config: AxiosRequestConfig = {
          url: endpoint,
          method: options?.method || 'GET',
          data: options?.data,
          params: options?.params,
          headers: options?.headers,
        }
        
        const response: AxiosResponse<T> = await this.client.request(config)
        return response.data
      } catch (error: any) {
        const status = error?.response?.status
        lastError = this.createSpotifyError(error)
        
        // Don't retry on first attempt for non-retryable errors
        if (attempt === 0 && !this.isRetryableError(status)) {
          throw lastError
        }
        
        // Handle rate limiting with exponential backoff
        if (status === 429) {
          const retryAfter = this.getRetryAfterDelay(error.response.headers?.['retry-after'])
          console.warn(`Spotify API rate limited. Retrying after ${retryAfter}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
          await this.delay(retryAfter)
        } else if (this.isRetryableError(status)) {
          // Exponential backoff for other retryable errors
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000) + Math.random() * 1000
          console.warn(`Spotify API error ${status}. Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`)
          await this.delay(delay)
        } else {
          // Non-retryable error
          throw lastError
        }
        
        attempt++
      }
    }
    
    throw lastError || new Error('Spotify API request failed after all retries')
  }

  /**
   * Check if an HTTP status code should be retried
   */
  private isRetryableError(status?: number): boolean {
    return status ? RETRYABLE_STATUS_CODES.has(status) : false
  }

  /**
   * Get retry delay from Retry-After header or default
   */
  private getRetryAfterDelay(retryAfterHeader?: string): number {
    if (retryAfterHeader) {
      const parsed = parseInt(retryAfterHeader, 10)
      if (!isNaN(parsed)) {
        return parsed * 1000 // Convert seconds to milliseconds
      }
    }
    return 1000 // Default 1 second
  }

  /**
   * Create a standardized error object
   */
  private createSpotifyError(error: any): SpotifyApiError {
    const spotifyError: SpotifyApiError = new Error(
      error?.response?.data?.error?.message || 
      error?.message || 
      'Spotify API request failed'
    )
    spotifyError.status = error?.response?.status
    spotifyError.response = error?.response?.data
    return spotifyError
  }

  /**
   * Promise-based delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client
  }
}
