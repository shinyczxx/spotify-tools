// Album normalization and related utilities
import type { Album } from 'types/album';

export function normalizeAlbum(album: any): Album {
  return {
    id: album.id,
    name: album.name,
    artists: Array.isArray(album.artists)
      ? album.artists.map((a: any) => a.name).join(', ')
      : album.artists,
    artistIds: Array.isArray(album.artists)
      ? album.artists.map((a: any) => a.id)
      : album.artistIds || [],
    total_tracks: album.total_tracks ?? album.trackCount ?? 0,
    release_date: album.release_date,
    images: album.images || [],
    isSelected: album.isSelected ?? false,
    album_type: album.album_type || '',
  };
}
