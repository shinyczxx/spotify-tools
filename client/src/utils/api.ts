import axios from 'axios'
import { refreshSpotifyToken } from './spotifyAuth'

const api = axios.create({
  baseURL: 'https://api.spotify.com/v1',
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

// Token refresh logic: setTokens will be injected by the auth hook
let setTokens: ((accessToken: string, refreshToken: string) => void) | null = null

export function setTokenUpdateCallback(cb: typeof setTokens) {
  setTokens = cb
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry && setTokens) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('spotify_refresh_token')
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const newAccessToken = await refreshSpotifyToken(refreshToken)
        if (!newAccessToken) {
          throw new Error('Failed to refresh token')
        }

        setAuthToken(newAccessToken)
        setTokens(newAccessToken, refreshToken)
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError: any) {
        // Handle specific refresh token revoked error
        if (refreshError.message === 'REFRESH_TOKEN_REVOKED') {
          console.log('[API] Refresh token revoked, clearing auth and redirecting to login')
          // Clear tokens and force logout
          localStorage.removeItem('spotify_access_token')
          localStorage.removeItem('spotify_refresh_token')
          setAuthToken(null)
        }

        // If refresh fails, logout will be handled in the hook
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  },
)

export default api
