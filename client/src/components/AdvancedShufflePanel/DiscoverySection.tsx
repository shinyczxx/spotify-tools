/**
 * @file DiscoverySection.tsx
 * @description Discovery preferences settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { CheckboxInput } from './CheckboxInput'
import { SliderInput } from './SliderInput'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface DiscoverySectionProps {
  settings: AdvancedShuffleSettings
  onSettingChange: (key: keyof AdvancedShuffleSettings, value: any) => void
  accentColor: string
}

/**
 * Discovery preferences configuration section
 */
export const DiscoverySection: React.FC<DiscoverySectionProps> = ({
  settings,
  onSettingChange,
  accentColor,
}) => (
  <div className="settings-section">
    <div className="settings-section-title">Discovery Preferences</div>
    <SliderInput
      label="Release Date Weight (0=older, 100=newer)"
      value={settings.releaseDateWeight}
      onChange={(value) => onSettingChange('releaseDateWeight', value)}
      accentColor={accentColor}
    />
    <SliderInput
      label="Popularity Weight"
      value={settings.popularityWeight}
      onChange={(value) => onSettingChange('popularityWeight', value)}
      accentColor={accentColor}
    />
    <CheckboxInput
      label="Prefer obscure albums"
      checked={settings.preferObscure}
      onChange={(checked) => onSettingChange('preferObscure', checked)}
      accentColor={accentColor}
    />
  </div>
)