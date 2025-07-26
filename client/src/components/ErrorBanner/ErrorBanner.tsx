/**
 * @file ErrorBanner.tsx
 * @description Reusable error banner component using WireframePanel
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-25
 */

import React from 'react'
import { WireframePanel, WireframeButton } from '@components/wireframe'
import './ErrorBanner.css'

interface ErrorBannerProps {
  error: string
  onDismiss: () => void
  topOffset?: number
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss, topOffset = 0 }) => {
  return (
    <div 
      className="error-banner-container"
      style={{ top: `${topOffset}px` }}
    >
      <WireframePanel variant="error" title="Error">
        <div className="error-content">
          <span>{error}</span>
          <WireframeButton 
            onClick={onDismiss}
            variant="secondary"
            size="small"
          >
            Dismiss
          </WireframeButton>
        </div>
      </WireframePanel>
    </div>
  )
}