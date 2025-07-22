/**
 * @file spotify.ts
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 *
 * @description Shared Spotify API types for both client and server
 */

// Shared Spotify API types for both client and server
export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: any[];
  release_date: string;
  total_tracks: number;
  album_type: string;
}

export interface SpotifyTrack {
  name: string;
  album: SpotifyAlbum;
}

export interface SpotifyTrackItem {
  track: SpotifyTrack;
}

export interface SpotifyTracksResponse {
  items: SpotifyTrackItem[];
  next: string | null;
}

// Playlist and Album item types for selectors
export interface PlaylistItem {
  id: string
  name: string
  description?: string
  images: Array<{ url: string; height?: number; width?: number }>
  owner: {
    display_name: string
    id: string
  }
  tracks: {
    total: number
  }
}

export interface AlbumItem {
  id: string
  name: string
  images: Array<{ url: string; height?: number; width?: number }>
  artists: Array<{ name: string; id: string }>
  release_date: string
  total_tracks: number
}
