/**
 * @file StatusDetails.tsx
 * @description Status-specific details display component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { AuthStatus } from '../../hooks/auth/useOAuthCallback'

interface StatusDetailsProps {
  status: AuthStatus
}

/**
 * Displays status-specific details based on auth state
 */
export const StatusDetails: React.FC<StatusDetailsProps> = ({ status }) => {
  if (status === 'loading') {
    return (
      <div className="loading-details">
        <div className="terminal-line">→ VALIDATING AUTHORIZATION CODE...</div>
        <div className="terminal-line">→ ESTABLISHING SECURE CONNECTION...</div>
        <div className="terminal-line">→ REQUESTING ACCESS TOKENS...</div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="success-details">
        <div className="terminal-line success">✓ AUTHORIZATION CODE VALIDATED</div>
        <div className="terminal-line success">✓ ACCESS TOKENS RECEIVED</div>
        <div className="terminal-line success">✓ USER PROFILE LOADED</div>
        <div className="terminal-line success">✓ REDIRECTING TO DASHBOARD...</div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="error-details">
        <div className="terminal-line error">✗ AUTHENTICATION PROCESS FAILED</div>
        <div className="terminal-line error">✗ UNABLE TO VALIDATE CREDENTIALS</div>
        <div className="terminal-line">→ MANUAL INTERVENTION REQUIRED</div>
      </div>
    )
  }

  return null
}