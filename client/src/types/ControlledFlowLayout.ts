/**
 * @file ControlledFlowLayout.ts
 * @description TypeScript types and interfaces for ControlledFlowLayout and related modules
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-14
 *
 * @ChangeLog
 * - Version 1.0.0: Initial extraction from ControlledFlowLayout.tsx
 */

// Grid-based positioning (12x8 grid)
export interface ControlledPosition {
  gridX: number // 1-12
  gridY: number // 1-8
  gridWidth: number // cells wide
  gridHeight: number // cells tall
  mobile?: {
    gridX: number
    gridY: number
    gridWidth: number
    gridHeight: number
  }
  tablet?: {
    gridX: number
    gridY: number
    gridWidth: number
    gridHeight: number
  }
}

export interface ControlledFlowLayoutProps {
  panels: Array<any> // Use actual type from CircuitBoardPanelType if available
  onPanelClick?: (panelId: string) => void
  className?: string
  style?: React.CSSProperties
  enablePathCaching?: boolean
  pathRecalculationTriggers?: ('resize' | 'panel-change' | 'connection-change')[]
}
