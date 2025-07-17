/**
 * @file spotifyAuth.ts
 * @description Client-side Spotify OAuth 2.0 PKCE implementation
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-10
 */

import { getEnvVar } from '../config/env'

// Spotify OAuth 2.0 PKCE Configuration

const SPOTIFY_CLIENT_ID = getEnvVar('VITE_SPOTIFY_CLIENT_ID', 'test_client_id')
const SPOTIFY_REDIRECT_URI =
  getEnvVar('VITE_SPOTIFY_REDIRECT_URI') || 'http://127.0.0.1:5175/callback'
const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'user-library-read',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-top-read',
].join(' ')

// PKCE utility functions
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// OAuth flow functions
export async function initiateSpotifyAuth(): Promise<void> {
  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(16)

  // Store code verifier and state in localStorage
  localStorage.setItem('spotify_code_verifier', codeVerifier)
  localStorage.setItem('spotify_state', state)

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state: state,
    scope: SPOTIFY_SCOPES,
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function handleSpotifyCallback(): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const state = urlParams.get('state')
  const error = urlParams.get('error')

  if (error) {
    console.error('Spotify auth error:', error)
    return null
  }

  if (!code || !state) {
    console.error('Missing code or state parameter')
    return null
  }

  const storedState = localStorage.getItem('spotify_state')
  if (state !== storedState) {
    console.error('State mismatch')
    return null
  }

  const codeVerifier = localStorage.getItem('spotify_code_verifier')
  if (!codeVerifier) {
    console.error('Missing code verifier')
    return null
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`)
    }

    const data = await response.json()

    // Clean up stored values
    localStorage.removeItem('spotify_code_verifier')
    localStorage.removeItem('spotify_state')

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    return null
  }
}

export async function refreshSpotifyToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: SPOTIFY_CLIENT_ID,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle specific error cases
      if (response.status === 400 && errorData.error === 'invalid_grant') {
        console.error('Refresh token revoked or expired:', errorData.error_description)
        throw new Error('REFRESH_TOKEN_REVOKED')
      }

      throw new Error(
        `Token refresh failed: ${response.status} - ${
          errorData.error_description || 'Unknown error'
        }`,
      )
    }

    const data = await response.json()
    return data.access_token
  } catch (error: any) {
    console.error('Error refreshing token:', error)

    // Re-throw specific errors to be handled by the calling code
    if (error.message === 'REFRESH_TOKEN_REVOKED') {
      throw error
    }

    return null
  }
}
