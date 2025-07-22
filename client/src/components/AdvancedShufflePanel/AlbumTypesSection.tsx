/**
 * @file AlbumTypesSection.tsx
 * @description Album type preferences settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { SliderInput } from './SliderInput'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface AlbumTypesSectionProps {
  settings: AdvancedShuffleSettings
  onNestedSettingChange: (parentKey: keyof AdvancedShuffleSettings, childKey: string, value: any) => void
  accentColor: string
}

/**
 * Album type preferences configuration section
 */
export const AlbumTypesSection: React.FC<AlbumTypesSectionProps> = ({
  settings,
  onNestedSettingChange,
  accentColor,
}) => (
  <div className="settings-section">
    <div className="settings-section-title">Album Types</div>
    <SliderInput
      label="Albums"
      value={settings.albumTypeWeights.album}
      onChange={(value) => onNestedSettingChange('albumTypeWeights', 'album', value)}
      accentColor={accentColor}
    />
    <SliderInput
      label="Singles"
      value={settings.albumTypeWeights.single}
      onChange={(value) => onNestedSettingChange('albumTypeWeights', 'single', value)}
      accentColor={accentColor}
    />
    <SliderInput
      label="Compilations"
      value={settings.albumTypeWeights.compilation}
      onChange={(value) => onNestedSettingChange('albumTypeWeights', 'compilation', value)}
      accentColor={accentColor}
    />
  </div>
)