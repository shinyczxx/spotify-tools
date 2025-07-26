/**
 * @file Login.tsx
 * @description Wireframe login page for album shuffle app
 * @author Caleb Price
 * @version 3.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 3.0.0: Converted to wireframe theme
 * - 2.0.0: Basic login implementation
 * - 1.0.0: Initial implementation
 */

import React from 'react'
import { WireframePanel, WireframeButton, WireframeBox } from '@components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import '@styles/wireframe.css'
import './Login.css'

const Login: React.FC = () => {
  const { setError, setAccessToken, setRefreshToken, setUser } = useSpotifyAuth()
  
  const handleLogin = async () => {
    try {
      // Clear any existing auth state before starting new OAuth flow
      setError(null)
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
      
      const { initiateSpotifyAuth } = await import('@utils/auth/spotifyAuth')
      await initiateSpotifyAuth()
    } catch (error: any) {
      console.error('Error initiating login:', error)
      setError('Failed to start authentication. Please try again.')
    }
  }

  return (
    <div className="wireframe-container">
      <div className="login-container">
        <WireframePanel variant="warn" title="Warning">
          <div className="beta-warning-content">
            <div className="beta-warning-icon">⚠️</div>
            <div className="beta-warning-text">
              <div className="beta-warning-title">BETA BUILD</div>
              <div className="beta-warning-message">
                This is a beta version of the Spotify Album Shuffle application. 
                Some features may be incomplete or unstable. Use at your own discretion.
              </div>
            </div>
          </div>
        </WireframePanel>

        <WireframePanel title="spotify album shuffle" variant="header" className="login-panel">
          <div className="login-content">
            <p className="login-description">
              connect your spotify account to start shuffling albums and managing playlists
            </p>

            <WireframeButton onClick={handleLogin} fullWidth>
              connect to spotify
            </WireframeButton>

            <p className="login-security-note">secure authentication via spotify oauth</p>
          </div>
        </WireframePanel>

        <WireframePanel title="features">
          <div className="features-grid">
            <WireframeBox boxType="default" className="feature-box">
              <h4>album shuffle</h4>
              <ul className="feature-list">
                <li>• shuffle multiple albums</li>
                <li>• smart filtering options</li>
                <li>• energy-based ordering</li>
              </ul>
            </WireframeBox>

            <WireframeBox boxType="default" className="feature-box">
              <h4>playlist tools</h4>
              <ul className="feature-list">
                <li>• combine playlists</li>
                <li>• remove duplicates</li>
                <li>• batch operations</li>
              </ul>
            </WireframeBox>

            <WireframeBox boxType="default" className="feature-box">
              <h4>track analysis</h4>
              <ul className="feature-list">
                <li>• detailed metadata</li>
                <li>• audio features</li>
                <li>• lastfm integration</li>
              </ul>
            </WireframeBox>

            <WireframeBox boxType="default" className="feature-box">
              <h4>customization</h4>
              <ul className="feature-list">
                <li>• configurable settings</li>
                <li>• theme preferences</li>
                <li>• export options</li>
              </ul>
            </WireframeBox>
          </div>
        </WireframePanel>

        <WireframeBox boxType="panel" className="login-footer">
          <div className="footer-content">
            <p className="footer-privacy">
              all data remains on spotify's servers | no personal data stored
            </p>
            <div className="footer-links">
              <WireframeButton 
                onClick={() => window.open('https://github.com/shinyczxx/spotify-tools', '_blank')}
                variant="default"
              >
                view source on github
              </WireframeButton>
            </div>
          </div>
        </WireframeBox>
      </div>
    </div>
  )
}

export default Login
