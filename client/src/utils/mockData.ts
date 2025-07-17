/**
 * @file mockData.ts
 * @description Mock data for Spotify albums and Last.fm responses for testing advanced shuffle
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-12
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with realistic mock data
 */

import { SpotifyAlbum, SpotifyArtist } from '../spotifyApi'
import { LastFmAlbumResult, LastFmArtistResult } from '../lastFmFinder'

/**
 * Mock Spotify artists
 */
export const mockSpotifyArtists: SpotifyArtist[] = [
  {
    external_urls: { spotify: 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb' },
    followers: { href: null, total: 5000000 },
    genres: ['alternative rock', 'britpop', 'permanent wave', 'rock'],
    href: 'https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb',
    id: '4Z8W4fKeB5YxbusRsdQVPb',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab6761610000e5eb50defaf9fc059a1efc541f4c',
        width: 640,
      },
    ],
    name: 'Radiohead',
    popularity: 85,
    type: 'artist',
    uri: 'spotify:artist:4Z8W4fKeB5YxbusRsdQVPb',
  },
  {
    external_urls: { spotify: 'https://open.spotify.com/artist/0L8ExT028jH3ddEcZwqJJ5' },
    followers: { href: null, total: 3000000 },
    genres: ['alternative metal', 'nu metal', 'post-grunge', 'rock'],
    href: 'https://api.spotify.com/v1/artists/0L8ExT028jH3ddEcZwqJJ5',
    id: '0L8ExT028jH3ddEcZwqJJ5',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab6761610000e5ebdc85c94a6f95b2b2e5c95ef4',
        width: 640,
      },
    ],
    name: 'Red Hot Chili Peppers',
    popularity: 82,
    type: 'artist',
    uri: 'spotify:artist:0L8ExT028jH3ddEcZwqJJ5',
  },
  {
    external_urls: { spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2' },
    followers: { href: null, total: 12000000 },
    genres: ['classic rock', 'hard rock', 'rock'],
    href: 'https://api.spotify.com/v1/artists/3WrFJ7ztbogyGnTHbHJFl2',
    id: '3WrFJ7ztbogyGnTHbHJFl2',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab6761610000e5eb32c9b8a3c0c8b1c8d1e5e6f7',
        width: 640,
      },
    ],
    name: 'The Beatles',
    popularity: 88,
    type: 'artist',
    uri: 'spotify:artist:3WrFJ7ztbogyGnTHbHJFl2',
  },
  {
    external_urls: { spotify: 'https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg' },
    followers: { href: null, total: 8000000 },
    genres: ['alternative rock', 'grunge', 'post-grunge', 'rock'],
    href: 'https://api.spotify.com/v1/artists/2YZyLoL8N0Wb9xBt1NhZWg',
    id: '2YZyLoL8N0Wb9xBt1NhZWg',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab6761610000e5eb91c4b15c6b7f4b2c8e4d3f5a',
        width: 640,
      },
    ],
    name: 'Kendrick Lamar',
    popularity: 91,
    type: 'artist',
    uri: 'spotify:artist:2YZyLoL8N0Wb9xBt1NhZWg',
  },
]

/**
 * Mock Spotify albums
 */
