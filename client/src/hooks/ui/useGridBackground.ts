/**
 * @file useGridBackground.ts
 * @description Hook for managing global grid background settings
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-15
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface GridSettings {
  enabled: boolean
  glitchEnabled: boolean
  size: 'small' | 'medium' | 'large'
  highContrast: boolean
}

const DEFAULT_GRID_SETTINGS: GridSettings = {
  enabled: true,
  glitchEnabled: true,
  size: 'medium',
  highContrast: false,
}

export const useGridBackground = () => {
  const [gridSettings, setGridSettings] = useState<GridSettings>(DEFAULT_GRID_SETTINGS)
  const glitchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('album-shuffle-grid-settings')
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setGridSettings({ ...DEFAULT_GRID_SETTINGS, ...parsedSettings })
      }
    } catch (error) {
      console.warn('Failed to load grid settings:', error)
    }
  }, [])

  // Apply grid settings to CSS variables and body classes
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // Update CSS variables
    root.style.setProperty('--grid-enabled', gridSettings.enabled ? '1' : '0')
    root.style.setProperty('--grid-glitch-enabled', gridSettings.glitchEnabled ? '1' : '0')

    // Update body classes
    body.classList.toggle('grid-enabled', gridSettings.enabled)
    body.classList.toggle('grid-disabled', !gridSettings.enabled)
    body.classList.toggle('grid-glitch-enabled', gridSettings.glitchEnabled)
    body.classList.toggle('grid-glitch-disabled', !gridSettings.glitchEnabled)
    body.classList.toggle('grid-high-contrast', gridSettings.highContrast)

    // Remove existing size classes and add current one
    body.classList.remove('grid-small', 'grid-medium', 'grid-large')
    body.classList.add(`grid-${gridSettings.size}`)

    // Save to localStorage
    try {
      localStorage.setItem('album-shuffle-grid-settings', JSON.stringify(gridSettings))
    } catch (error) {
      console.warn('Failed to save grid settings:', error)
    }
  }, [gridSettings])

  // Trigger glitch animation
  const triggerGlitch = useCallback(() => {
    const glitchOverlay = document.querySelector('.grid-glitch-overlay')
    if (glitchOverlay && gridSettings.glitchEnabled) {
      glitchOverlay.classList.add('glitch-active')
      // Remove the class after animation completes (8s)
      setTimeout(() => {
        glitchOverlay.classList.remove('glitch-active')
      }, 8000)
    }
  }, [gridSettings.glitchEnabled])

  // Set up random glitch intervals (30-60 seconds)
  useEffect(() => {
    if (gridSettings.glitchEnabled) {
      const scheduleNextGlitch = () => {
        // Random interval between 30-60 seconds
        const interval = Math.random() * 30000 + 30000 // 30-60 seconds in ms
        glitchTimeoutRef.current = setTimeout(() => {
          triggerGlitch()
          scheduleNextGlitch() // Schedule the next one
        }, interval)
      }

      // Start the first glitch after 10-20 seconds
      const initialDelay = Math.random() * 10000 + 10000
      glitchTimeoutRef.current = setTimeout(() => {
        triggerGlitch()
        scheduleNextGlitch()
      }, initialDelay)
    } else {
      // Clear timeouts if glitch is disabled
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current)
        glitchTimeoutRef.current = null
      }
    }

    return () => {
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current)
      }
    }
  }, [gridSettings.glitchEnabled, triggerGlitch])

  const updateGridSettings = (updates: Partial<GridSettings>) => {
    setGridSettings((prev) => ({ ...prev, ...updates }))
  }

  const toggleGrid = () => {
    updateGridSettings({ enabled: !gridSettings.enabled })
  }

  const toggleGlitches = () => {
    updateGridSettings({ glitchEnabled: !gridSettings.glitchEnabled })
  }

  const setGridSize = (size: GridSettings['size']) => {
    updateGridSettings({ size })
  }

  const toggleHighContrast = () => {
    updateGridSettings({ highContrast: !gridSettings.highContrast })
  }

  const resetToDefaults = () => {
    setGridSettings(DEFAULT_GRID_SETTINGS)
  }

  return {
    gridSettings,
    updateGridSettings,
    toggleGrid,
    toggleGlitches,
    setGridSize,
    toggleHighContrast,
    resetToDefaults,
  }
}

export default useGridBackground
