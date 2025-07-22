/**
 * @file TerminalLoader.tsx
 * @description SVG-based 80s terminal style loading bar with modular components
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 2.0.0: Modularized with custom hooks and sub-components
 * - 1.0.0: Initial implementation with terminal loader variants
 */

import React from 'react'
import { useAnimatedProgress } from '@hooks/ui/useAnimatedProgress'
import { useLoadingDots } from '@hooks/ui/useLoadingDots'
import { BarLoader } from './BarLoader'
import { DotsLoader } from './DotsLoader'
import { BlocksLoader } from './BlocksLoader'
import './TerminalLoader.css'

export interface TerminalLoaderProps {
  progress?: number // 0-100
  message?: string
  showPercentage?: boolean
  variant?: 'bar' | 'dots' | 'blocks'
  size?: 'small' | 'medium' | 'large'
  className?: string
  animated?: boolean
}

export const TerminalLoader: React.FC<TerminalLoaderProps> = ({
  progress = 0,
  message = 'processing...',
  showPercentage = true,
  variant = 'bar',
  size = 'medium',
  className = '',
  animated = true,
}) => {
  // Custom hooks for animation
  const { animatedProgress } = useAnimatedProgress({ progress, animated })
  const dots = useLoadingDots({ isLoading: animated })

  const containerClasses = [
    'terminal-loader',
    `terminal-loader-${size}`,
    `terminal-loader-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const sharedProps = {
    progress: animatedProgress,
    animated,
    message,
    dots,
    showPercentage,
  }

  return (
    <div className={containerClasses}>
      {variant === 'bar' && <BarLoader {...sharedProps} />}
      {variant === 'dots' && <DotsLoader {...sharedProps} />}
      {variant === 'blocks' && <BlocksLoader {...sharedProps} />}
    </div>
  )
}

export default TerminalLoader;
