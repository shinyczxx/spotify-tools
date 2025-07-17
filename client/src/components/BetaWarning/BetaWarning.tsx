/**
 * @file BetaWarning.tsx
 * @description Beta warning component for login and banner display
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-16
 */

import React from 'react'
import './BetaWarning.css'

interface BetaWarningProps {
  variant: 'box' | 'banner'
  onDismiss?: () => void
  className?: string
}

const BetaWarning: React.FC<BetaWarningProps> = ({
  variant,
  onDismiss,
  className = ''
}) => {
  const isBox = variant === 'box'
  const isBanner = variant === 'banner'

  return (
    <div className={`beta-warning beta-warning--${variant} ${className}`}>
      <div className="beta-warning__content">
        <div className="beta-warning__icon">
          ⚠️
        </div>
        <div className="beta-warning__text">
          <div className="beta-warning__title">
            BETA BUILD
          </div>
          <div className="beta-warning__message">
            {isBox && (
              <>
                This is a beta version of the Spotify Album Shuffle application. 
                Some features may be incomplete or unstable. Use at your own discretion.
              </>
            )}
            {isBanner && (
              <>
                Beta version - features may be incomplete or unstable
              </>
            )}
          </div>
        </div>
        {isBanner && onDismiss && (
          <button
            className="beta-warning__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss beta warning"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default BetaWarning