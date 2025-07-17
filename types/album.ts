/**
 * @file album.ts
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 *
 * @description Shared Album and playlist-related types for both client and server
 */

// Shared Album and playlist-related types for both client and server
export interface Album {
  id: string;
  name: string;
  artists: string;
  artistIds: string[];
  total_tracks: number | string;
  release_date: string;
  images: { url: string }[];
  isSelected?: boolean;
  album_type: string; // Added to support filtering by album type
}

export interface PlaylistAlbum {
  name: string;
  artist: string;
  trackCount: number;
}

export interface CreatedPlaylist {
  name: string;
  trackCount: number;
  includedAlbums: PlaylistAlbum[];
  url?: string;
}
