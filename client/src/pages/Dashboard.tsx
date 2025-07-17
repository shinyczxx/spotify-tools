/**
 * @file Dashboard.tsx
 * @description Wireframe dashboard page for album shuffle app
 * @author GitHub Copilot
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
  WireframeInfoPanel,
} from '../components/wireframe'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import '../styles/wireframe.css'
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
      id: 'track-info',
      title: 'track information',
      description: 'get detailed information about tracks and albums',
      path: '/gettrackinfo',
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
          <WireframeInfoPanel
            header="display name"
            info={user?.display_name || 'n/a'}
            variant="compact"
          />
          <WireframeInfoPanel header="email" info={user?.email || 'n/a'} variant="compact" />
          <WireframeInfoPanel header="user id" info={user?.id || 'n/a'} variant="compact" />
          <WireframeInfoPanel
            header="subscription"
            info={user?.product || 'n/a'}
            variant="compact"
          />
          <WireframeInfoPanel
            header="followers"
            info={String(user?.followers?.total || 0)}
            variant="compact"
          />
          <WireframeInfoPanel header="country" info={user?.country || 'n/a'} variant="compact" />
        </div>
      </WireframePanel>
    </div>
  )
}

export default Dashboard
