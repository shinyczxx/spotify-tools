/**
 * @file lastfm.ts
 * @description Last.fm API service for fetching music data
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import axios from 'axios'

// Last.fm API types
export interface LastFmTag {
  name: string
  count: number
  url: string
}

export interface LastFmImage {
  '#text': string
  size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega' | ''
}

export interface LastFmArtist {
  name: string
  mbid?: string
  url: string
  image?: LastFmImage[]
}

export interface LastFmAlbum {
  name: string
  artist: string | LastFmArtist
  mbid?: string
  url: string
  image?: LastFmImage[]
  playcount?: string
  tags?: {
    tag: LastFmTag[]
  }
}

export interface LastFmTagTopAlbumsResponse {
  albums: {
    album: LastFmAlbum[]
    '@attr': {
      tag: string
      page: string
      perPage: string
      totalPages: string
      total: string
    }
  }
}

export interface LastFmTopTagsResponse {
  toptags: {
    tag: LastFmTag[]
    '@attr': {
      offset: string
      num_res: string
      total: string
    }
  }
}

export interface LastFmSearchResult {
  id: string
  name: string
  artist: string
  image?: string
  tags?: string[]
  url?: string
  playcount?: number
}

/**
 * Last.fm API client
 */
export class LastFmService {
  private apiKey: string
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Get top albums for a specific tag
   */
  async getTopAlbumsByTag(tag: string, limit: number = 50): Promise<LastFmSearchResult[]> {
    try {
      const response = await axios.get<LastFmTagTopAlbumsResponse>(this.baseUrl, {
        params: {
          method: 'tag.getTopAlbums',
          tag: tag,
          api_key: this.apiKey,
          format: 'json',
          limit: limit,
        },
      })

      if (!response.data.albums?.album) {
        return []
      }

      return response.data.albums.album.map((album, index) => ({
        id: `${tag}-${index}-${album.name}-${typeof album.artist === 'string' ? album.artist : album.artist.name}`,
        name: album.name,
        artist: typeof album.artist === 'string' ? album.artist : album.artist.name,
        image: this.getLargestImage(album.image),
        url: album.url,
        playcount: album.playcount ? parseInt(album.playcount) : undefined,
        tags: album.tags?.tag.map(t => t.name) || [tag],
      }))
    } catch (error) {
      console.error(`Error fetching albums for tag "${tag}":`, error)
      return []
    }
  }

  /**
   * Get multiple albums by searching multiple tags
   */
  async searchAlbumsByTags(tags: string[], limit: number = 20): Promise<LastFmSearchResult[]> {
    const allAlbums = new Map<string, LastFmSearchResult>()

    // Fetch albums for each tag
    const albumPromises = tags.map(tag => this.getTopAlbumsByTag(tag, Math.ceil(limit / tags.length) + 10))
    const tagResults = await Promise.all(albumPromises)

    // Combine results, avoiding duplicates
    tagResults.forEach((albums, tagIndex) => {
      albums.forEach(album => {
        const key = `${album.artist.toLowerCase()}-${album.name.toLowerCase()}`
        if (!allAlbums.has(key)) {
          // Add the tag that found this album to its tags array
          const existingTags = album.tags || []
          const newTags = [...new Set([...existingTags, tags[tagIndex]])]
          allAlbums.set(key, { ...album, tags: newTags })
        } else {
          // If album already exists, merge tags
          const existing = allAlbums.get(key)!
          const mergedTags = [...new Set([...existing.tags!, ...album.tags!, tags[tagIndex]])]
          allAlbums.set(key, { ...existing, tags: mergedTags })
        }
      })
    })

    // Convert to array, shuffle, and limit results
    const resultsArray = Array.from(allAlbums.values())
    return this.shuffleArray(resultsArray).slice(0, limit)
  }

  /**
   * Get popular tags
   */
  async getTopTags(limit: number = 100): Promise<string[]> {
    try {
      const response = await axios.get<LastFmTopTagsResponse>(this.baseUrl, {
        params: {
          method: 'chart.getTopTags',
          api_key: this.apiKey,
          format: 'json',
          limit: limit,
        },
      })

      if (!response.data.toptags?.tag) {
        return this.getDefaultTags()
      }

      return response.data.toptags.tag.map(tag => tag.name)
    } catch (error) {
      console.error('Error fetching top tags:', error)
      return this.getDefaultTags()
    }
  }

  /**
   * Validate if a tag exists and is popular
   */
  async validateTag(tag: string): Promise<boolean> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          method: 'tag.getInfo',
          tag: tag,
          api_key: this.apiKey,
          format: 'json',
        },
      })

      return response.data.tag !== undefined
    } catch (error) {
      console.error(`Error validating tag "${tag}":`, error)
      return false
    }
  }

  /**
   * Get album details including tags
   */
  async getAlbumInfo(artist: string, album: string): Promise<LastFmAlbum | null> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          method: 'album.getInfo',
          artist: artist,
          album: album,
          api_key: this.apiKey,
          format: 'json',
        },
      })

      return response.data.album || null
    } catch (error) {
      console.error(`Error fetching album info for "${album}" by "${artist}":`, error)
      return null
    }
  }

  /**
   * Helper to get the largest available image
   */
  private getLargestImage(images?: LastFmImage[]): string | undefined {
    if (!images || images.length === 0) return undefined

    // Priority order for image sizes
    const sizeOrder = ['extralarge', 'large', 'medium', 'small', '']
    
    for (const size of sizeOrder) {
      const image = images.find(img => img.size === size)
      if (image && image['#text']) {
        return image['#text']
      }
    }

    return undefined
  }

  /**
   * Shuffle array utility
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Default tags to fall back to if API fails
   */
  private getDefaultTags(): string[] {
    return [
      'rock', 'pop', 'alternative', 'indie', 'electronic', 'jazz', 'classical',
      'hip hop', 'metal', 'punk', 'blues', 'country', 'folk', 'reggae',
      'ambient', 'experimental', 'post rock', 'progressive rock', 'new wave',
      'synthpop', 'house', 'techno', 'drum and bass', 'dubstep', 'funk',
      'soul', 'r&b', 'gospel', 'world', 'latin', 'african', 'asian',
      'grunge', 'britpop', 'emo', 'hardcore', 'industrial', 'noise',
      'minimal', 'dub', 'ska', 'dancehall', 'trip hop', 'downtempo',
      'chillout', 'lounge', 'soundtrack', 'instrumental', 'acoustic',
      'shoegaze', 'dream pop', 'gothic', 'darkwave', 'synthwave'
    ]
  }
}