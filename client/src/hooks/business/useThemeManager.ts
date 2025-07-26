/**
 * @file useThemeManager.ts
 * @description Hook for managing application themes
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-24
 */

import { useState, useEffect, useCallback } from 'react'

export interface Theme {
  name: string
  description: string
  colors: Record<string, string>
  effects: Record<string, string>
}

export interface ThemeManagerState {
  currentTheme: string
  availableThemes: Theme[]
  loading: boolean
  error: string | null
}

/**
 * Hook for managing application themes
 */
export const useThemeManager = () => {
  const [state, setState] = useState<ThemeManagerState>({
    currentTheme: 'terminal',
    availableThemes: [],
    loading: false,
    error: null,
  })

  // Load available themes
  const loadThemes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // Import theme files
      const terminalTheme = await import('@themes/terminal.json')
      const spotifyTheme = await import('@themes/spotify.json')
      
      const themes: Theme[] = [
        terminalTheme.default,
        spotifyTheme.default,
      ]
      
      setState(prev => ({
        ...prev,
        availableThemes: themes,
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to load themes:', error)
      setState(prev => ({
        ...prev,
        error: 'Failed to load themes',
        loading: false,
      }))
    }
  }, [])

  // Apply theme to document
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement
    
    // Apply color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    // Apply effect variables
    Object.entries(theme.effects).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
    
    console.log(`Applied theme: ${theme.name}`)
  }, [])

  // Change theme
  const changeTheme = useCallback((themeName: string) => {
    const theme = state.availableThemes.find(t => t.name.toLowerCase() === themeName.toLowerCase())
    if (!theme) {
      setState(prev => ({ ...prev, error: `Theme "${themeName}" not found` }))
      return
    }
    
    setState(prev => ({ ...prev, currentTheme: themeName.toLowerCase(), error: null }))
    applyTheme(theme)
    
    // Save to localStorage
    localStorage.setItem('selected_theme', themeName.toLowerCase())
  }, [state.availableThemes, applyTheme])

  // Load saved theme on mount
  useEffect(() => {
    loadThemes()
  }, [loadThemes])

  // Apply saved theme when themes are loaded
  useEffect(() => {
    if (state.availableThemes.length > 0) {
      const savedTheme = localStorage.getItem('selected_theme') || 'terminal'
      const theme = state.availableThemes.find(t => t.name.toLowerCase() === savedTheme)
      
      if (theme) {
        setState(prev => ({ ...prev, currentTheme: savedTheme }))
        applyTheme(theme)
      }
    }
  }, [state.availableThemes, applyTheme])

  // Get current theme object
  const getCurrentTheme = useCallback(() => {
    return state.availableThemes.find(t => t.name.toLowerCase() === state.currentTheme)
  }, [state.availableThemes, state.currentTheme])

  return {
    currentTheme: state.currentTheme,
    availableThemes: state.availableThemes,
    loading: state.loading,
    error: state.error,
    changeTheme,
    getCurrentTheme,
    loadThemes,
  }
}