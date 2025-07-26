/**
 * @file App.tsx
 * @description Main application component - simplified MVP version
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-14
 */

import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { useCRTEffect } from '@hooks/ui/useCRTEffect'
import { useGridBackground } from '@hooks/ui/useGridBackground'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import { ErrorBanner } from './components/ErrorBanner'
import CRTOverlay from './components/CRTOverlay'
import { TIMING, STORAGE_KEYS } from './constants/app'
import { ROUTES } from './constants/routes'
import { Dashboard, SpotifyInfo, Login, PlaylistTools, LastFmTools, Settings, CallbackPage } from './pages'
import { getFontSizeFromStorage, setFontSize as setAppFontSize } from './utils/ui/fontSizeUtils'
import { getPageIdFromPath, getRouteFromPageId, getTitleFromPath, handleSpecialNavigation } from './utils/routeUtils'
import './App.css'

import { PageLayout } from './components'

function App() {
  const { user, accessToken, error, setError, loading } = useSpotifyAuth()
  const { crtSettings } = useCRTEffect()
  
  // Initialize grid background globally
  useGridBackground()
  
  const navigate = useNavigate()
  const location = useLocation()
  const recentCallbackRef = useRef(false)

  // Font size state with robust default
  const [fontSize, setFontSize] = useState<number>(getFontSizeFromStorage)

  // Beta banner state
  const [betaBannerDismissed, setBetaBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.BETA_BANNER_DISMISSED) === 'true'
  })

  // Track current page for Navbar highlighting
  const [currentPage, setCurrentPage] = useState<string>('dashboard')

  // Update currentPage based on location and track callback navigation
  useEffect(() => {
    const path = location.pathname.toLowerCase()
    
    // Track if we're on or coming from callback page
    if (path.includes(ROUTES.CALLBACK)) {
      recentCallbackRef.current = true
    } else if (recentCallbackRef.current && path.startsWith(ROUTES.DASHBOARD)) {
      // Clear errors when navigating to dashboard from callback
      setError(null)
      // Clear the flag after a delay to allow auth flow to complete
      setTimeout(() => {
        recentCallbackRef.current = false
      }, TIMING.CALLBACK_CLEAR_DELAY)
    }
    
    // Set current page using utility function
    setCurrentPage(getPageIdFromPath(path))
  }, [location.pathname, setError])

  // Update CSS variable and localStorage when font size changes
  useEffect(() => {
    const safeFontSize = setAppFontSize(fontSize)
    if (fontSize !== safeFontSize) setFontSize(safeFontSize)
  }, [fontSize])

  // Handle beta banner dismissal
  const handleDismissBetaBanner = () => {
    setBetaBannerDismissed(true)
    localStorage.setItem(STORAGE_KEYS.BETA_BANNER_DISMISSED, 'true')
  }

  // Navigation handler for Navbar
  const handleNavigate = (pageId: string) => {
    // Handle special navigation cases (logout, external links)
    if (handleSpecialNavigation(pageId, navigate, handleLogout)) {
      return
    }
    
    setCurrentPage(pageId)
    const route = getRouteFromPageId(pageId)
    navigate(route)
  }

  // Logout handler
  const handleLogout = () => {
    // If useSpotifyAuth provides a logout, use it, else fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
    window.location.href = '/'
  }

  // Get title for current route
  const getTitle = () => getTitleFromPath(location.pathname)

  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      {/* Beta warning banner for authenticated users */}
      {user && accessToken && !betaBannerDismissed && (
        <div className="beta-warning-container beta-warning-container--banner">
          <WireframePanel variant="warn" title="Warning">
            <div className="beta-warning-content">
              <div className="beta-warning-icon">⚠️</div>
              <div className="beta-warning-text">
                <div className="beta-warning-title">BETA BUILD</div>
                <div className="beta-warning-message">
                  Beta version - features may be incomplete or unstable
                </div>
              </div>
              <WireframeButton
                onClick={handleDismissBetaBanner}
                variant="default"
              >
                Dismiss
              </WireframeButton>
            </div>
          </WireframePanel>
        </div>
      )}
      
      {/* Only show error banner when user is authenticated and not during authentication flow */}
      {error && user && !location.pathname.includes(ROUTES.CALLBACK) && !loading && !recentCallbackRef.current && (
        <ErrorBanner
          error={error}
          onDismiss={() => setError(null)}
          topOffset={betaBannerDismissed ? 0 : 60}
        />
      )}

      <Routes>
        {/* OAuth callback route */}
        <Route path={ROUTES.CALLBACK} element={<CallbackPage />} />

        {/* Authenticated routes wrapped in PageLayout */}
        {user && accessToken ? (
          <Route
            path="*"
            element={
              <PageLayout
                title={getTitle()}
                currentPage={currentPage}
                onNavigate={handleNavigate}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                onLogout={handleLogout}
              >
                <Routes>
                  <Route path={ROUTES.SETTINGS} element={<Settings />} />
                  <Route path={ROUTES.SPOTIFY_INFO} element={<SpotifyInfo />} />
                  <Route path={ROUTES.PLAYLIST_TOOLS} element={<PlaylistTools />} />
                  <Route path={ROUTES.LASTFM_TOOLS} element={<LastFmTools />} />
                  <Route path={ROUTES.ALBUM_SHUFFLE} element={<PlaylistTools />} />
                  <Route path={ROUTES.PLAYLIST_COMBINER} element={<PlaylistTools />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </PageLayout>
            }
          />
        ) : (
          <Route path="*" element={<Login />} />
        )}
      </Routes>
      
      {/* CRT overlay effects */}
      <CRTOverlay
        enabled={crtSettings.enabled}
        intensity={crtSettings.intensity}
        scanlineSize={crtSettings.scanlineSize}
        flickerEnabled={crtSettings.flickerEnabled}
        movingScanline={crtSettings.movingScanline}
      />
    </div>
  )
}

export default App
