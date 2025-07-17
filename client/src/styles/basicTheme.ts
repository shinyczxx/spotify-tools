/**
 * @file basicTheme.ts
 * @description Basic theme configuration for MVP pages
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-14
 */

export const basicTheme = {
  colors: {
    primary: '#00FFFF', // Electric blue
    secondary: '#0088CC', // Darker blue
    background: '#000000', // Black
    surface: '#111111', // Dark gray
    text: '#FFFFFF', // White
    textSecondary: '#CCCCCC', // Light gray
    accent: '#00FFFF', // Electric blue
    error: '#FF4444', // Red
    success: '#44FF44', // Green
    warning: '#FFAA00', // Orange
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '24px',
      xxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 255, 255, 0.1)',
    md: '0 4px 6px rgba(0, 255, 255, 0.1)',
    lg: '0 10px 15px rgba(0, 255, 255, 0.2)',
  },
}

export type BasicTheme = typeof basicTheme
