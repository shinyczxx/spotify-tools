/**
 * @file ErrorBanner.tsx
 * @description Reusable error banner component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-21
 */

import React from 'react'
import './ErrorBanner.css'

interface ErrorBannerProps {
  error: string
  onDismiss: () => void
  topOffset?: number
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss, topOffset = 0 }) => {
  return (
    <div 
      className="error-banner"
      style={{ top: `${topOffset}px` }}
    >
      <span>{error}</span>
      <button 
        className="error-banner-close"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  )
}