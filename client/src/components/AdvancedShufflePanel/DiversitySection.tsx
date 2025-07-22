/**
 * @file DiversitySection.tsx
 * @description Diversity settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { SliderInput } from './SliderInput'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface DiversitySectionProps {
  settings: AdvancedShuffleSettings
  onSettingChange: (key: keyof AdvancedShuffleSettings, value: any) => void
  accentColor: string
}

/**
 * Diversity configuration section
 */
export const DiversitySection: React.FC<DiversitySectionProps> = ({
  settings,
  onSettingChange,
  accentColor,
}) => (
  <div className="settings-section">
    <div className="settings-section-title">Diversity</div>
    <SliderInput
      label="Artist Diversification"
      value={settings.artistDiversification}
      onChange={(value) => onSettingChange('artistDiversification', value)}
      accentColor={accentColor}
    />
    <div className="max-albums-container">
      <label className="max-albums-label">
        Max albums per artist: {settings.maxAlbumsPerArtist}
      </label>
      <input
        type="range"
        min={1}
        max={5}
        value={settings.maxAlbumsPerArtist}
        onChange={(e) => onSettingChange('maxAlbumsPerArtist', parseInt(e.target.value))}
        className="max-albums-slider"
        style={{
          accentColor,
        }}
      />
    </div>
  </div>
)