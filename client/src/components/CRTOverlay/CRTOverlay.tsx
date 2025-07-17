/**
 * @file CRTOverlay.tsx
 * @description CRT monitor effect overlay component with toggleable scan lines and flicker
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-16
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with customizable CRT effects
 */

import React from 'react'
import '@styles/crtEffect.css'

interface CRTOverlayProps {
  enabled?: boolean
  intensity?: 'low' | 'medium' | 'high'
  scanlineSize?: 'fine' | 'normal' | 'thick'
  flickerEnabled?: boolean
  movingScanline?: boolean
  className?: string
}

export const CRTOverlay: React.FC<CRTOverlayProps> = ({
  enabled = false,
  intensity = 'medium',
  scanlineSize = 'normal',
  flickerEnabled = true,
  movingScanline = true,
  className = '',
}) => {
  if (!enabled) return null

  const overlayClasses = [
    'crt-overlay',
    'crt-enabled',
    `crt-intensity-${intensity}`,
    `crt-scanlines-${scanlineSize}`,
    flickerEnabled ? 'crt-flicker-enabled' : 'crt-flicker-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={overlayClasses}>
      {movingScanline && <div className="crt-scanline" />}
    </div>
  )
}

export default CRTOverlay