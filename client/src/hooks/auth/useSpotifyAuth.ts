/**
 * @file useSpotifyAuth.ts
 * @description React authentication hook for Spotify integration.
 * Manages user, token, and session state, and handles secure cookie
 * flow for login/logout and token refresh.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-07
 */

import { useState, useEffect, useCallback } from 'react'
import api, { setAuthToken, setTokenUpdateCallback } from '@utils/api'
import { handleSpotifyCallback, refreshSpotifyToken } from '@utils/spotifyAuth'
import type { SpotifyUser } from 'types/spotify-user'

interface UseSpotifyAuthResult {
  user: SpotifyUser | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
  setError: (err: string | null) => void
  setAccessToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void
  setUser: (user: SpotifyUser | null) => void
  handleLogout: () => void
  fetchUserProfile: (token: string) => Promise<void>
  handleRefreshToken: () => Promise<void>
}

export function useSpotifyAuth(): UseSpotifyAuthResult {
  const [user, setUser] = useState<SpotifyUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Set up token update callback for automatic refresh
  useEffect(() => {
    setTokenUpdateCallback((newAccessToken, newRefreshToken) => {
      console.log('[Auth] Token updated automatically', { newAccessToken, newRefreshToken })
      setAccessToken(newAccessToken)
      setRefreshToken(newRefreshToken)
      setAuthToken(newAccessToken)
      // Update localStorage
      localStorage.setItem('spotify_access_token', newAccessToken)
      localStorage.setItem('spotify_refresh_token', newRefreshToken)
    })
  }, [])

  const handleLogout = useCallback(async () => {
    console.log('[Auth] Logout initiated')
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setAuthToken(null)
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    setError(null)
  }, [])

  const fetchUserProfile = useCallback(
    async (token: string) => {
      console.log('[Auth] Fetching user profile', { token })
      if (!token) {
        setUser(null)
        setError(null)
        return
      }
      try {
        setAuthToken(token)
        const response = await api.get('/me')
        setUser(response.data)
        setLoading(false)
      } catch (error: any) {
        console.error('Error fetching user profile:', error)
        if (error.response?.status === 401) {
          handleLogout()
        } else {
          const hadPreviousSession = !!localStorage.getItem('spotify_access_token')
          if (token && hadPreviousSession) {
            setError('Failed to fetch user profile')
          } else {
            setError(null)
          }
          setLoading(false)
        }
      }
    },
    [handleLogout],
  )

  const handleRefreshToken = useCallback(async () => {
    console.log('[Auth] Refreshing token')
    try {
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token')
      if (!storedRefreshToken) {
        throw new Error('No refresh token available')
      }

      const newAccessToken = await refreshSpotifyToken(storedRefreshToken)
      if (!newAccessToken) {
        throw new Error('Failed to refresh token')
      }

      setAccessToken(newAccessToken)
      setAuthToken(newAccessToken)
      localStorage.setItem('spotify_access_token', newAccessToken)
      fetchUserProfile(newAccessToken)
    } catch (error: any) {
      console.error('Error refreshing token:', error)

      // Handle specific refresh token revoked error
      if (error.message === 'REFRESH_TOKEN_REVOKED') {
        console.log(
          '[Auth] Refresh token was revoked, clearing session and requiring re-authentication',
        )
        setError('Your session has expired. Please log in again.')
      } else {
        setError('Failed to refresh authentication. Please log in again.')
      }

      handleLogout()
    }
  }, [handleLogout, fetchUserProfile])

  // Handle OAuth callback and check for existing tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error_param = urlParams.get('error')

      if (error_param) {
        setError(`Authentication error: ${error_param}`)
        setLoading(false)
        window.history.replaceState({}, document.title, '/')
        return
      }

      // Handle OAuth callback
      if (code) {
        try {
          setError(null) // Clear any previous errors during auth flow
          const tokens = await handleSpotifyCallback()
          if (tokens) {
            setAccessToken(tokens.accessToken)
            setRefreshToken(tokens.refreshToken)
            setAuthToken(tokens.accessToken)
            localStorage.setItem('spotify_access_token', tokens.accessToken)
            localStorage.setItem('spotify_refresh_token', tokens.refreshToken)
            fetchUserProfile(tokens.accessToken)
          } else {
            setError('Failed to complete authentication')
            setLoading(false)
          }
        } catch (error) {
          console.error('Error handling callback:', error)
          setError('Authentication failed')
          setLoading(false)
        }
        window.history.replaceState({}, document.title, '/')
        return
      }

      // Check for existing tokens in localStorage
      const storedAccessToken = localStorage.getItem('spotify_access_token')
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token')

      if (storedAccessToken && storedRefreshToken) {
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
        setAuthToken(storedAccessToken)
        fetchUserProfile(storedAccessToken)
      } else {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [fetchUserProfile, handleLogout])

  // Periodic token validation
  useEffect(() => {
    if (!accessToken || !refreshToken) return

    const validateToken = async () => {
      try {
        await api.get('/me')
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log('Token expired, attempting refresh...')
          handleRefreshToken()
        }
      }
    }

    // Validate token every 30 minutes
    const interval = setInterval(validateToken, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [accessToken, refreshToken, handleRefreshToken])

  return {
    user,
    accessToken,
    refreshToken,
    loading,
    error,
    setError,
    setAccessToken,
    setRefreshToken,
    setUser,
    handleLogout,
    fetchUserProfile,
    handleRefreshToken,
  }
}
