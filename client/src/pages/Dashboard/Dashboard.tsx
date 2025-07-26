/**
 * @file Dashboard.tsx
 * @description Wireframe dashboard page for album shuffle app
 * @author Caleb Price
 * @version 3.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 3.0.0: Converted to wireframe theme
 * - 2.0.0: Basic dashboard implementation
 * - 1.0.0: Initial implementation
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  WireframePanel,
  WireframeButton,
  WireframeBox,
} from '@components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import '@styles/wireframe.css'
import './Dashboard.css'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, handleLogout } = useSpotifyAuth()

  const navigationCards = [
    {
      id: 'playlist-tools',
      title: 'playlist tools',
      description: 'manage playlists, shuffle albums, and combine collections',
      path: '/playlisttools',
      primary: true,
    },
    {
      id: 'spotify-info',
      title: 'spotify information',
      description: 'get detailed information about tracks, albums, and artists',
      path: '/spotifyinfo',
    },
    {
      id: 'settings',
      title: 'settings',
      description: 'configure your preferences and account settings',
      path: '/settings',
    },
  ]

  return (
    <div className="wireframe-container dashboard-container">
      <WireframePanel title="" variant="header">
        {/* User Info */}
        <div className="dashboard-header">
          <div className="dashboard-user-info">
            <p className="dashboard-user-name">welcome back, {user?.display_name || 'user'}</p>
            <p className="dashboard-user-details">spotify account: {user?.id}</p>
          </div>
          <WireframeButton onClick={handleLogout}>logout</WireframeButton>
        </div>
      </WireframePanel>

      {/* User Info Panel */}
      <WireframePanel title="user information">
        <div className="dashboard-user-info-grid">
          <WireframePanel title="display name" variant="data">
            {user?.display_name || 'n/a'}
          </WireframePanel>
          <WireframePanel title="email" variant="data">
            {user?.email || 'n/a'}
          </WireframePanel>
          <WireframePanel title="user id" variant="data">
            {user?.id || 'n/a'}
          </WireframePanel>
          <WireframePanel title="subscription" variant="data">
            {user?.product || 'n/a'}
          </WireframePanel>
          <WireframePanel title="followers" variant="data">
            {String(user?.followers?.total || 0)}
          </WireframePanel>
          <WireframePanel title="country" variant="data">
            {user?.country || 'n/a'}
          </WireframePanel>
        </div>
      </WireframePanel>
    </div>
  )
}

export default Dashboard
