/**
 * @file BarLoader.tsx
 * @description SVG-based terminal bar loader component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { LoaderInfo } from './LoaderInfo'

interface BarLoaderProps {
  progress: number
  animated: boolean
  message: string
  dots: string
  showPercentage: boolean
}

/**
 * SVG-based segmented progress bar loader
 */
export const BarLoader: React.FC<BarLoaderProps> = ({
  progress,
  animated,
  message,
  dots,
  showPercentage,
}) => {
  const segments = 50
  const filledSegments = Math.floor((progress / 100) * segments)

  return (
    <div className="terminal-loader-bar">
      <div className="terminal-loader-bar-container">
        <svg
          className="terminal-loader-bar-svg"
          viewBox={`0 0 ${segments * 2} 10`}
          width="100%"
          height="10"
        >
          {/* Background grid */}
          {Array.from({ length: segments }).map((_, i) => (
            <rect
              key={`bg-${i}`}
              x={i * 2}
              y={0}
              width={1.8}
              height={10}
              fill="none"
              stroke="var(--terminal-cyan-dim)"
              strokeWidth="0.1"
              opacity="0.3"
            />
          ))}

          {/* Progress bars */}
          {Array.from({ length: filledSegments }).map((_, i) => (
            <rect
              key={`fill-${i}`}
              x={i * 2}
              y={0}
              width={1.8}
              height={10}
              fill="var(--terminal-cyan)"
              className={`terminal-loader-segment terminal-loader-bar-delay-${i} ${animated ? '' : 'no-delay'}`}
            />
          ))}

          {/* Animated cursor at progress position */}
          {animated && (
            <rect
              x={filledSegments * 2}
              y={0}
              width={1.8}
              height={10}
              fill="var(--terminal-cyan-bright)"
              className="terminal-loader-cursor"
            />
          )}
        </svg>
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