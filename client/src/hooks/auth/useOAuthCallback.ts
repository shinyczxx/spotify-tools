/**
 * @file useOAuthCallback.ts
 * @description Custom hook for handling OAuth callback logic
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export type AuthStatus = 'loading' | 'success' | 'error'

export interface UseOAuthCallbackReturn {
  status: AuthStatus
  message: string
  handleCallback: () => Promise<void>
}

/**
 * Custom hook for handling OAuth callback flow
 */
export const useOAuthCallback = (): UseOAuthCallbackReturn => {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [message, setMessage] = useState<string>('PROCESSING AUTHENTICATION...')
  const navigate = useNavigate()

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`AUTHENTICATION FAILED: ${error.toUpperCase()}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('NO AUTHORIZATION CODE RECEIVED')
        return
      }

      setMessage('EXCHANGING AUTHORIZATION CODE FOR TOKENS...')

      // Import the actual auth handler
      const { handleSpotifyCallback } = await import('../../utils/auth/spotifyAuth')
      const tokens = await handleSpotifyCallback()

      // Check if tokens exist in localStorage (auth might succeed even if handler returns null)
      const storedAccessToken = localStorage.getItem('spotify_access_token')
      const storedRefreshToken = localStorage.getItem('spotify_refresh_token')

      if (tokens || (storedAccessToken && storedRefreshToken)) {
        // Store tokens if we got them from handler
        if (tokens) {
          localStorage.setItem('spotify_access_token', tokens.accessToken)
          localStorage.setItem('spotify_refresh_token', tokens.refreshToken)
        }

        setStatus('success')
        setMessage('AUTHENTICATION SUCCESSFUL! REDIRECTING TO DASHBOARD...')

        // Clear URL parameters to prevent reprocessing
        window.history.replaceState({}, document.title, window.location.pathname)

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } else {
        setStatus('error')
        setMessage('TOKEN EXCHANGE FAILED. PLEASE TRY AGAIN.')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setStatus('error')
      setMessage('AUTHENTICATION FAILED. PLEASE TRY AGAIN.')
    }
  }

  useEffect(() => {
    handleCallback()
  }, [])

  return {
    status,
    message,
    handleCallback,
  }
}