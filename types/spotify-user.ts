/**
 * @file spotify-user.ts
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 *
 * @description Shared Spotify user and auth types for both client and server
 */

// Shared Spotify user and auth types for both client and server
export interface SpotifyUser {
  display_name: string;
  email: string;
  id: string;
  images: { url: string }[];
  product: string;
  country?: string;
  followers?: { total: number };
}

export interface SpotifyAuthResponse {
  authURL: string;
}
