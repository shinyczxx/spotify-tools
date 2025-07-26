/**
 * @file BetaWarning.tsx
 * @description Beta warning component using WireframePanel
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-25
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
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

  const content = (
    <div className="beta-warning-content">
      <div className="beta-warning-icon">
        ⚠️
      </div>
      <div className="beta-warning-text">
        <div className="beta-warning-title">
          BETA BUILD
        </div>
        <div className="beta-warning-message">
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
        <WireframeButton
          onClick={onDismiss}
          variant="secondary"
          size="small"
        >
          Dismiss
        </WireframeButton>
      )}
    </div>
  )

  return (
    <div className={`beta-warning-container beta-warning-container--${variant} ${className}`}>
      <WireframePanel variant="warn" title="Warning">
        {content}
      </WireframePanel>
    </div>
  )
}

export default BetaWarning