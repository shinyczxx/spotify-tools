/**
 * @file PageLayout.tsx
 * @description Page layout component that provides consistent
 * structure, navigation, and wireframe styling for all app pages.
 * Integrates Navbar, Now Playing, and main content area. Now supports single and two-column responsive layouts without FlexGrid. Allows per-page min/max widths for columns in two-column mode.
 * @author Caleb Price
 * @version 2.2.0
 * @date 2025-07-08
 */

import React, { ReactNode, CSSProperties } from 'react'
import { WireframePanel } from '../wireframe'
import Navbar from '../Navbar/Navbar'
import './PageLayout.css'

interface PageLayoutProps {
  title: string
  children: ReactNode
  // Navbar props
  currentPage: string
  onNavigate: (pageId: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  onLogout: () => void
  /**
   * Layout mode: 'single' (default) or 'two-column'.
   * 'two-column' enables a responsive two-column grid for main content.
   */
  layoutMode?: 'single' | 'two-column'
  /**
   * Optional per-page min/max widths for two-column layout.
   * Example: { left: { min: 280, max: 420 }, right: { min: 400, max: 1200 } }
   */
  columnWidths?: {
    left?: { min?: number; max?: number }
    right?: { min?: number; max?: number }
  }
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  currentPage,
  onNavigate,
  fontSize,
  onFontSizeChange,
  onLogout,
  layoutMode = 'single',
  columnWidths,
}) => {
  // Compute grid style for two-column mode
  let leftStyle: CSSProperties = {}
  let rightStyle: CSSProperties = {}
  if (layoutMode === 'two-column' && columnWidths) {
    if (columnWidths.left) {
      if (columnWidths.left.min) leftStyle.minWidth = columnWidths.left.min
      if (columnWidths.left.max) leftStyle.maxWidth = columnWidths.left.max
    }
    if (columnWidths.right) {
      if (columnWidths.right.min) rightStyle.minWidth = columnWidths.right.min
      if (columnWidths.right.max) rightStyle.maxWidth = columnWidths.right.max
    }
  }

  return (
    <div className="page-container">
      <div className="navbar-sidebar">
        <Navbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          onLogout={onLogout}
        />
      </div>
      <div
        className={`page-main-content${layoutMode === 'two-column' ? ' two-column' : ''}`}
        style={{ flex: 1, minWidth: 0 }}
      >
        {layoutMode === 'single' ? (
          <>
            <WireframePanel variant="header" className="dashboard-header compact-header">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: '1em',
                }}
              >
                <h1 style={{ margin: '0.5em 0', fontSize: '1.8em' }}>{title}</h1>
              </div>
            </WireframePanel>
            {children}
          </>
        ) : (
          // In two-column mode, expect children to be [left, right] columns
          React.Children.map(children, (child, idx) => {
            if (idx === 0)
              return (
                <div className="page-col-left" style={leftStyle}>
                  {child}
                </div>
              )
            if (idx === 1)
              return (
                <div className="page-col-right" style={rightStyle}>
                  {child}
                </div>
              )
            return child
          })
        )}
      </div>
    </div>
  )
}

export default PageLayout
