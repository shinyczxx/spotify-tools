/**
 * @file useAuthStatus.ts
 * @description Custom hook for auth status display utilities
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useMemo } from 'react'
import { AuthStatus } from './useOAuthCallback'

export interface UseAuthStatusReturn {
  statusColor: string
  statusIcon: string
  progressBar: string
}

/**
 * Custom hook for auth status display utilities
 */
export const useAuthStatus = (status: AuthStatus): UseAuthStatusReturn => {
  const statusColor = useMemo(() => {
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
  }, [status])

  const statusIcon = useMemo(() => {
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
  }, [status])

  const progressBar = useMemo(() => {
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
  }, [status])

  return {
    statusColor,
    statusIcon,
    progressBar,
  }
}