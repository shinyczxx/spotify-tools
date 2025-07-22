/**
 * @file DotsLoader.tsx
 * @description Dot-based terminal loader component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { LoaderInfo } from './LoaderInfo'

interface DotsLoaderProps {
  progress: number
  animated: boolean
  message: string
  dots: string
  showPercentage: boolean
}

/**
 * Dot-based progress loader
 */
export const DotsLoader: React.FC<DotsLoaderProps> = ({
  progress,
  animated,
  message,
  dots,
  showPercentage,
}) => {
  const dotCount = 20
  const activeDots = Math.floor((progress / 100) * dotCount)

  return (
    <div className="terminal-loader-dots">
      <div className="terminal-loader-dots-container">
        {Array.from({ length: dotCount }).map((_, i) => (
          <span
            key={i}
            className={`terminal-loader-dot ${
              i < activeDots ? 'active' : ''
            } terminal-loader-dot-delay-${i} ${animated ? '' : 'no-delay'}`}
          >
            ●
          </span>
        ))}
      </div>

      <LoaderInfo
        message={message}
        dots={dots}
        showPercentage={showPercentage}
        progress={progress}
      />
    </div>
  )
}