/**
 * @file useCRTEffect.ts
 * @description Hook for managing CRT overlay effect settings
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-16
 */

import { useState, useEffect, useCallback } from 'react'

export interface CRTSettings {
  enabled: boolean
  intensity: 'low' | 'medium' | 'high'
  scanlineSize: 'fine' | 'normal' | 'thick'
  flickerEnabled: boolean
  movingScanline: boolean
}

const DEFAULT_CRT_SETTINGS: CRTSettings = {
  enabled: false,
  intensity: 'medium',
  scanlineSize: 'normal',
  flickerEnabled: true,
  movingScanline: true,
}

const CRT_STORAGE_KEY = 'crt-effect-settings'

export const useCRTEffect = () => {
  const [crtSettings, setCrtSettings] = useState<CRTSettings>(() => {
    try {
      const stored = localStorage.getItem(CRT_STORAGE_KEY)
      return stored ? { ...DEFAULT_CRT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_CRT_SETTINGS
    } catch (error) {
      console.warn('Error loading CRT settings:', error)
      return DEFAULT_CRT_SETTINGS
    }
  })

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(CRT_STORAGE_KEY, JSON.stringify(crtSettings))
    } catch (error) {
      console.warn('Error saving CRT settings:', error)
    }
  }, [crtSettings])

  // Apply CRT classes to body element
  useEffect(() => {
    const body = document.body
    
    // Remove all CRT classes
    body.classList.remove(
      'crt-enabled',
      'crt-disabled',
      'crt-intensity-low',
      'crt-intensity-medium',
      'crt-intensity-high',
      'crt-scanlines-fine',
      'crt-scanlines-normal',
      'crt-scanlines-thick',
      'crt-flicker-enabled',
      'crt-flicker-disabled'
    )
    
    // Add current classes
    if (crtSettings.enabled) {
      body.classList.add('crt-enabled')
      body.classList.add(`crt-intensity-${crtSettings.intensity}`)
      body.classList.add(`crt-scanlines-${crtSettings.scanlineSize}`)
      body.classList.add(crtSettings.flickerEnabled ? 'crt-flicker-enabled' : 'crt-flicker-disabled')
    } else {
      body.classList.add('crt-disabled')
    }
  }, [crtSettings])

  const toggleCRT = useCallback(() => {
    setCrtSettings(prev => ({ ...prev, enabled: !prev.enabled }))
  }, [])

  const setIntensity = useCallback((intensity: CRTSettings['intensity']) => {
    setCrtSettings(prev => ({ ...prev, intensity }))
  }, [])

  const setScanlineSize = useCallback((scanlineSize: CRTSettings['scanlineSize']) => {
    setCrtSettings(prev => ({ ...prev, scanlineSize }))
  }, [])

  const toggleFlicker = useCallback(() => {
    setCrtSettings(prev => ({ ...prev, flickerEnabled: !prev.flickerEnabled }))
  }, [])

  const toggleMovingScanline = useCallback(() => {
    setCrtSettings(prev => ({ ...prev, movingScanline: !prev.movingScanline }))
  }, [])

  const resetCRTSettings = useCallback(() => {
    setCrtSettings(DEFAULT_CRT_SETTINGS)
  }, [])

  return {
    crtSettings,
    toggleCRT,
    setIntensity,
    setScanlineSize,
    toggleFlicker,
    toggleMovingScanline,
    resetCRTSettings,
  }
}