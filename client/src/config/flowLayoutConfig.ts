/**
 * @file flowLayoutConfig.ts
 * @description Grid configuration and theme color logic for ControlledFlowLayout
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - Version 1.0.0: Initial extraction from ControlledFlowLayout.tsx
 */

export const GRID_CONFIG = {
  columns: 12,
  rows: 8,
  gap: 16,
  padding: 32,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
}

export const getGlobalThemeColor = (): string => {
  if (typeof window !== 'undefined') {
    const rootStyles = getComputedStyle(document.documentElement)
    return (
      rootStyles.getPropertyValue('--circuit-color')?.trim() ||
      rootStyles.getPropertyValue('--terminal-cyan')?.trim() ||
      '#00FFFF'
    )
  }
  return '#00FFFF'
}
