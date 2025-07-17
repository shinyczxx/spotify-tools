/**
 * @file flowLayoutUtils.ts
 * @description Utility functions for ControlledFlowLayout and related modules
 * @author GitHub Copilot
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - Version 1.0.0: Initial extraction from ControlledFlowLayout.tsx
 */

import { PanelPixels } from 'pcb-design-lib'

// Utility to calculate solder point absolute positions for a panel edge
export function getSolderPointAbsolute(
  panel: PanelPixels,
  side: 'top' | 'right' | 'bottom' | 'left',
  idx: number,
  total: number,
  minDist = 40,
) {
  const PANEL_WIDTH = panel.width
  const PANEL_HEIGHT = panel.height
  let x = 0,
    y = 0
  if (side === 'top' || side === 'bottom') {
    const avail = PANEL_WIDTH - 2 * minDist
    x = panel.x + minDist + (total === 1 ? avail / 2 : (avail * idx) / (total - 1))
    y = side === 'top' ? panel.y : panel.y + PANEL_HEIGHT
  } else if (side === 'left' || side === 'right') {
    const avail = PANEL_HEIGHT - 2 * minDist
    y = panel.y + minDist + (total === 1 ? avail / 2 : (avail * idx) / (total - 1))
    x = side === 'left' ? panel.x : panel.x + PANEL_WIDTH
  }
  x = Math.max(panel.x, Math.min(panel.x + PANEL_WIDTH, x))
  y = Math.max(panel.y, Math.min(panel.y + PANEL_HEIGHT, y))
  return { x, y }
}

// Create cache key for path calculations
export function createPathCacheKey(
  layoutData: PanelPixels[],
  connections: any[],
  containerSize: { width: number; height: number },
): string {
  const layoutStr = layoutData.map((p) => `${p.x},${p.y},${p.width},${p.height}`).join('|')
  const connectionsStr = connections
    .map((c) => `${c.start.x},${c.start.y}->${c.end.x},${c.end.y}`)
    .join('|')
  return `${layoutStr}::${connectionsStr}::${containerSize.width}x${containerSize.height}`
}
