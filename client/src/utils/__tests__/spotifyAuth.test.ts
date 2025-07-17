/**
 * @file spotifyAuth.test.ts
 * @description Unit tests for Spotify authentication utilities
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-10
 */

import { initiateSpotifyAuth, handleSpotifyCallback, refreshSpotifyToken } from '../spotifyAuth'
import { setupImportMetaMock } from './testUtils'

// Mock crypto for PKCE
const mockCrypto = {
  getRandomValues: jest.fn(() => new Uint8Array(128)),
  subtle: {
    digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
  },
}

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true,
})

// Mock window.location
const mockLocation = {
  href: '',
  origin: 'http://localhost:3000',
  search: '',
  hash: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('Spotify Authentication Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupImportMetaMock()
  })

  describe('initiateSpotifyAuth', () => {
    it('should redirect to Spotify authorization URL', async () => {
      await initiateSpotifyAuth()

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'spotify_code_verifier',
        expect.any(String),
      )
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('spotify_state', expect.any(String))
      expect(mockLocation.href).toContain('https://accounts.spotify.com/authorize')
      expect(mockLocation.href).toContain('client_id=')
      expect(mockLocation.href).toContain('response_type=code')
      expect(mockLocation.href).toContain('redirect_uri=')
      expect(mockLocation.href).toContain('code_challenge=')
      expect(mockLocation.href).toContain('code_challenge_method=S256')
    })

    it('should include correct scopes', async () => {
      await initiateSpotifyAuth()

      expect(mockLocation.href).toContain('scope=')
      expect(mockLocation.href).toContain('playlist-read-private')
      expect(mockLocation.href).toContain('playlist-modify-public')
      expect(mockLocation.href).toContain('playlist-modify-private')
      expect(mockLocation.href).toContain('user-library-read')
    })
  })

  describe('handleSpotifyCallback', () => {
    const mockFetch = jest.fn()

    beforeEach(() => {
      global.fetch = mockFetch
    })

    it('should handle successful authorization code exchange', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            expires_in: 3600,
          }),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_code_verifier') return 'test-verifier'
        if (key === 'spotify_state') return 'test-state'
        return null
      })

      mockLocation.search = '?code=test-code&state=test-state'

      const result = await handleSpotifyCallback()

      expect(result).toEqual({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      })
      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        }),
      )
    })

    it('should return null for state mismatch', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'spotify_state') return 'different-state'
        if (key === 'spotify_code_verifier') return 'test-verifier'
        return null
      })

      mockLocation.search = '?code=test-code&state=test-state'

      const result = await handleSpotifyCallback()
      expect(result).toBeNull()
    })

    it('should return null for authorization error', async () => {
      mockLocation.search = '?error=access_denied'

      const result = await handleSpotifyCallback()
      expect(result).toBeNull()
    })

    it('should return null for missing code', async () => {
      mockLocation.search = '?state=test-state'

      const result = await handleSpotifyCallback()
      expect(result).toBeNull()
    })
  })

  describe('refreshSpotifyToken', () => {
    const mockFetch = jest.fn()

    beforeEach(() => {
      global.fetch = mockFetch
    })

    it('should refresh token successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: 'new-access-token',
          }),
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await refreshSpotifyToken('refresh-token')

      expect(result).toBe('new-access-token')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: expect.any(URLSearchParams),
        }),
      )
    })

    it('should return null on refresh failure', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await refreshSpotifyToken('invalid-token')
      expect(result).toBeNull()
    })
  })
})
