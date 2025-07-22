/**
 * @file CallbackPage.tsx
 * @description OAuth callback page with modular components and hooks
 * @author Caleb Price
 * @version 4.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 4.0.0: Modularized with custom hooks and components, eliminated inline styles
 * - 3.0.0: Converted to wireframe theme with terminal styling
 * - 2.0.0: Converted to basic layout (removed circuit board components)
 * - 1.0.0: Initial implementation with circuit board layout
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { WireframePanel } from '@components/wireframe/WireframePanel'
import { WireframeButton } from '@components/wireframe/WireframeButton'
import { useOAuthCallback } from '@hooks/auth/useOAuthCallback'
import { useAuthStatus } from '@hooks/auth/useAuthStatus'
import { useLoadingDots } from '@hooks/ui/useLoadingDots'
import { AuthStatusDisplay } from '@components/Auth/AuthStatusDisplay'
import './CallbackPage.css'

const CallbackPage: React.FC = () => {
  const navigate = useNavigate()
  
  // Extract OAuth callback logic
  const { status, message } = useOAuthCallback()
  
  // Extract auth status utilities
  const { statusColor, statusIcon, progressBar } = useAuthStatus(status)
  
  // Extract loading dots animation
  const dots = useLoadingDots({ isLoading: status === 'loading' })

  return (
    <div className="callback-page-container wireframe-container grid-enabled">
      <div className="callback-content-wrapper">
        <div className="callback-header">
          <h1>SPOTIFY AUTHENTICATION CALLBACK</h1>
          <div className="terminal-line">SYSTEM STATUS: {statusIcon}</div>
        </div>

        <div className="auth-container">
          <WireframePanel
            title="AUTHENTICATION STATUS"
            variant={status === 'error' ? 'error' : 'panel'}
          >
            <div className="auth-status">
              <AuthStatusDisplay
                status={status}
                message={message}
                statusColor={statusColor}
                statusIcon={statusIcon}
                progressBar={progressBar}
                dots={dots}
              />

              {status === 'error' && (
                <div className="auth-actions">
                  <WireframeButton onClick={() => navigate('/login')} variant="default">
                    RETURN TO LOGIN
                  </WireframeButton>
                </div>
              )}
            </div>
          </WireframePanel>
        </div>
      </div>
    </div>
  )
}

export default CallbackPage
