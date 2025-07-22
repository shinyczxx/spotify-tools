/**
 * @file useAdvancedShuffleSettings.ts
 * @description Custom hook for managing advanced shuffle settings
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import { useState, useEffect } from 'react'
import { AdvancedShuffleSettings } from '../../utils/advancedShuffleSettings'

interface UseAdvancedShuffleSettingsProps {
  settings: AdvancedShuffleSettings
  onSettingsChange: (settings: AdvancedShuffleSettings) => void
}

/**
 * Custom hook for managing advanced shuffle settings state
 */
export const useAdvancedShuffleSettings = ({
  settings,
  onSettingsChange,
}: UseAdvancedShuffleSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<AdvancedShuffleSettings>(settings)

  useEffect(() => {
    onSettingsChange(localSettings)
  }, [localSettings, onSettingsChange])

  const updateSetting = (key: keyof AdvancedShuffleSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateNestedSetting = (
    parentKey: keyof AdvancedShuffleSettings,
    childKey: string,
    value: any,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value,
      },
    }))
  }

  return {
    localSettings,
    updateSetting,
    updateNestedSetting,
  }
}