export const mockSpotifyAlbums: SpotifyAlbum[] = [
  {
    album_type: 'album',
    artists: [mockSpotifyArtists[0]], // Radiohead
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/6dVIqQ8qmQ7GUH5GkK7X7V' },
    href: 'https://api.spotify.com/v1/albums/6dVIqQ8qmQ7GUH5GkK7X7V',
    id: '6dVIqQ8qmQ7GUH5GkK7X7V',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273c8b444df094279e70d0ed856',
        width: 640,
      },
    ],
    name: 'OK Computer',
    release_date: '1997-06-16',
    release_date_precision: 'day',
    total_tracks: 12,
    type: 'album',
    uri: 'spotify:album:6dVIqQ8qmQ7GUH5GkK7X7V',
    popularity: 89,
    label: 'XL Recordings',
  },
  {
    album_type: 'album',
    artists: [mockSpotifyArtists[0]], // Radiohead
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/6400dnyeDyD2mIFHfkwHXN' },
    href: 'https://api.spotify.com/v1/albums/6400dnyeDyD2mIFHfkwHXN',
    id: '6400dnyeDyD2mIFHfkwHXN',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273d4f208a3b8e7d8e2e2d1c9a8',
        width: 640,
      },
    ],
    name: 'Kid A',
    release_date: '2000-10-02',
    release_date_precision: 'day',
    total_tracks: 10,
    type: 'album',
    uri: 'spotify:album:6400dnyeDyD2mIFHfkwHXN',
    popularity: 85,
    label: 'XL Recordings',
  },
  {
    album_type: 'album',
    artists: [mockSpotifyArtists[1]], // Red Hot Chili Peppers
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/7xl50xr9NDkd3i2kBbzsNZ' },
    href: 'https://api.spotify.com/v1/albums/7xl50xr9NDkd3i2kBbzsNZ',
    id: '7xl50xr9NDkd3i2kBbzsNZ',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273e8107e6d9f8e4c3d2b5f6a78',
        width: 640,
      },
    ],
    name: 'Californication',
    release_date: '1999-06-08',
    release_date_precision: 'day',
    total_tracks: 15,
    type: 'album',
    uri: 'spotify:album:7xl50xr9NDkd3i2kBbzsNZ',
    popularity: 82,
    label: 'Warner Bros. Records',
  },
  {
    album_type: 'album',
    artists: [mockSpotifyArtists[2]], // The Beatles
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/1klALx0u4AavZNEvC4LrTL' },
    href: 'https://api.spotify.com/v1/albums/1klALx0u4AavZNEvC4LrTL',
    id: '1klALx0u4AavZNEvC4LrTL',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273d1ec0e7c2f9b7c8e4a3f2d1c',
        width: 640,
      },
    ],
    name: 'Abbey Road',
    release_date: '1969-09-26',
    release_date_precision: 'day',
    total_tracks: 17,
    type: 'album',
    uri: 'spotify:album:1klALx0u4AavZNEvC4LrTL',
    popularity: 94,
    label: 'Apple Records',
  },
  {
    album_type: 'album',
    artists: [mockSpotifyArtists[3]], // Kendrick Lamar
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/4eLPsYPBmXABThSJ821sqY' },
    href: 'https://api.spotify.com/v1/albums/4eLPsYPBmXABThSJ821sqY',
    id: '4eLPsYPBmXABThSJ821sqY',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273ea7c4dcc1e9b8e2c3f5d4a78',
        width: 640,
      },
    ],
    name: 'good kid, m.A.A.d city',
    release_date: '2012-10-22',
    release_date_precision: 'day',
    total_tracks: 12,
    type: 'album',
    uri: 'spotify:album:4eLPsYPBmXABThSJ821sqY',
    popularity: 91,
    label: 'Top Dawg Entertainment',
  },
  {
    album_type: 'single',
    artists: [mockSpotifyArtists[0]], // Radiohead
    available_markets: ['US', 'CA', 'GB', 'DE'],
    external_urls: { spotify: 'https://open.spotify.com/album/5Z9K8svl3fUB8fQz5T6D2z' },
    href: 'https://api.spotify.com/v1/albums/5Z9K8svl3fUB8fQz5T6D2z',
    id: '5Z9K8svl3fUB8fQz5T6D2z',
    images: [
      {
        height: 640,
        url: 'https://i.scdn.co/image/ab67616d0000b273b8c7f4e2d9a8e5c3f2d1c4a5',
        width: 640,
      },
    ],
    name: 'Burn the Witch',
    release_date: '2016-05-03',
    release_date_precision: 'day',
    total_tracks: 1,
    type: 'album',
    uri: 'spotify:album:5Z9K8svl3fUB8fQz5T6D2z',
    popularity: 73,
    label: 'XL Recordings',
  },
]

/**
 * Mock Last.fm album results
 */
