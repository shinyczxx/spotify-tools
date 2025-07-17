// Stub for Last.fm API library
export interface LastFmTag {
  name: string
  count: number
}

export interface LastFmArtist {
  name: string
  mbid?: string
  url: string
}

export interface LastFmAlbum {
  name: string
  artist: string
  mbid?: string
  url: string
}

export interface LastFmTrack {
  name: string
  artist: string
  album?: string
  mbid?: string
  url: string
}

export interface LastFmApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export default class LastFm {
  constructor(apiKey: string) {
    // Stub implementation
  }

  async getArtistInfo(artist: string) {
    // Stub implementation
    return { data: null, success: false, error: 'Not implemented' }
  }

  async getAlbumInfo(artist: string, album: string) {
    // Stub implementation
    return { data: null, success: false, error: 'Not implemented' }
  }
}