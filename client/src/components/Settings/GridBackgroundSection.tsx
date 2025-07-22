/**
 * @file GridBackgroundSection.tsx
 * @description Grid background configuration section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeToggle, WireframeSelect, WireframeButton } from '../wireframe'

interface GridBackgroundSectionProps {
  gridSettings: {
    enabled: boolean
    glitchEnabled: boolean
    size: 'small' | 'medium' | 'large'
    highContrast: boolean
  }
  onToggleGrid: () => void
  onToggleGlitches: () => void
  onSetGridSize: (size: 'small' | 'medium' | 'large') => void
  onToggleHighContrast: () => void
  onResetToDefaults: () => void
}

/**
 * Grid background configuration controls
 */
export const GridBackgroundSection: React.FC<GridBackgroundSectionProps> = ({
  gridSettings,
  onToggleGrid,
  onToggleGlitches,
  onSetGridSize,
  onToggleHighContrast,
  onResetToDefaults,
}) => {
  return (
    <div className="grid-background-section">
      <h4 className="section-title">
        background settings
      </h4>

      <p className="section-description">
        configure the global grid background and subtle glitch effects.
      </p>

      <div className="settings-controls">
        <WireframeToggle
          checked={gridSettings.enabled}
          onChange={onToggleGrid}
          label="enable grid background"
          size="medium"
        />

        <WireframeToggle
          checked={gridSettings.glitchEnabled}
          onChange={onToggleGlitches}
          label="enable glitch effects"
          size="medium"
          disabled={!gridSettings.enabled}
        />

        <div className="select-control">
          <label className="select-label">
            grid size
          </label>
          <WireframeSelect
            options={[
              { value: 'small', label: 'small (20px)' },
              { value: 'medium', label: 'medium (40px)' },
              { value: 'large', label: 'large (60px)' },
            ]}
            value={gridSettings.size}
            onChange={(value) => onSetGridSize(value as 'small' | 'medium' | 'large')}
            disabled={!gridSettings.enabled}
            size="medium"
          />
        </div>

        <WireframeToggle
          checked={gridSettings.highContrast}
          onChange={onToggleHighContrast}
          label="high contrast mode"
          size="medium"
          disabled={!gridSettings.enabled}
        />

        <div className="section-actions">
          <WireframeButton onClick={onResetToDefaults}>reset to defaults</WireframeButton>
        </div>
      </div>
    </div>
  )
}