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
import { WireframePanel, WireframeButton, WireframeBox } from '../components/wireframe'
import { BetaWarning } from '../components/BetaWarning'
import '../styles/wireframe.css'
import './Login.css'

const Login: React.FC = () => {
  const handleLogin = async () => {
    try {
      const { initiateSpotifyAuth } = await import('../utils/spotifyAuth')
      await initiateSpotifyAuth()
    } catch (error: any) {
      console.error('Error initiating login:', error)
    }
  }

  return (
    <div className="wireframe-container grid-enabled">
      <div className="login-container">
        <BetaWarning variant="box" />

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
          </div>
        </WireframeBox>
      </div>
    </div>
  )
}

export default Login
