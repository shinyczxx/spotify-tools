/**
 * @file playlistNameGenerator.ts
 * @description Fun and creative playlist name generation utility
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with fun name generation
 */

/**
 * Arrays of fun words and phrases for playlist naming
 */
const adjectives = [
  'cosmic',
  'electric',
  'mystic',
  'neon',
  'stellar',
  'lunar',
  'sonic',
  'digital',
  'ethereal',
  'radiant',
  'vivid',
  'dynamic',
  'magnetic',
  'prismatic',
  'kinetic',
  'atmospheric',
  'hypnotic',
  'melodic',
  'rhythmic',
  'euphoric',
  'nostalgic',
  'dreamy',
  'groovy',
  'funky',
  'chill',
  'epic',
  'legendary',
  'ultimate',
  'transcendent',
  'infinite',
  'boundless',
  'crystalline',
  'iridescent',
]

const nouns = [
  'journey',
  'voyage',
  'expedition',
  'adventure',
  'odyssey',
  'quest',
  'exploration',
  'discovery',
  'wavelength',
  'frequency',
  'spectrum',
  'dimension',
  'galaxy',
  'constellation',
  'nebula',
  'eclipse',
  'aurora',
  'cascade',
  'symphony',
  'harmony',
  'melody',
  'rhythm',
  'beat',
  'pulse',
  'flow',
  'stream',
  'current',
  'tide',
  'wave',
  'storm',
  'tempest',
  'vortex',
  'matrix',
]

const musicTerms = [
  'mixtape',
  'playlist',
  'compilation',
  'collection',
  'anthology',
  'archive',
  'vault',
  'library',
  'catalog',
  'chronicle',
  'soundtrack',
  'sessions',
  'recordings',
  'tracks',
  'tunes',
  'jams',
  'beats',
  'vibes',
  'sounds',
  'notes',
  'chords',
  'harmonies',
  'melodies',
  'compositions',
  'arrangements',
]

const timeReferences = [
  'midnight',
  'dawn',
  'twilight',
  'dusk',
  'sunrise',
  'sunset',
  'moonlight',
  'starlight',
  'daybreak',
  'nightfall',
  'afterglow',
  'golden hour',
  'witching hour',
  'blue hour',
  'magic hour',
]

const seasons = ['spring', 'summer', 'autumn', 'winter', 'solstice', 'equinox']

const emotions = [
  'euphoric',
  'melancholic',
  'nostalgic',
  'uplifting',
  'contemplative',
  'energetic',
  'peaceful',
  'intense',
  'serene',
  'passionate',
  'dreamy',
  'reflective',
  'exhilarating',
  'soothing',
  'vibrant',
]

/**
 * Generate a fun, creative playlist name
 */
export function generateFunPlaylistName(): string {
  const patterns = [
    // Adjective + Noun + Music Term
    () => `${getRandomItem(adjectives)} ${getRandomItem(nouns)} ${getRandomItem(musicTerms)}`,

    // Emotion + Time + Music Term
    () =>
      `${getRandomItem(emotions)} ${getRandomItem(timeReferences)} ${getRandomItem(musicTerms)}`,

    // Season + Adjective + Collection
    () => `${getRandomItem(seasons)} ${getRandomItem(adjectives)} collection`,

    // Time-based names
    () => `${getRandomItem(timeReferences)} ${getRandomItem(musicTerms)}`,

    // Space/cosmic themed
    () =>
      `${getRandomItem(['cosmic', 'stellar', 'lunar', 'galactic', 'celestial'])} ${getRandomItem(
        musicTerms,
      )}`,

    // Musical journey names
    () =>
      `${getRandomItem(adjectives)} ${getRandomItem([
        'journey',
        'voyage',
        'adventure',
        'odyssey',
      ])}`,

    // Number-based patterns
    () =>
      `${Math.floor(Math.random() * 100) + 1} ${getRandomItem(adjectives)} ${getRandomItem([
        'tracks',
        'songs',
        'tunes',
      ])}`,

    // Weather/nature themed
    () =>
      `${getRandomItem(['rainy', 'sunny', 'cloudy', 'stormy', 'misty'])} ${getRandomItem([
        'day',
        'night',
        'afternoon',
      ])} ${getRandomItem(musicTerms)}`,

    // Color themed
    () =>
      `${getRandomItem([
        'crimson',
        'azure',
        'golden',
        'silver',
        'violet',
        'emerald',
        'amber',
      ])} ${getRandomItem(musicTerms)}`,

    // Abstract concepts
    () =>
      `${getRandomItem(['infinite', 'eternal', 'timeless', 'boundless'])} ${getRandomItem(
        musicTerms,
      )}`,
  ]

  // Choose a random pattern and generate the name
  const pattern = getRandomItem(patterns)
  let name = pattern()

  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return name
}

/**
 * Generate a playlist name based on the shuffle algorithm used
 */
export function generateAlgorithmBasedName(algorithm: string): string {
  const algorithmNames: Record<string, string[]> = {
    'random': [
      'Random Mix',
      'Shuffled Chaos',
      'Unexpected Journey',
      'Random Discoveries',
      'Serendipity Playlist',
      'Chaos Theory Mix',
      'Dice Roll Sessions',
    ],
    'weighted-newer': [
      'Fresh Finds',
      'Modern Mix',
      'New Era Sounds',
      'Contemporary Collection',
      'Latest & Greatest',
      'Fresh Frequency',
      'Modern Melodies',
    ],
    'weighted-older': [
      'Vintage Vibes',
      'Classic Collection',
      'Retro Rewind',
      'Golden Oldies',
      'Nostalgic Journey',
      'Timeless Tracks',
      'Vintage Vault',
    ],
    'chronological': [
      'Timeline Mix',
      'Musical History',
      'Era Explorer',
      'Chronological Journey',
      "Time Traveler's Playlist",
      'Decade Dance',
      'Musical Evolution',
    ],
    'energy-based': [
      'High Energy Zone',
      'Adrenaline Rush',
      'Power Play',
      'Energy Surge',
      'Intensity Rising',
      'Peak Performance',
      'Maximum Drive',
    ],
  }

  const names = algorithmNames[algorithm] || algorithmNames['random']
  return getRandomItem(names)
}

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Generate a name with date suffix
 */
export function generateNameWithDate(baseName?: string): string {
  const name = baseName || generateFunPlaylistName()
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${name} - ${date}`
}

/**
 * Generate multiple name options
 */
export function generateNameOptions(count: number = 5): string[] {
  const names: string[] = []
  const usedNames = new Set<string>()

  while (names.length < count) {
    const name = generateFunPlaylistName()
    if (!usedNames.has(name)) {
      names.push(name)
      usedNames.add(name)
    }
  }

  return names
}
