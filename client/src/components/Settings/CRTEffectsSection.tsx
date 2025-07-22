/**
 * @file CRTEffectsSection.tsx
 * @description CRT effects configuration section for Settings page
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { WireframeToggle, WireframeSelect, WireframeButton } from '../wireframe'

interface CRTEffectsSectionProps {
  crtSettings: {
    enabled: boolean
    intensity: 'low' | 'medium' | 'high'
    scanlineSize: 'fine' | 'normal' | 'thick'
    flickerEnabled: boolean
    movingScanline: boolean
  }
  onToggleCRT: () => void
  onSetIntensity: (intensity: 'low' | 'medium' | 'high') => void
  onSetScanlineSize: (size: 'fine' | 'normal' | 'thick') => void
  onToggleFlicker: () => void
  onToggleMovingScanline: () => void
  onResetCRTSettings: () => void
}

/**
 * CRT effects configuration controls
 */
export const CRTEffectsSection: React.FC<CRTEffectsSectionProps> = ({
  crtSettings,
  onToggleCRT,
  onSetIntensity,
  onSetScanlineSize,
  onToggleFlicker,
  onToggleMovingScanline,
  onResetCRTSettings,
}) => {
  return (
    <div className="crt-effects-section">
      <h4 className="section-title">
        retro monitor effects
      </h4>

      <p className="section-description">
        add authentic crt monitor scan lines, flicker, and color separation effects.
      </p>

      <div className="settings-controls">
        <WireframeToggle
          checked={crtSettings.enabled}
          onChange={onToggleCRT}
          label="enable crt effects"
          size="medium"
        />

        <div className={`select-control ${!crtSettings.enabled ? 'disabled' : ''}`}>
          <label className="select-label">
            effect intensity
          </label>
          <WireframeSelect
            options={[
              { value: 'low', label: 'low (30%)' },
              { value: 'medium', label: 'medium (60%)' },
              { value: 'high', label: 'high (100%)' },
            ]}
            value={crtSettings.intensity}
            onChange={(value) => onSetIntensity(value as 'low' | 'medium' | 'high')}
            disabled={!crtSettings.enabled}
            size="medium"
          />
        </div>

        <div className={`select-control ${!crtSettings.enabled ? 'disabled' : ''}`}>
          <label className="select-label">
            scanline thickness
          </label>
          <WireframeSelect
            options={[
              { value: 'fine', label: 'fine (1px)' },
              { value: 'normal', label: 'normal (2px)' },
              { value: 'thick', label: 'thick (4px)' },
            ]}
            value={crtSettings.scanlineSize}
            onChange={(value) => onSetScanlineSize(value as 'fine' | 'normal' | 'thick')}
            disabled={!crtSettings.enabled}
            size="medium"
          />
        </div>

        <WireframeToggle
          checked={crtSettings.flickerEnabled}
          onChange={onToggleFlicker}
          label="screen flicker"
          size="medium"
          disabled={!crtSettings.enabled}
        />

        <WireframeToggle
          checked={crtSettings.movingScanline}
          onChange={onToggleMovingScanline}
          label="moving scanline"
          size="medium"
          disabled={!crtSettings.enabled}
        />

        <div className="section-actions">
          <WireframeButton onClick={onResetCRTSettings}>reset crt defaults</WireframeButton>
        </div>
      </div>
    </div>
  )
}