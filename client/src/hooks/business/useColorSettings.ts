/**
 * @file useColorSettings.ts
 * @description Custom hook for managing color settings and CSS variables
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useCallback } from 'react'

export interface ColorSettings {
  '--grid-color': string
  '--terminal-cyan': string
  '--terminal-cyan-bright': string
  '--terminal-cyan-dim': string
  '--terminal-cyan-dark': string
  '--terminal-bg': string
  '--terminal-dark': string
  '--terminal-medium': string
  '--terminal-gray-dim': string
  '--text-cyan': string
  '--terminal-error': string
  '--terminal-error-border': string
  '--terminal-error-bg': string
  '--terminal-orange': string
  '--terminal-green': string
  '--terminal-red': string
  '--terminal-red-bright': string
  '--terminal-red-dim': string
}

const defaultColorSettings: ColorSettings = {
  '--grid-color': '#e0e0e0',
  '--terminal-cyan': '#00ffff',
  '--terminal-cyan-bright': '#66ffff',
  '--terminal-cyan-dim': '#009999',
  '--terminal-cyan-dark': '#006666',
  '--terminal-bg': '#000000',
  '--terminal-dark': '#001122',
  '--terminal-medium': '#002244',
  '--terminal-gray-dim': '#333333',
  '--text-cyan': '#00ffff',
  '--terminal-error': '#ff4444',
  '--terminal-error-border': '#ff6666',
  '--terminal-error-bg': '#220000',
  '--terminal-orange': '#ff8800',
  '--terminal-green': '#00ff00',
  '--terminal-red': '#ff0000',
  '--terminal-red-bright': '#ff6666',
  '--terminal-red-dim': '#cc0000',
}

/**
 * Custom hook for managing color settings and CSS variables
 */
export const useColorSettings = () => {
  const [colorSettings, setColorSettings] = useState<ColorSettings>(defaultColorSettings)

  const handleColorChange = useCallback((variable: string, color: string) => {
    setColorSettings((prev) => ({ ...prev, [variable]: color }))
    // Apply the change immediately to the document
    document.documentElement.style.setProperty(variable, color)
  }, [])

  const importColorSettings = useCallback((importedSettings: Partial<ColorSettings>) => {
    const newColorSettings = { ...colorSettings }

    // Only import valid color values
    Object.entries(importedSettings).forEach(([key, value]) => {
      if (typeof value === 'string' && /^#[0-9A-Fa-f]{6}$/.test(value)) {
        if (key in colorSettings) {
          (newColorSettings as any)[key] = value
        }
      }
    })

    // Apply the imported colors
    setColorSettings(newColorSettings)
    Object.entries(newColorSettings).forEach(([variable, color]) => {
      document.documentElement.style.setProperty(variable, color)
    })

    return newColorSettings
  }, [colorSettings])

  const resetToDefaults = useCallback(() => {
    setColorSettings(defaultColorSettings)
    Object.entries(defaultColorSettings).forEach(([variable, color]) => {
      document.documentElement.style.setProperty(variable, color)
    })
  }, [])

  return {
    colorSettings,
    handleColorChange,
    importColorSettings,
    resetToDefaults,
  }
}