export const mockLastFmAlbumResults: Record<string, LastFmAlbumResult> = {
  '6dVIqQ8qmQ7GUH5GkK7X7V': {
    // OK Computer
    found: true,
    primaryGenre: 'alternative rock',
    secondaryGenres: ['experimental rock', 'art rock', 'progressive rock'],
    tags: [
      { name: 'alternative rock', count: 150, url: 'https://www.last.fm/tag/alternative+rock' },
      { name: 'experimental', count: 120, url: 'https://www.last.fm/tag/experimental' },
      { name: 'progressive rock', count: 100, url: 'https://www.last.fm/tag/progressive+rock' },
      { name: 'art rock', count: 90, url: 'https://www.last.fm/tag/art+rock' },
      { name: 'electronic', count: 80, url: 'https://www.last.fm/tag/electronic' },
      { name: '90s', count: 200, url: 'https://www.last.fm/tag/90s' },
      { name: 'british', count: 110, url: 'https://www.last.fm/tag/british' },
    ],
    confidence: 0.95,
    album: {
      name: 'OK Computer',
      artist: 'Radiohead',
      mbid: '3824b7a1-1111-4b3f-b9f7-8f5c0e8c9d2e',
      url: 'https://www.last.fm/music/Radiohead/OK+Computer',
    },
  },
  '6400dnyeDyD2mIFHfkwHXN': {
    // Kid A
    found: true,
    primaryGenre: 'electronic',
    secondaryGenres: ['experimental rock', 'ambient', 'art rock'],
    tags: [
      { name: 'electronic', count: 180, url: 'https://www.last.fm/tag/electronic' },
      { name: 'experimental', count: 160, url: 'https://www.last.fm/tag/experimental' },
      { name: 'ambient', count: 140, url: 'https://www.last.fm/tag/ambient' },
      { name: 'alternative rock', count: 130, url: 'https://www.last.fm/tag/alternative+rock' },
      { name: 'art rock', count: 120, url: 'https://www.last.fm/tag/art+rock' },
      { name: '2000s', count: 190, url: 'https://www.last.fm/tag/2000s' },
      { name: 'british', count: 100, url: 'https://www.last.fm/tag/british' },
    ],
    confidence: 0.92,
    album: {
      name: 'Kid A',
      artist: 'Radiohead',
      mbid: '4f3c3c1a-2222-4d5e-a8b9-9c6d1f0e2a3b',
      url: 'https://www.last.fm/music/Radiohead/Kid+A',
    },
  },
  '7xl50xr9NDkd3i2kBbzsNZ': {
    // Californication
    found: true,
    primaryGenre: 'alternative rock',
    secondaryGenres: ['funk rock', 'rap rock', 'rock'],
    tags: [
      { name: 'alternative rock', count: 200, url: 'https://www.last.fm/tag/alternative+rock' },
      { name: 'funk rock', count: 150, url: 'https://www.last.fm/tag/funk+rock' },
      { name: 'rock', count: 180, url: 'https://www.last.fm/tag/rock' },
      { name: 'rap rock', count: 120, url: 'https://www.last.fm/tag/rap+rock' },
      { name: '90s', count: 210, url: 'https://www.last.fm/tag/90s' },
      { name: 'american', count: 130, url: 'https://www.last.fm/tag/american' },
      { name: 'funk', count: 110, url: 'https://www.last.fm/tag/funk' },
    ],
    confidence: 0.88,
    album: {
      name: 'Californication',
      artist: 'Red Hot Chili Peppers',
      mbid: '5a5c5e2b-3333-4e6f-c9da-ad7e2g1f3c4d',
      url: 'https://www.last.fm/music/Red+Hot+Chili+Peppers/Californication',
    },
  },
  '1klALx0u4AavZNEvC4LrTL': {
    // Abbey Road
    found: true,
    primaryGenre: 'rock',
    secondaryGenres: ['classic rock', 'pop rock', 'psychedelic rock'],
    tags: [
      { name: 'classic rock', count: 250, url: 'https://www.last.fm/tag/classic+rock' },
      { name: 'rock', count: 300, url: 'https://www.last.fm/tag/rock' },
      { name: 'pop rock', count: 200, url: 'https://www.last.fm/tag/pop+rock' },
      { name: 'psychedelic rock', count: 180, url: 'https://www.last.fm/tag/psychedelic+rock' },
      { name: '60s', count: 280, url: 'https://www.last.fm/tag/60s' },
      { name: 'british', count: 220, url: 'https://www.last.fm/tag/british' },
      { name: 'legendary', count: 150, url: 'https://www.last.fm/tag/legendary' },
    ],
    confidence: 0.98,
    album: {
      name: 'Abbey Road',
      artist: 'The Beatles',
      mbid: '6b6d6f3c-4444-5f7g-daea-be8f3h2g4d5e',
      url: 'https://www.last.fm/music/The+Beatles/Abbey+Road',
    },
  },
  '4eLPsYPBmXABThSJ821sqY': {
    // good kid, m.A.A.d city
    found: true,
    primaryGenre: 'hip hop',
    secondaryGenres: ['conscious hip hop', 'west coast hip hop', 'rap'],
    tags: [
      { name: 'hip hop', count: 300, url: 'https://www.last.fm/tag/hip+hop' },
      { name: 'rap', count: 280, url: 'https://www.last.fm/tag/rap' },
      { name: 'conscious hip hop', count: 200, url: 'https://www.last.fm/tag/conscious+hip+hop' },
      { name: 'west coast hip hop', count: 180, url: 'https://www.last.fm/tag/west+coast+hip+hop' },
      { name: '2010s', count: 250, url: 'https://www.last.fm/tag/2010s' },
      { name: 'american', count: 170, url: 'https://www.last.fm/tag/american' },
      { name: 'storytelling', count: 140, url: 'https://www.last.fm/tag/storytelling' },
    ],
    confidence: 0.94,
    album: {
      name: 'good kid, m.A.A.d city',
      artist: 'Kendrick Lamar',
      mbid: '7c7e7g4d-5555-6g8h-ebbf-cf9g4i3h5e6f',
      url: 'https://www.last.fm/music/Kendrick+Lamar/good+kid,+m.A.A.d+city',
    },
  },
}

