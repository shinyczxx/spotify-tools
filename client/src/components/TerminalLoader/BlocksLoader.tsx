/**
 * @file BlocksLoader.tsx
 * @description Block-based terminal loader component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { LoaderInfo } from './LoaderInfo'

interface BlocksLoaderProps {
  progress: number
  animated: boolean
  message: string
  dots: string
  showPercentage: boolean
}

/**
 * Block-based progress loader
 */
export const BlocksLoader: React.FC<BlocksLoaderProps> = ({
  progress,
  animated,
  message,
  dots,
  showPercentage,
}) => {
  const blockCount = 25
  const activeBlocks = Math.floor((progress / 100) * blockCount)

  return (
    <div className="terminal-loader-blocks">
      <div className="terminal-loader-blocks-container">
        {Array.from({ length: blockCount }).map((_, i) => (
          <div
            key={i}
            className={`terminal-loader-block ${
              i < activeBlocks ? 'active' : ''
            } terminal-loader-block-delay-${i} ${animated ? '' : 'no-delay'}`}
          >
            ■
          </div>
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