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
import { BetaWarning } from './components/BetaWarning'
import CRTOverlay from './components/CRTOverlay'
import './App.css'

import Dashboard from './pages/Dashboard'
import GetTrackInfo from './pages/GetTrackInfo'
import Login from './pages/Login'
import PlaylistTools from './pages/PlaylistTools'
import Settings from './pages/Settings'
import CallbackPage from './pages/CallbackPage'
import PageLayout from './components/PageLayout/PageLayout'

function App() {
  const { user, accessToken, error, setError, loading } = useSpotifyAuth()
  const { crtSettings } = useCRTEffect()
  
  // Initialize grid background globally
  useGridBackground()
  
  const navigate = useNavigate()
  const location = useLocation()
  const recentCallbackRef = useRef(false)

  // Font size state with robust default
  const [fontSize, setFontSize] = useState<number>(() => {
    const stored = Number(localStorage.getItem('terminal-font-size'))
    return stored && stored >= 10 && stored <= 32 ? stored : 14
  })

  // Beta banner state
  const [betaBannerDismissed, setBetaBannerDismissed] = useState<boolean>(() => {
    return localStorage.getItem('beta-banner-dismissed') === 'true'
  })

  // Track current page for Navbar highlighting
  const [currentPage, setCurrentPage] = useState<string>('dashboard')

  // Update currentPage based on location and track callback navigation
  useEffect(() => {
    const path = location.pathname.toLowerCase()
    
    // Track if we're on or coming from callback page
    if (path.includes('/callback')) {
      recentCallbackRef.current = true
    } else if (recentCallbackRef.current && path.startsWith('/dashboard')) {
      // Clear errors when navigating to dashboard from callback
      setError(null)
      // Clear the flag after a delay to allow auth flow to complete
      setTimeout(() => {
        recentCallbackRef.current = false
      }, 2000)
    }
    
    // Map pathnames to page ids used by Navbar
    const pageMap: Record<string, string> = {
      '/settings': 'settings',
      '/gettrackinfo': 'getTrackInfo',
      '/playlisttools': 'playlist-tools',
      '/albumshuffle': 'albumshuffle',
      '/playlistcombiner': 'playlistcombiner',
      '/': 'dashboard',
    }
    setCurrentPage(pageMap[path] || 'dashboard')
  }, [location.pathname, setError])

  // Update CSS variable and localStorage when font size changes
  useEffect(() => {
    const safeFontSize = fontSize && fontSize >= 10 && fontSize <= 32 ? fontSize : 14
    document.documentElement.style.setProperty('--terminal-font-size', `${safeFontSize}px`)
    localStorage.setItem('terminal-font-size', String(safeFontSize))
    if (fontSize !== safeFontSize) setFontSize(safeFontSize)
  }, [fontSize])

  // Handle beta banner dismissal
  const handleDismissBetaBanner = () => {
    setBetaBannerDismissed(true)
    localStorage.setItem('beta-banner-dismissed', 'true')
  }

  // Navigation handler for Navbar
  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId)
    const routes = {
      settings: '/settings',
      getTrackInfo: '/gettrackinfo',
      'playlist-tools': '/playlisttools',
      albumshuffle: '/albumshuffle',
      playlistcombiner: '/playlistcombiner',
    }
    navigate(routes[pageId] || '/')
  }

  // Logout handler
  const handleLogout = () => {
    // If useSpotifyAuth provides a logout, use it, else fallback
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
    window.location.href = '/'
  }

  // Title mapping for each route
  const getTitle = () => {
    const path = location.pathname.toLowerCase()
    const titles = {
      '/settings': 'Settings',
      '/gettrackinfo': 'Track Info',
      '/playlisttools': 'Playlist Tools',
      '/albumshuffle': 'Album Shuffle',
      '/playlistcombiner': 'Playlist Combiner',
    }
    
    for (const [route, title] of Object.entries(titles)) {
      if (path.startsWith(route)) return title
    }
    return 'Dashboard'
  }

  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      {/* Beta warning banner for authenticated users */}
      {user && accessToken && !betaBannerDismissed && (
        <BetaWarning 
          variant="banner" 
          onDismiss={handleDismissBetaBanner}
        />
      )}
      
      {/* Only show error banner when user is authenticated and not during authentication flow */}
      {error && user && !location.pathname.includes('/callback') && !loading && !recentCallbackRef.current && (
        <div
          className="error-banner"
          style={{
            position: 'fixed',
            top: betaBannerDismissed ? '0' : '60px', // Adjust for beta banner
            left: '0',
            right: '0',
            backgroundColor: '#FF4444',
            color: '#FFFFFF',
            padding: '8px 16px',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null as any)}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '18px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}

      <Routes>
        {/* OAuth callback route */}
        <Route path="/callback" element={<CallbackPage />} />

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
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/gettrackinfo" element={<GetTrackInfo />} />
                  <Route path="/playlisttools" element={<PlaylistTools />} />
                  <Route path="/albumshuffle" element={<PlaylistTools />} />
                  <Route path="/playlistcombiner" element={<PlaylistTools />} />
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
