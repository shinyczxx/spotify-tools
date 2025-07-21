# Spotify Web API TypeScript Library

A modern, TypeScript-first wrapper for the Spotify Web API with organized endpoint categories and full type safety.

## Features

- 🎯 **Full TypeScript Support** - Complete type definitions for all Spotify API responses
- 🏗️ **Organized Structure** - Endpoints grouped by category (playlists, tracks, albums, etc.)
- 🔧 **Modern ES6+** - Built with modern JavaScript features
- 📦 **Dual Package** - Supports both ESM and CommonJS
- 🚀 **Zero Dependencies** - Only uses axios as peer dependency
- 🎵 **Complete Coverage** - All major Spotify Web API endpoints

## Installation

```bash
npm install spotify-api-lib
# or
yarn add spotify-api-lib
```

**Peer Dependency:**
```bash
npm install axios
```

## Quick Start

```typescript
import SpotifyApi from 'spotify-api-lib';

// Initialize with access token
const spotify = new SpotifyApi('your_access_token');

// Use organized endpoint groups
const playlists = await spotify.playlists.getUserPlaylists();
const album = await spotify.albums.getById('album_id');
const tracks = await spotify.tracks.getSavedTracks();
```

## API Reference

### Constructor

```typescript
new SpotifyApi(accessToken?: string)
```

### Endpoint Categories

#### Playlists
```typescript
spotify.playlists.getUserPlaylists()
spotify.playlists.getById(playlistId)
spotify.playlists.getTracks(playlistId, options?)
spotify.playlists.create(userId, details)
spotify.playlists.addTracks(playlistId, trackUris)
```

#### Albums
```typescript
spotify.albums.getById(albumId)
spotify.albums.getTracks(albumId, options?)
spotify.albums.getSavedAlbums(options?)
spotify.albums.saveAlbums(albumIds)
```

#### Tracks
```typescript
spotify.tracks.getById(trackId)
spotify.tracks.getSavedTracks(options?)
spotify.tracks.saveTracks(trackIds)
spotify.tracks.getAudioFeatures(trackIds)
```

#### Artists
```typescript
spotify.artists.getById(artistId)
spotify.artists.getTopTracks(artistId, market?)
spotify.artists.getAlbums(artistId, options?)
spotify.artists.getRelatedArtists(artistId)
```

#### Search
```typescript
spotify.search.search(query, types, options?)
spotify.search.searchTracks(query, options?)
spotify.search.searchAlbums(query, options?)
spotify.search.searchArtists(query, options?)
```

#### Player
```typescript
spotify.player.getCurrentTrack()
spotify.player.getPlaybackState()
spotify.player.play(options?)
spotify.player.pause()
spotify.player.next()
spotify.player.previous()
```

#### User
```typescript
spotify.user.getProfile()
spotify.user.getTopTracks(options?)
spotify.user.getTopArtists(options?)
```

## Authentication

This library handles API requests but doesn't manage OAuth flow. You need to obtain access tokens through Spotify's OAuth 2.0 flow.

### Example with PKCE (recommended for client-side apps):

```typescript
// After OAuth flow, initialize with token
const spotify = new SpotifyApi(accessToken);

// Update token when refreshed
spotify.setAccessToken(newAccessToken);
```

## TypeScript Support

All Spotify API responses are fully typed:

```typescript
import SpotifyApi, { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from 'spotify-api-lib';

const spotify = new SpotifyApi(token);

// Fully typed responses
const track: SpotifyTrack = await spotify.tracks.getById('track_id');
const album: SpotifyAlbum = await spotify.albums.getById('album_id');
const playlists: SpotifyPlaylist[] = await spotify.playlists.getUserPlaylists();
```

## Error Handling

The library throws errors for failed API requests:

```typescript
try {
  const track = await spotify.tracks.getById('invalid_id');
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Track not found');
  } else if (error.response?.status === 401) {
    console.log('Invalid or expired token');
  }
}
```

## Advanced Usage

### Direct HTTP Client Access

```typescript
import { SpotifyHttpClient } from 'spotify-api-lib';

const client = new SpotifyHttpClient(accessToken);
const response = await client.get('/me/playlists');
```

### Custom Requests

```typescript
const spotify = new SpotifyApi(token);

// Access underlying HTTP client for custom requests
const customData = await spotify.httpClient.get('/custom/endpoint');
```

## Rate Limiting

The library doesn't implement rate limiting. Spotify's API has rate limits, so implement appropriate delays in your application:

```typescript
// Example: Add delay between requests
async function fetchMultipleAlbums(albumIds: string[]) {
  const albums = [];
  for (const id of albumIds) {
    albums.push(await spotify.albums.getById(id));
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
  }
  return albums;
}
```

## Examples

### Get User's Top Artists and Tracks

```typescript
const spotify = new SpotifyApi(accessToken);

const [topArtists, topTracks] = await Promise.all([
  spotify.user.getTopArtists({ limit: 10, time_range: 'medium_term' }),
  spotify.user.getTopTracks({ limit: 10, time_range: 'medium_term' })
]);

console.log('Top Artists:', topArtists.items.map(a => a.name));
console.log('Top Tracks:', topTracks.items.map(t => t.name));
```

### Create and Populate a Playlist

```typescript
const user = await spotify.user.getProfile();
const playlist = await spotify.playlists.create(user.id, {
  name: 'My New Playlist',
  description: 'Created with spotify-api-lib',
  public: false
});

const trackUris = ['spotify:track:4iV5W9uYEdYUVa79Axb7Rh', 'spotify:track:1301WleyT98MSxVHPZCA6M'];
await spotify.playlists.addTracks(playlist.id, trackUris);
```

### Search and Save Albums

```typescript
const searchResults = await spotify.search.searchAlbums('Random Access Memories', { limit: 5 });
const album = searchResults.albums.items[0];

if (album) {
  await spotify.albums.saveAlbums([album.id]);
  console.log(`Saved album: ${album.name} by ${album.artists[0].name}`);
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Related

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify Web API Console](https://developer.spotify.com/console/)