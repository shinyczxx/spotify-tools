/**
 * @file LoadingAnimation.tsx
 * @description Reusable loading animation component with animated dots
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-23
 */

import React from 'react'
import { useLoadingDots } from '@hooks/ui/useLoadingDots'
import './LoadingAnimation.css'

interface LoadingAnimationProps {
  isLoading: boolean
  text: string
  subtitle?: string
  progress?: {
    current: number
    total: number
  }
  pips?: {
    totalPips: number
    currentPips: number
  }
  size?: 'small' | 'medium' | 'large'
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  isLoading,
  text,
  subtitle,
  progress,
  pips,
  size = 'medium',
}) => {
  const dots = useLoadingDots({ isLoading })

  if (!isLoading) return null

  return (
    <div className={`loading-animation ${size}`}>
      <div className="loading-text">
        {text}{dots}
        <br />
        {progress && (
          <>
            {progress.current}/{progress.total}
            <br />
          </>
        )}
        {subtitle && (
          <span className="loading-subtitle">
            {subtitle}
          </span>
        )}
        {pips && (
          <div className="loading-pips">
            {Array.from({ length: pips.totalPips }, (_, i) => (
              <div
                key={i}
                className={`loading-pip ${i < pips.currentPips ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
        {progress && (
          <div className="loading-progress-bar">
            <div 
              className="loading-progress-fill"
              style={{
                '--progress-width': `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
              } as React.CSSProperties}
            />
          </div>
        )}
      </div>
    </div>
  )
}