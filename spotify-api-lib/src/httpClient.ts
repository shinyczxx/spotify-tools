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
}

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
   * Make an HTTP request to the Spotify API
   */
  async request<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    let attempt = 0
    const maxRetries = 5
    let lastError: any = null
    while (attempt < maxRetries) {
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
        lastError = error
        // Handle 429 with Retry-After
        if (error?.response?.status === 429) {
          let retryAfter = 1
          const header = error.response.headers?.['retry-after']
          if (header) {
            const parsed = parseInt(header, 10)
            if (!isNaN(parsed)) retryAfter = parsed
          }
          console.warn(`Spotify API rate limited. Retrying after ${retryAfter} seconds (attempt ${attempt + 1}/${maxRetries})`)
          await new Promise((res) => setTimeout(res, retryAfter * 1000))
          attempt++
          continue
        }
        // For other errors, do not retry
        console.error('Spotify API request failed:', error)
        throw error
      }
    }
    // If we exhausted retries, throw last error
    throw lastError || new Error('Spotify API request failed after retries')
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getClient(): AxiosInstance {
    return this.client
  }
}
