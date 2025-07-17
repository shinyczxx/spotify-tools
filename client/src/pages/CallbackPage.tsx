/**
 * @file CallbackPage.tsx
 * @description Spotify OAuth callback page with wireframe theme
 * @author GitHub Copilot
 * @version 3.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - 3.0.0: Converted to wireframe theme with terminal styling
 * - 2.0.0: Converted to basic layout (removed circuit board components)
 * - 1.0.0: Initial implementation with circuit board layout
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WireframePanel } from '@components/wireframe/WireframePanel'
import { WireframeButton } from '@components/wireframe/WireframeButton'

const CallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('PROCESSING AUTHENTICATION...')
  const [dots, setDots] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
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

        // Store the auth code for now - actual implementation would handle token exchange
        localStorage.setItem('spotify_auth_code', code)

        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 1500))

        setStatus('success')
        setMessage('AUTHENTICATION SUCCESSFUL! REDIRECTING TO DASHBOARD...')

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      } catch (error) {
        console.error('Authentication error:', error)
        setStatus('error')
        setMessage('AUTHENTICATION FAILED. PLEASE TRY AGAIN.')
      }
    }

    handleCallback()
  }, [navigate])

  // Animated dots for loading state
  useEffect(() => {
    if (status === 'loading') {
      const interval = setInterval(() => {
        setDots((prev) => {
          if (prev === '...') return ''
          return prev + '.'
        })
      }, 500)
      return () => clearInterval(interval)
    }
  }, [status])

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'var(--terminal-cyan)'
      case 'success':
        return 'var(--terminal-green)'
      case 'error':
        return 'var(--terminal-red)'
      default:
        return 'var(--terminal-cyan)'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '[----]'
      case 'success':
        return '[DONE]'
      case 'error':
        return '[FAIL]'
      default:
        return '[----]'
    }
  }

  const getProgressBar = () => {
    switch (status) {
      case 'loading':
        return '█████░░░░░'
      case 'success':
        return '██████████'
      case 'error':
        return '███░░░░░░░'
      default:
        return '░░░░░░░░░░'
    }
  }

  return (
    <>
      <div className="callback-page-container grid-enabled">
        <div className="callback-content-wrapper">
          <div className="callback-header">
            <h1>SPOTIFY AUTHENTICATION CALLBACK</h1>
            <div className="terminal-line">SYSTEM STATUS: {getStatusIcon()}</div>
          </div>

          <div className="auth-container">
            <WireframePanel
              title="AUTHENTICATION STATUS"
              variant={status === 'error' ? 'error' : 'panel'}
            >
              <div className="auth-status">
                <div className="status-display">
                  <div
                    className="status-icon"
                    style={{
                      color: getStatusColor(),
                      animation: status === 'loading' ? 'blink 1s infinite' : 'none',
                    }}
                  >
                    {getStatusIcon()}
                  </div>

                  <div className="progress-section">
                    <div className="progress-label">PROGRESS:</div>
                    <div className="progress-bar" style={{ color: getStatusColor() }}>
                      {getProgressBar()}
                    </div>
                  </div>

                  <div className="status-message">
                    <span style={{ color: getStatusColor() }}>
                      {message}
                      {status === 'loading' && dots}
                    </span>
                  </div>

                  {status === 'loading' && (
                    <div className="loading-details">
                      <div className="terminal-line">→ VALIDATING AUTHORIZATION CODE...</div>
                      <div className="terminal-line">→ ESTABLISHING SECURE CONNECTION...</div>
                      <div className="terminal-line">→ REQUESTING ACCESS TOKENS...</div>
                    </div>
                  )}

                  {status === 'success' && (
                    <div className="success-details">
                      <div className="terminal-line success">✓ AUTHORIZATION CODE VALIDATED</div>
                      <div className="terminal-line success">✓ ACCESS TOKENS RECEIVED</div>
                      <div className="terminal-line success">✓ USER PROFILE LOADED</div>
                      <div className="terminal-line success">✓ REDIRECTING TO DASHBOARD...</div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="error-details">
                      <div className="terminal-line error">✗ AUTHENTICATION PROCESS FAILED</div>
                      <div className="terminal-line error">✗ UNABLE TO VALIDATE CREDENTIALS</div>
                      <div className="terminal-line">→ MANUAL INTERVENTION REQUIRED</div>
                    </div>
                  )}
                </div>

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

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .callback-page-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          box-sizing: border-box;
        }

        .callback-content-wrapper {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .callback-header {
          text-align: center;
          color: var(--terminal-cyan);
        }

        .callback-header h1 {
          font-family: 'Courier New', monospace;
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          letter-spacing: 2px;
          text-shadow: var(--glow-cyan);
        }

        .auth-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-status {
          padding: 30px;
          text-align: center;
        }

        .status-display {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .status-icon {
          font-family: 'Courier New', monospace;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .progress-label {
          font-size: 12px;
          color: var(--terminal-cyan-dim);
          letter-spacing: 1px;
        }

        .progress-bar {
          font-family: 'Courier New', monospace;
          font-size: 16px;
          letter-spacing: 2px;
          font-weight: bold;
        }

        .status-message {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
          max-width: 400px;
          line-height: 1.4;
        }

        .loading-details,
        .success-details,
        .error-details {
          margin-top: 20px;
          text-align: left;
          width: 100%;
        }

        .terminal-line {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          margin: 4px 0;
          color: var(--terminal-cyan-dim);
        }

        .terminal-line.success {
          color: var(--terminal-green);
        }

        .terminal-line.error {
          color: var(--terminal-red);
        }

        .auth-actions {
          margin-top: 30px;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        @media (max-width: 768px) {
          .callback-page-container {
            padding: 1rem;
          }
          
          .callback-content-wrapper {
            gap: 1.5rem;
          }
          
          .callback-header h1 {
            font-size: 1.2rem;
          }

          .auth-status {
            padding: 20px;
          }

          .status-icon {
            font-size: 20px;
          }

          .progress-bar {
            font-size: 14px;
          }

          .status-message {
            font-size: 13px;
          }
        }
        `,
        }}
      />
    </>
  )
}

export default CallbackPage
