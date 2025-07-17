/**
 * @file SimpleModeToggle.tsx
 * @description Toggle component for enabling/disabling animations and switching to simple mode.
 * Part of the accessibility panel with circuit board integration.
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-09
 */

import React, { useState, useEffect } from 'react'
import { AnimationManager } from '@config/animations'
import './SimpleModeToggle.css'

interface SimpleModeToggleProps {
  className?: string
  variant?: 'default' | 'panel' | 'header'
}

const SimpleModeToggle: React.FC<SimpleModeToggleProps> = ({
  className = '',
  variant = 'panel',
}) => {
  const [performanceMode, setPerformanceMode] = useState<'full' | 'simple' | 'none'>('full')

  const animationManager = AnimationManager.getInstance()

  useEffect(() => {
    // Initialize from current state
    setPerformanceMode(animationManager.getPerformanceMode())

    // Listen for performance mode changes from resource monitor
    const handlePerformanceModeChange = (event: CustomEvent) => {
      const mode = event.detail.mode
      setPerformanceMode(mode)
    }

    window.addEventListener(
      'performance-mode-changed',
      handlePerformanceModeChange as EventListener,
    )

    return () => {
      window.removeEventListener(
        'performance-mode-changed',
        handlePerformanceModeChange as EventListener,
      )
    }
  }, [animationManager])

  const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = event.target.value as 'full' | 'simple' | 'none'
    setPerformanceMode(newMode)
    animationManager.setPerformanceMode(newMode)

    // Persist preference
    try {
      localStorage.setItem('spotify-app-performance-mode', newMode)
    } catch (error) {
      console.warn('Failed to save performance mode preference:', error)
    }

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent('performance-mode-change', {
        detail: { mode: newMode },
      }),
    )
  }

  // Load preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spotify-app-performance-mode')
      if (saved && ['full', 'simple', 'none'].includes(saved)) {
        const savedMode = saved as 'full' | 'simple' | 'none'
        setPerformanceMode(savedMode)
        animationManager.setPerformanceMode(savedMode)
      }
    } catch (error) {
      console.warn('Failed to load performance mode preference:', error)
    }
  }, [animationManager])

  return (
    <div
      className={`simple-mode-toggle wireframe-box ${
        variant === 'panel' ? 'wireframe-panel' : ''
      } ${className}`}
    >
      <div className="wireframe-panel-title">animation settings</div>

      <div className="simple-mode-content">
        <div className="toggle-row">
          <label htmlFor="performance-mode-select" className="toggle-label">
            animation mode
          </label>

          <select
            id="performance-mode-select"
            value={performanceMode}
            onChange={handleModeChange}
            className="performance-mode-select wireframe-input"
          >
            <option value="full">full animations</option>
            <option value="simple">simple animations</option>
            <option value="none">no animations</option>
          </select>
        </div>

        <div className="performance-indicator">
          <span className="indicator-label">current mode:</span>
          <span className={`indicator-value mode-${performanceMode}`}>{performanceMode}</span>
        </div>

        <div className="mode-descriptions">
          <div className="mode-description">
            <strong>full:</strong> all animations and visual effects enabled
          </div>
          <div className="mode-description">
            <strong>simple:</strong> reduced animations for better performance
          </div>
          <div className="mode-description">
            <strong>none:</strong> no animations, best for accessibility and low-end devices
          </div>
        </div>

        <div className="auto-switch-info">
          <p>mode may automatically switch based on device performance</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleModeToggle
