/**
 * @file LoaderInfo.tsx
 * @description Shared info section for terminal loaders
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'

interface LoaderInfoProps {
  message: string
  dots: string
  showPercentage: boolean
  progress: number
}

/**
 * Shared information display component for all loader variants
 */
export const LoaderInfo: React.FC<LoaderInfoProps> = ({
  message,
  dots,
  showPercentage,
  progress,
}) => (
  <div className="terminal-loader-info">
    <span className="terminal-loader-message">
      {message}{dots}
    </span>
    {showPercentage && (
      <span className="terminal-loader-percentage">
        {Math.round(progress)}%
      </span>
    )}
  </div>
)