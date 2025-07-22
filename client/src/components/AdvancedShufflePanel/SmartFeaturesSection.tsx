/**
 * @file SmartFeaturesSection.tsx
 * @description Smart features settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { CheckboxInput } from './CheckboxInput'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface SmartFeaturesSectionProps {
  settings: AdvancedShuffleSettings
  onSettingChange: (key: keyof AdvancedShuffleSettings, value: any) => void
  accentColor: string
}

/**
 * Smart features configuration section
 */
export const SmartFeaturesSection: React.FC<SmartFeaturesSectionProps> = ({
  settings,
  onSettingChange,
  accentColor,
}) => (
  <div className="settings-section">
    <div className="settings-section-title">Smart Features</div>
    <CheckboxInput
      label="Adaptive selection (learn from listening history)"
      checked={settings.adaptiveSelection}
      onChange={(checked) => onSettingChange('adaptiveSelection', checked)}
      accentColor={accentColor}
    />
    <CheckboxInput
      label="Seasonal adjustment"
      checked={settings.seasonalAdjustment}
      onChange={(checked) => onSettingChange('seasonalAdjustment', checked)}
      accentColor={accentColor}
    />
  </div>
)