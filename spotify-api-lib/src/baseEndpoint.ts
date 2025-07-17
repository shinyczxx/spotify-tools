/**
 * @file baseEndpoint.ts
 * @description Base class for API endpoint groups
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 */

import { SpotifyHttpClient, RequestOptions } from './httpClient'

export abstract class BaseEndpoint {
  protected client: SpotifyHttpClient

  constructor(client: SpotifyHttpClient) {
    this.client = client
  }

  protected async makeRequest<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.client.request<T>(endpoint, options)
  }
}
