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

export class SpotifyApi {
  private httpClient: SpotifyHttpClient

  // Endpoint groups
  public playlists: PlaylistEndpoints
  public tracks: TrackEndpoints
  public albums: AlbumEndpoints
  public artists: ArtistEndpoints
  public search: SearchEndpoints
  public player: PlayerEndpoints
  public user: UserEndpoints

  constructor(accessToken?: string) {
    this.httpClient = new SpotifyHttpClient(accessToken)

    // Initialize endpoint groups
    this.playlists = new PlaylistEndpoints(this.httpClient)
    this.tracks = new TrackEndpoints(this.httpClient)
    this.albums = new AlbumEndpoints(this.httpClient)
    this.artists = new ArtistEndpoints(this.httpClient)
    this.search = new SearchEndpoints(this.httpClient)
    this.player = new PlayerEndpoints(this.httpClient)
    this.user = new UserEndpoints(this.httpClient)
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
}