/**
 * Mock Last.fm artist results
 */
export const mockLastFmArtistResults: Record<string, LastFmArtistResult> = {
  '4Z8W4fKeB5YxbusRsdQVPb': {
    // Radiohead
    found: true,
    primaryGenre: 'alternative rock',
    secondaryGenres: ['experimental rock', 'art rock', 'electronic'],
    tags: [
      { name: 'alternative rock', count: 500, url: 'https://www.last.fm/tag/alternative+rock' },
      { name: 'experimental', count: 400, url: 'https://www.last.fm/tag/experimental' },
      { name: 'art rock', count: 350, url: 'https://www.last.fm/tag/art+rock' },
      { name: 'electronic', count: 300, url: 'https://www.last.fm/tag/electronic' },
      { name: 'progressive rock', count: 280, url: 'https://www.last.fm/tag/progressive+rock' },
      { name: 'british', count: 450, url: 'https://www.last.fm/tag/british' },
    ],
    confidence: 0.97,
    artist: {
      name: 'Radiohead',
      mbid: 'a74b1b7a-d8bb-4c8a-8f5c-0e8c9d2e3f4a',
      url: 'https://www.last.fm/music/Radiohead',
    },
    similarArtists: [
      {
        name: 'Thom Yorke',
        mbid: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
        url: 'https://www.last.fm/music/Thom+Yorke',
      },
      {
        name: 'Atoms for Peace',
        mbid: 'b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7',
        url: 'https://www.last.fm/music/Atoms+for+Peace',
      },
      {
        name: 'Portishead',
        mbid: 'c3d4e5f6-g7h8-9i0j-1k2l-m3n4o5p6q7r8',
        url: 'https://www.last.fm/music/Portishead',
      },
    ],
  },
}

/**
 * Mock related albums response
 */
export const mockRelatedAlbumsResponse = {
  albums: [
    {
      name: 'In Rainbows',
      artist: 'Radiohead',
      spotifyId: '1oW3v5Har9mvXnGk0x4fHm',
      lastFmUrl: 'https://www.last.fm/music/Radiohead/In+Rainbows',
      relevanceScore: 0.92,
      matchReason: 'same artist',
    },
    {
      name: 'The Bends',
      artist: 'Radiohead',
      spotifyId: '2aWdErVg3HmhE5W8qN3F2k',
      lastFmUrl: 'https://www.last.fm/music/Radiohead/The+Bends',
      relevanceScore: 0.88,
      matchReason: 'same artist',
    },
    {
      name: 'Mezzanine',
      artist: 'Massive Attack',
      spotifyId: '5EyIDNg6h0lf5U9J7Qn3Q8',
      lastFmUrl: 'https://www.last.fm/music/Massive+Attack/Mezzanine',
      relevanceScore: 0.75,
      matchReason: 'similar tags: electronic, experimental',
    },
    {
      name: 'Dummy',
      artist: 'Portishead',
      spotifyId: '6vV5UrXcfyQD1yftft9Y0g',
      lastFmUrl: 'https://www.last.fm/music/Portishead/Dummy',
      relevanceScore: 0.72,
      matchReason: 'similar artist + tags: experimental, electronic',
    },
  ],
  totalFound: 4,
  parameters: {
    tagWeight: 30,
    similarArtistWeight: 40,
    maxResults: 20,
  },
}

/**
 * Get mock data for testing
 */
export const getMockSpotifyAlbums = (): SpotifyAlbum[] => mockSpotifyAlbums

export const getMockLastFmAlbumResult = (albumId: string): LastFmAlbumResult | null =>
  mockLastFmAlbumResults[albumId] || null

export const getMockLastFmArtistResult = (artistId: string): LastFmArtistResult | null =>
  mockLastFmArtistResults[artistId] || null

export const getMockRelatedAlbums = () => mockRelatedAlbumsResponse
