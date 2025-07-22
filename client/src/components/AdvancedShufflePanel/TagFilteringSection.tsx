/**
 * @file TagFilteringSection.tsx
 * @description Tag filtering settings section
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { TagManager } from './TagManager'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface TagFilteringSectionProps {
  settings: AdvancedShuffleSettings
  onSettingChange: (key: keyof AdvancedShuffleSettings, value: any) => void
  accentColor: string
}

/**
 * Tag filtering configuration section
 */
export const TagFilteringSection: React.FC<TagFilteringSectionProps> = ({
  settings,
  onSettingChange,
  accentColor,
}) => {
  const addBlacklistTag = (tag: string) => {
    onSettingChange('blacklistTags', [...settings.blacklistTags, tag])
  }

  const removeBlacklistTag = (tag: string) => {
    onSettingChange('blacklistTags', settings.blacklistTags.filter((t) => t !== tag))
  }

  return (
    <div className="settings-section">
      <div className="settings-section-title">Tag Filtering</div>
      <TagManager
        tags={settings.blacklistTags}
        onAddTag={addBlacklistTag}
        onRemoveTag={removeBlacklistTag}
        accentColor={accentColor}
      />
    </div>
  )
}