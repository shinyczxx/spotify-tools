/**
 * @file ShuffleSettingsSection.tsx
 * @description Shuffle settings section for playlist combiner
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import type { ShuffleSettings } from 'types'

interface ShuffleSettingsSectionProps {
  shuffleSettings: ShuffleSettings
  onShuffleSettingsChange: (settings: ShuffleSettings) => void
}

/**
 * Shuffle algorithm selection section
 */
export const ShuffleSettingsSection: React.FC<ShuffleSettingsSectionProps> = ({
  shuffleSettings,
  onShuffleSettingsChange,
}) => (
  <div className="shuffle-settings-section">
    <label className="form-field">
      shuffle mode:
      <select
        value={shuffleSettings.algorithm}
        onChange={(e) =>
          onShuffleSettingsChange({
            ...shuffleSettings,
            algorithm: e.target.value as 'random' | 'none',
          })
        }
        className="form-select"
      >
        <option value="random">dumb shuffle</option>
        <option value="none">no shuffle</option>
      </select>
    </label>
  </div>
)