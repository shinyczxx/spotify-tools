/**
 * @file mockAlbums.ts
 * @description Mock album data for Last.fm testing mode
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

export interface MockAlbum {
  name: string
  artist: string
  tags: string[]
}

/**
 * Curated collection of mock albums for testing Last.fm functionality
 * Includes diverse genres and well-known albums for realistic testing
 */
export const mockAlbumsData: MockAlbum[] = [
  { name: 'OK Computer', artist: 'Radiohead', tags: ['alternative', 'rock', 'experimental'] },
  { name: 'In the Aeroplane Over the Sea', artist: 'Neutral Milk Hotel', tags: ['indie', 'folk', 'alternative'] },
  { name: 'Selected Ambient Works', artist: 'Aphex Twin', tags: ['electronic', 'ambient', 'experimental'] },
  { name: 'Pet Sounds', artist: 'The Beach Boys', tags: ['pop', 'rock', 'psychedelic'] },
  { name: 'Kind of Blue', artist: 'Miles Davis', tags: ['jazz', 'cool jazz', 'instrumental'] },
  { name: 'The Dark Side of the Moon', artist: 'Pink Floyd', tags: ['rock', 'progressive rock', 'psychedelic'] },
  { name: 'Discovery', artist: 'Daft Punk', tags: ['electronic', 'house', 'pop'] },
  { name: 'Nevermind', artist: 'Nirvana', tags: ['grunge', 'rock', 'alternative'] },
  { name: 'The Velvet Underground & Nico', artist: 'The Velvet Underground', tags: ['rock', 'experimental', 'art rock'] },
  { name: 'Funeral', artist: 'Arcade Fire', tags: ['indie', 'alternative', 'rock'] },
  { name: 'Blackwater Park', artist: 'Opeth', tags: ['metal', 'progressive metal', 'death metal'] },
  { name: 'Substance', artist: 'New Order', tags: ['new wave', 'electronic', 'post-punk'] },
  { name: 'Random Access Memories', artist: 'Daft Punk', tags: ['electronic', 'disco', 'funk'] },
  { name: 'Remain in Light', artist: 'Talking Heads', tags: ['new wave', 'art rock', 'experimental'] },
  { name: 'Illinois', artist: 'Sufjan Stevens', tags: ['indie', 'folk', 'baroque pop'] },
  { name: 'Blonde', artist: 'Frank Ocean', tags: ['r&b', 'hip hop', 'alternative'] },
  { name: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', tags: ['hip hop', 'jazz', 'funk'] },
  { name: 'In Rainbows', artist: 'Radiohead', tags: ['alternative', 'rock', 'art rock'] },
  { name: 'The Money Store', artist: 'Death Grips', tags: ['experimental', 'hip hop', 'electronic'] },
  { name: 'Ágætis byrjun', artist: 'Sigur Rós', tags: ['post-rock', 'ambient', 'experimental'] }
]