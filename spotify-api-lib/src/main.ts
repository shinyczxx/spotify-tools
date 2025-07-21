/**
 * @file main.ts
 * @description Main Spotify API class with constructor pattern for organized API access
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @description
 * Constructor-based Spotify API wrapper that provides organized methods for
 * interacting with the Spotify Web API. Supports playlists, tracks, albums, artists, search, player, and user operations.
 *
 * @usage
 * ```javascript
 * const spotify = new SpotifyApi(accessToken);
 * const playlists = await spotify.playlists.getUserPlaylists();
 * const album = await spotify.albums.getById(albumId);
 * const tracks = await spotify.tracks.getSavedTracks();
 * ```
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with all endpoint categories
 */

import { SpotifyHttpClient } from './httpClient'
import { PlaylistEndpoints } from './endpoints/playlists'
import { TrackEndpoints } from './endpoints/tracks'
import { AlbumEndpoints } from './endpoints/albums'
import { ArtistEndpoints } from './endpoints/artists'
import { SearchEndpoints } from './endpoints/search'
import { PlayerEndpoints } from './endpoints/player'
import { UserEndpoints } from './endpoints/user'

// Endpoint classes mapping for optimized initialization
const ENDPOINT_CLASSES = {
  playlists: PlaylistEndpoints,
  tracks: TrackEndpoints,
  albums: AlbumEndpoints,
  artists: ArtistEndpoints,
  search: SearchEndpoints,
  player: PlayerEndpoints,
  user: UserEndpoints,
} as const

export class SpotifyApi {
  private httpClient: SpotifyHttpClient

  // Endpoint groups
  public playlists!: PlaylistEndpoints
  public tracks!: TrackEndpoints
  public albums!: AlbumEndpoints
  public artists!: ArtistEndpoints
  public search!: SearchEndpoints
  public player!: PlayerEndpoints
  public user!: UserEndpoints

  constructor(accessToken?: string) {
    // Validate access token format if provided
    if (accessToken && !this.isValidTokenFormat(accessToken)) {
      console.warn('SpotifyApi: Access token format appears invalid')
    }

    this.httpClient = new SpotifyHttpClient(accessToken)

    // Initialize endpoint groups using optimized pattern
    this.initializeEndpoints()
  }

  /**
   * Initialize all endpoint groups
   */
  private initializeEndpoints(): void {
    for (const [name, EndpointClass] of Object.entries(ENDPOINT_CLASSES)) {
      ;(this as any)[name] = new EndpointClass(this.httpClient)
    }
  }

  /**
   * Basic token format validation
   */
  private isValidTokenFormat(token: string): boolean {
    // Spotify access tokens are typically 100+ characters and alphanumeric with some special chars
    return typeof token === 'string' && token.length > 50 && /^[A-Za-z0-9_-]+$/.test(token)
  }

  /**
   * Set access token for API requests
   */
  public setAccessToken(token: string): void {
    this.httpClient.setAccessToken(token)
  }

  /**
   * Clear the access token
   */
  public clearAccessToken(): void {
    this.httpClient.clearAccessToken()
  }

  /**
   * Make a raw API request
   */
  public async request(
    endpoint: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      data?: any
      params?: Record<string, any>
    },
  ): Promise<any> {
    return this.httpClient.request(endpoint, options)
  }

  /**
   * Get the HTTP client instance for advanced usage
   */
  public getHttpClient(): SpotifyHttpClient {
    return this.httpClient
  }

  /**
   * Clean up resources and clear tokens
   */
  public destroy(): void {
    this.clearAccessToken()
    // Clear any cached data if endpoints have cleanup methods
    Object.values(ENDPOINT_CLASSES).forEach((_, key) => {
      const endpoint = (this as any)[Object.keys(ENDPOINT_CLASSES)[key]]
      if (endpoint && typeof endpoint.cleanup === 'function') {
        endpoint.cleanup()
      }
    })
  }
}
