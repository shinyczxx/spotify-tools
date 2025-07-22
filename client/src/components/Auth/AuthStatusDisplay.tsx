/**
 * @file AuthStatusDisplay.tsx
 * @description Authentication status display component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { AuthStatus } from '../../hooks/auth/useOAuthCallback'
import { ProgressSection } from './ProgressSection'
import { StatusDetails } from './StatusDetails'

interface AuthStatusDisplayProps {
  status: AuthStatus
  message: string
  statusColor: string
  statusIcon: string
  progressBar: string
  dots: string
}

/**
 * Displays authentication status with progress and details
 */
export const AuthStatusDisplay: React.FC<AuthStatusDisplayProps> = ({
  status,
  message,
  statusColor,
  statusIcon,
  progressBar,
  dots,
}) => {
  return (
    <div className="status-display">
      <div
        className="status-icon"
        style={{
          color: statusColor,
          animation: status === 'loading' ? 'blink 1s infinite' : 'none',
        }}
      >
        {statusIcon}
      </div>

      <ProgressSection
        progressBar={progressBar}
        statusColor={statusColor}
      />

      <div className="status-message">
        <span style={{ color: statusColor }}>
          {message}
          {status === 'loading' && dots}
        </span>
      </div>

      <StatusDetails status={status} />
    </div>
  )
}