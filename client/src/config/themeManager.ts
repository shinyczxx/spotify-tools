/**
 * @file themeManager.ts
 * @description Theme management system for dynamic color scheme switching
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-09
 *
 * @UsedBy
 * - Settings page
 * - App.tsx
 * - All themed components
 *
 * @ChangeLog
 * - 1.0.0: Initial implementation with czxx-terminal, spotify, and discord themes
 */

import themesConfig from './themes.json'

export type ThemeId = 'czxx-terminal' | 'spotify' | 'discord'

export interface Theme {
  name: string
  description: string
  colors: {
    primary: string
    primaryBright: string
    primaryDim: string
    primaryDark: string
    background: string
    backgroundDark: string
    backgroundMedium: string
    backgroundLight: string
    text: string
    textDim: string
    textMuted: string
    success: string
    warning: string
    error: string
    accent: string
  }
  effects: {
    glow: string
    glowBright: string
    glowIntense: string
    textShadow: string
    boxShadow: string
  }
  typography: {
    fontFamily: string
    fontSize: string
    lineHeight: string
    letterSpacing: string
    textTransform: string
  }
  crt: {
    enabled: boolean
    scanlineOpacity: number
    glowIntensity: number
    curvature: number
    flicker: boolean
  }
}

export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: ThemeId = 'czxx-terminal'
  private themes: Record<ThemeId, Theme>

  constructor() {
    this.themes = themesConfig.themes as Record<ThemeId, Theme>
    this.loadSavedTheme()
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  private loadSavedTheme() {
    try {
      const saved = localStorage.getItem('spotify-app-theme')
      if (saved && this.isValidThemeId(saved)) {
        this.currentTheme = saved as ThemeId
      }
    } catch (error) {
      console.warn('Failed to load saved theme:', error)
    }
  }

  private isValidThemeId(id: string): boolean {
    return Object.keys(this.themes).includes(id)
  }

  getCurrentTheme(): ThemeId {
    return this.currentTheme
  }

  getTheme(themeId: ThemeId): Theme {
    return this.themes[themeId]
  }

  getAllThemes(): Record<ThemeId, Theme> {
    return this.themes
  }

  setTheme(themeId: ThemeId) {
    if (!this.isValidThemeId(themeId)) {
      console.warn(`Invalid theme ID: ${themeId}`)
      return
    }

    this.currentTheme = themeId
    this.applyTheme(themeId)
    this.saveTheme(themeId)

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent('theme-changed', {
        detail: { themeId, theme: this.themes[themeId] },
      }),
    )
  }

  private applyTheme(themeId: ThemeId) {
    const theme = this.themes[themeId]
    const root = document.documentElement

    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVar}`, value)

      // Keep legacy terminal-specific variable names for compatibility
      if (key === 'primary') {
        root.style.setProperty('--terminal-cyan', value)
        root.style.setProperty('--text-cyan', value)
      }
      if (key === 'primaryBright') {
        root.style.setProperty('--terminal-cyan-bright', value)
      }
      if (key === 'primaryDim') {
        root.style.setProperty('--terminal-cyan-dim', value)
      }
      if (key === 'primaryDark') {
        root.style.setProperty('--terminal-cyan-dark', value)
      }
      if (key === 'background') {
        root.style.setProperty('--terminal-bg', value)
      }
      if (key === 'backgroundDark') {
        root.style.setProperty('--terminal-dark', value)
      }
      if (key === 'backgroundMedium') {
        root.style.setProperty('--terminal-medium', value)
      }
      if (key === 'textDim') {
        root.style.setProperty('--text-dim', value)
      }
    })

    // Apply effect variables
    Object.entries(theme.effects).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVar}`, value)

      // Legacy glow variables
      if (key === 'glow') {
        root.style.setProperty('--glow-cyan', value)
      }
      if (key === 'glowBright') {
        root.style.setProperty('--glow-cyan-bright', value)
      }
    })

    // Apply typography variables
    Object.entries(theme.typography).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--${cssVar}`, value)

      // Legacy font variables
      if (key === 'fontFamily') {
        root.style.setProperty('--terminal-font', value)
      }
      if (key === 'fontSize') {
        root.style.setProperty('--terminal-font-size', value)
      }
    })

    // Apply CRT settings
    Object.entries(theme.crt).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--crt-${cssVar}`, value.toString())
    })

    // Set theme class on body
    document.body.classList.remove('theme-czxx-terminal', 'theme-spotify', 'theme-discord')
    document.body.classList.add(`theme-${themeId}`)

    // Apply CRT effect visibility
    document.body.classList.toggle('crt-enabled', theme.crt.enabled)
  }

  private saveTheme(themeId: ThemeId) {
    try {
      localStorage.setItem('spotify-app-theme', themeId)
    } catch (error) {
      console.warn('Failed to save theme:', error)
    }
  }

  initializeTheme() {
    this.applyTheme(this.currentTheme)
  }

  // Utility method to get color brightness for glow effects
  getColorBrightness(color: string): number {
    // Convert hex to RGB and calculate brightness
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate relative luminance
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
  }

  // Get computed CSS variable value
  getCSSVariable(variable: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  }
}

export default ThemeManager
