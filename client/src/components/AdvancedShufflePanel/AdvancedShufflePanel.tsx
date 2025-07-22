/**
 * @file AdvancedShufflePanel.tsx
 * @description Advanced shuffle settings panel with modular components
 * @author Caleb Price
 * @version 2.0.0
 * @date 2025-07-22
 *
 * @ChangeLog
 * - 2.0.0: Modularized with custom hook and sub-components
 * - 1.0.0: Initial implementation with Last.fm settings and tag controls
 */

import React from 'react'
import {
  AdvancedShuffleSettings,
  defaultAdvancedSettings,
} from '../../utils/advancedShuffleSettings'
import { useAdvancedShuffleSettings } from '@hooks/business/useAdvancedShuffleSettings'
import { LastFmSection } from './LastFmSection'
import { TagFilteringSection } from './TagFilteringSection'
import { AlbumTypesSection } from './AlbumTypesSection'
import { DiscoverySection } from './DiscoverySection'
import { DiversitySection } from './DiversitySection'
import { SmartFeaturesSection } from './SmartFeaturesSection'
import './AdvancedShufflePanel.css'

interface AdvancedShufflePanelProps {
  settings: AdvancedShuffleSettings
  onSettingsChange: (settings: AdvancedShuffleSettings) => void
  isLastFmAuthenticated: boolean
  accentColor?: string
}

const AdvancedShufflePanel: React.FC<AdvancedShufflePanelProps> = ({
  settings,
  onSettingsChange,
  isLastFmAuthenticated,
  accentColor = 'var(--circuit-color)',
}) => {
  const { localSettings, updateSetting, updateNestedSetting } = useAdvancedShuffleSettings({
    settings,
    onSettingsChange,
  })

  return (
    <div className="advanced-shuffle-panel">
      {/* Last.fm Integration */}
      <LastFmSection
        settings={localSettings}
        onSettingChange={updateSetting}
        isLastFmAuthenticated={isLastFmAuthenticated}
        accentColor={accentColor}
      />

      {/* Tag Filtering */}
      <TagFilteringSection
        settings={localSettings}
        onSettingChange={updateSetting}
        accentColor={accentColor}
      />

      {/* Album Type Preferences */}
      <AlbumTypesSection
        settings={localSettings}
        onNestedSettingChange={updateNestedSetting}
        accentColor={accentColor}
      />

      {/* Release Date & Popularity */}
      <DiscoverySection
        settings={localSettings}
        onSettingChange={updateSetting}
        accentColor={accentColor}
      />

      {/* Diversity Settings */}
      <DiversitySection
        settings={localSettings}
        onSettingChange={updateSetting}
        accentColor={accentColor}
      />

      {/* Smart Features */}
      <SmartFeaturesSection
        settings={localSettings}
        onSettingChange={updateSetting}
        accentColor={accentColor}
      />
    </div>
  )
}

export default AdvancedShufflePanel
