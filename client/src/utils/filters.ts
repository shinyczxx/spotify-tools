// Album filtering utilities
import type { Album } from 'types/album';

export function filterByReleaseDate(albums: Album[], releaseDate: string): Album[] {
  if (!releaseDate) return albums;
  return albums.filter(album => album.release_date >= releaseDate);
}

export function filterByTrackCount(albums: Album[], minTracks: string, maxTracks: string): Album[] {
  const min = minTracks ? parseInt(minTracks, 10) : 0;
  const max = maxTracks ? parseInt(maxTracks, 10) : Infinity;
  return albums.filter(album => {
    const count = typeof album.total_tracks === 'string' ? parseInt(album.total_tracks, 10) : album.total_tracks;
    return count >= min && count <= max;
  });
}

export function filterByArtists(albums: Album[], include: string, exclude: string): Album[] {
  let result = albums;
  if (include) {
    const includes = include.toLowerCase().split(',').map(s => s.trim());
    result = result.filter(album => includes.some(i => album.artists.toLowerCase().includes(i)));
  }
  if (exclude) {
    const excludes = exclude.toLowerCase().split(',').map(s => s.trim());
    result = result.filter(album => !excludes.some(e => album.artists.toLowerCase().includes(e)));
  }
  return result;
}

export function filterByAlbumType(albums: Album[], includeCompilations: boolean, includeSingles: boolean): Album[] {
  return albums.filter(album => {
    if (!includeCompilations && album.album_type === 'compilation') return false;
    if (!includeSingles && album.album_type === 'single') return false;
    return true;
  });
}
