/**
 * @file baseEndpoint.ts
 * @description Base class for API endpoint groups with convenience methods
 * @author Caleb Price
 * @version 1.1.0
 * @date 2025-07-21
 */

import { SpotifyHttpClient, RequestOptions } from './httpClient'

export abstract class BaseEndpoint {
  protected client: SpotifyHttpClient

  constructor(client: SpotifyHttpClient) {
    this.client = client
  }

  // Generic request method
  protected async makeRequest<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.client.request<T>(endpoint, options)
  }

  // Convenience methods for common HTTP verbs
  protected async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params })
  }

  protected async post<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'POST', data, params })
  }

  protected async put<T = any>(endpoint: string, data?: any, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', data, params })
  }

  protected async delete<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', params })
  }

  // Standard error handling
  protected handleError(error: any, operation: string): never {
    const message = error?.response?.data?.error?.message || error?.message || 'Unknown error'
    throw new Error(`${operation} failed: ${message}`)
  }
}
