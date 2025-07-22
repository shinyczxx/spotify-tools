/**
 * @file LastFmSection.tsx
 * @description Last.fm integration settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { CheckboxInput } from './CheckboxInput'
import { SliderInput } from './SliderInput'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface LastFmSectionProps {
  settings: AdvancedShuffleSettings
  onSettingChange: (key: keyof AdvancedShuffleSettings, value: any) => void
  isLastFmAuthenticated: boolean
  accentColor: string
}

/**
 * Last.fm integration configuration section
 */
export const LastFmSection: React.FC<LastFmSectionProps> = ({
  settings,
  onSettingChange,
  isLastFmAuthenticated,
  accentColor,
}) => (
  <div className="settings-section">
    <div className="settings-section-title">Last.fm Integration</div>
    <CheckboxInput
      label="Use Last.fm data for enhanced recommendations"
      checked={settings.useLastFmData}
      onChange={(checked) => onSettingChange('useLastFmData', checked)}
      disabled={!isLastFmAuthenticated}
      accentColor={accentColor}
    />
    {!isLastFmAuthenticated && (
      <p className="settings-warning">
        Sign in to Last.fm in Settings to enable this feature
      </p>
    )}
    <SliderInput
      label="Last.fm Tags Weight"
      value={settings.lastFmTagsWeight}
      onChange={(value) => onSettingChange('lastFmTagsWeight', value)}
      disabled={!isLastFmAuthenticated || !settings.useLastFmData}
      accentColor={accentColor}
    />
    <SliderInput
      label="Similar Albums Weight"
      value={settings.lastFmSimilarAlbumsWeight}
      onChange={(value) => onSettingChange('lastFmSimilarAlbumsWeight', value)}
      disabled={!isLastFmAuthenticated || !settings.useLastFmData}
      accentColor={accentColor}
    />
  </div>
)