/**
 * @file TooltipIcon.tsx
 * @description SVG-based wireframe tooltip icon with customizable symbol, size, tail, direction, and color inversion. Shows a wireframe hover panel on mouse over. Fully theme-compliant and accessible.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-08
 *
 * @UsedBy
 * - Any component needing a terminal-themed tooltip icon
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation
 */

import React, { useId } from 'react'
import { HoverDisplay } from '@components/HoverDisplay'
import './TooltipIcon.css'

// Simple utility to concatenate CSS classes
const cx = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export type TooltipDirection = 'top' | 'right' | 'bottom' | 'left'

export interface TooltipIconProps {
  contents: React.ReactNode
  symbol?: string
  size?: number // px
  tailLength?: number // px
  direction?: TooltipDirection
  invertedColor?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * SVG icon drawing function for the tooltip icon.
 */
function drawTooltipIcon({
  symbol = '?',
  size = 28,
  tailLength = 10,
  direction = 'top',
  invertedColor = false,
}: Pick<TooltipIconProps, 'symbol' | 'size' | 'tailLength' | 'direction' | 'invertedColor'>) {
  // Colors from CSS custom properties
  const border = 'var(--terminal-cyan)'
  const fill = invertedColor ? 'var(--terminal-cyan)' : 'var(--terminal-bg)'
  const symbolColor = invertedColor ? 'var(--terminal-bg)' : 'var(--terminal-cyan)'
  const fontFamily = 'var(--terminal-font, Fixedsys, Courier New, monospace)'
  const fontSize = size * 0.6
  const half = size / 2
  const tail = tailLength > 0

  // Tail points (from center of side outwards)
  let tailPoints = ''
  if (tail) {
    switch (direction) {
      case 'top':
        tailPoints = `${half - 4},0 ${half + 4},0 ${half},${-tailLength}`
        break
      case 'bottom':
        tailPoints = `${half - 4},${size} ${half + 4},${size} ${half},${size + tailLength}`
        break
      case 'left':
        tailPoints = `0,${half - 4} 0,${half + 4} ${-tailLength},${half}`
        break
      case 'right':
        tailPoints = `${size},${half - 4} ${size},${half + 4} ${size + tailLength},${half}`
        break
    }
  }

  return (
    <svg
      className="tooltip-icon-svg"
      width={size + (direction === 'left' || direction === 'right' ? tailLength : 0)}
      height={size + (direction === 'top' || direction === 'bottom' ? tailLength : 0)}
      style={{ display: 'block' }}
      aria-hidden="true"
      focusable="false"
    >
      {/* Main square */}
      <rect
        x={direction === 'left' ? tailLength : 0}
        y={direction === 'top' ? tailLength : 0}
        width={size}
        height={size}
        rx={3}
        fill={fill}
        stroke={border}
        strokeWidth={2}
        style={{ filter: 'drop-shadow(var(--glow-cyan))' }}
      />
      {/* Tail */}
      {tail && (
        <polygon
          points={tailPoints}
          fill={border}
          stroke={border}
          strokeWidth={1}
          style={{ filter: 'drop-shadow(var(--glow-cyan))' }}
        />
      )}
      {/* Symbol */}
      <text
        x={direction === 'left' ? tailLength + half : half}
        y={direction === 'top' ? tailLength + half : half}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily={fontFamily}
        fontSize={fontSize}
        fill={symbolColor}
        style={{
          textShadow: 'var(--glow-cyan)',
          letterSpacing: '1px',
          textTransform: 'lowercase',
          userSelect: 'none',
        }}
      >
        {symbol}
      </text>
    </svg>
  )
}

const TooltipIcon: React.FC<TooltipIconProps> = ({
  contents,
  symbol = '?',
  size = 28,
  tailLength = 10,
  direction = 'top',
  invertedColor = false,
  className,
  ariaLabel,
}) => {
  const id = useId()
  return (
    <HoverDisplay content={contents} position={direction} followMouse={true}>
      <span
        className={cx('wireframe-tooltip-icon', className, invertedColor && 'inverted')}
        tabIndex={0}
        aria-label={ariaLabel || (typeof contents === 'string' ? contents : undefined)}
        role="img"
        id={id}
      >
        {drawTooltipIcon({ symbol, size, tailLength, direction, invertedColor })}
      </span>
    </HoverDisplay>
  )
}

export default React.memo(TooltipIcon)
